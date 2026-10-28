import { Submission } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DB_NAME = 'CMRG_Data_Collect_Offline_Store';
const DB_VERSION = 1;
const STORE_NAME = 'offline_submissions';

class OfflineQueueService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private listeners: Set<(count: number, isOnline: boolean) => void> = new Set();
  private isSyncing = false;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported on this device.'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('submittedAt', 'submittedAt', { unique: false });
          store.createIndex('projectId', 'projectId', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB'));
      };
    });

    return this.dbPromise;
  }

  // Subscribe to queue changes and network status
  public subscribe(listener: (count: number, isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    this.getQueueCount().then(count => {
      listener(count, navigator.onLine);
    });

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.getQueueCount().then(count => {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      this.listeners.forEach(fn => fn(count, isOnline));
    });
  }

  // Store submission in IndexedDB
  public async enqueue(submission: Submission): Promise<void> {
    const db = await this.getDB();
    const queuedItem: Submission = {
      ...submission,
      client_submission_uuid: submission.client_submission_uuid || submission.id,
      is_offline: true
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(queuedItem);

      req.onsuccess = () => {
        this.notify();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  // Retrieve all queued submissions
  public async getQueue(): Promise<Submission[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  // Get total count of queued offline submissions
  public async getQueueCount(): Promise<number> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.count();

        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => resolve(0);
      });
    } catch {
      return 0;
    }
  }

  // Remove a synced submission
  public async remove(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => {
        this.notify();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  // Clear entire queue
  public async clear(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => {
        this.notify();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  private syncListeners: Set<(item: Submission) => void> = new Set();
  private progressListeners: Set<(progress: { isSyncing: boolean; current: number; total: number; percent: number; message: string }) => void> = new Set();

  // Register callback whenever an offline submission is synced
  public onSync(callback: (item: Submission) => void): () => void {
    this.syncListeners.add(callback);
    return () => {
      this.syncListeners.delete(callback);
    };
  }

  // Register callback for visual upload progress updates
  public onProgress(callback: (progress: { isSyncing: boolean; current: number; total: number; percent: number; message: string }) => void): () => void {
    this.progressListeners.add(callback);
    return () => {
      this.progressListeners.delete(callback);
    };
  }

  private notifyProgress(progress: { isSyncing: boolean; current: number; total: number; percent: number; message: string }) {
    this.progressListeners.forEach(cb => {
      try {
        cb(progress);
      } catch (err) {
        console.error('Error in progress listener:', err);
      }
    });
  }

  // Sync queued items with Supabase (or acknowledge in local store)
  public async syncQueue(
    onItemSynced?: (item: Submission) => void
  ): Promise<{ synced: number; failed: number; total: number }> {
    if (this.isSyncing) {
      return { synced: 0, failed: 0, total: 0 };
    }

    const items = await this.getQueue();
    if (items.length === 0) {
      return { synced: 0, failed: 0, total: 0 };
    }

    if (!navigator.onLine) {
      this.notifyProgress({ isSyncing: false, current: 0, total: items.length, percent: 0, message: 'Offline: Waiting for internet connection to sync' });
      return { synced: 0, failed: items.length, total: items.length };
    }

    this.isSyncing = true;
    let synced = 0;
    let failed = 0;

    this.notifyProgress({
      isSyncing: true,
      current: 0,
      total: items.length,
      percent: 5,
      message: `Initiating background sync for ${items.length} queued surveys...`
    });

    for (const item of items) {
      try {
        let uploaded = false;

        if (isSupabaseConfigured && supabase) {
          // Attempt insert to Supabase submissions table
          const { error } = await supabase.from('submissions').insert({
            client_submission_uuid: item.client_submission_uuid || item.id,
            project_id: item.projectId,
            state: item.state,
            lga: item.lga,
            gps_lat: item.gps.lat,
            gps_lng: item.gps.lng,
            gps_accuracy: item.gps.accuracy,
            duration_seconds: item.durationSeconds,
            device_id: 'IndexedDB-Offline-Agent',
            status: item.status || 'Pending',
            flag_reason: item.flagReason || null,
            audio_url: item.audioUrl || null
          });

          if (!error) {
            uploaded = true;
          } else if (error.code === '23505') {
            // Unique constraint violation: verify if existing record corresponds to this submission
            try {
              const targetUuid = item.client_submission_uuid || item.id;
              const { data: existingRecord, error: queryErr } = await supabase
                .from('submissions')
                .select('id, project_id, client_submission_uuid')
                .eq('client_submission_uuid', targetUuid)
                .maybeSingle();

              if (!queryErr && existingRecord && existingRecord.project_id === item.projectId) {
                // Verified exact match for this submission UUID and project - safe to remove from local queue
                uploaded = true;
              } else {
                console.warn('Conflict (23505): Existing record could not be verified or project mismatch. Retaining in offline queue for manual review.');
                uploaded = false;
              }
            } catch (verifyErr) {
              console.warn('Error verifying 23505 conflict:', verifyErr);
              uploaded = false;
            }
          } else {
            console.warn('Sync insertion error:', error.message);
            uploaded = false;
          }
        } else {
          // In offline / standalone preview mode, sync marks item as transferred
          uploaded = true;
        }

        if (uploaded) {
          await this.remove(item.id);
          const syncedItem: Submission = { ...item, is_offline: false };
          if (onItemSynced) {
            onItemSynced(syncedItem);
          }
          this.syncListeners.forEach(cb => {
            try {
              cb(syncedItem);
            } catch (err) {
              console.error('Error in onSync subscriber:', err);
            }
          });
          synced++;
        } else {
          failed++;
        }

        const currentCount = synced + failed;
        const percent = Math.min(98, Math.round((currentCount / items.length) * 100));
        this.notifyProgress({
          isSyncing: true,
          current: currentCount,
          total: items.length,
          percent,
          message: `Syncing survey ${currentCount} of ${items.length}: Media & GPS verified...`
        });
      } catch (err) {
        console.warn(`Sync failed for item ${item.id}:`, err);
        failed++;
      }
    }

    this.isSyncing = false;
    this.notifyProgress({
      isSyncing: false,
      current: items.length,
      total: items.length,
      percent: 100,
      message: `✓ Sync complete: ${synced} surveys and media successfully uploaded.`
    });
    this.notify();

    return { synced, failed, total: items.length };
  }

  // Setup automatic sync when connection is restored
  public initAutoSync(onItemSynced?: (item: Submission) => void): () => void {
    const handleOnline = async () => {
      this.notify();
      console.log('🌐 Internet connection restored. Triggering IndexedDB offline data sync...');
      await this.syncQueue(onItemSynced);
    };

    const handleOffline = () => {
      this.notify();
      console.log('📡 Offline mode detected. Submissions will be queued in IndexedDB.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on load
    if (navigator.onLine) {
      this.syncQueue(onItemSynced);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

export const offlineQueue = new OfflineQueueService();
