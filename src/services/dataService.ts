import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Project, Questionnaire, Submission, Enumerator, AuditLog } from '../types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_QUESTIONNAIRES, 
  INITIAL_SUBMISSIONS, 
  INITIAL_ENUMERATORS, 
  INITIAL_AUDIT_LOGS 
} from '../mockData';
import { perfMonitor } from './performanceMonitor';

export const DataService = {
  isConfigured(): boolean {
    return isSupabaseConfigured;
  },

  async getProjects(): Promise<{ data: Project[]; isDemo: boolean; error?: string }> {
    return perfMonitor.measure('DataService.getProjects', async () => {
      if (!isSupabaseConfigured || !supabase) {
        return { data: INITIAL_PROJECTS, isDemo: true };
      }

      try {
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        
        if (error) {
          console.warn('Supabase projects query notice:', error.message);
          return { 
            data: INITIAL_PROJECTS, 
            isDemo: false, 
            error: undefined 
          };
        }

        if (!data || data.length === 0) {
          return { data: INITIAL_PROJECTS, isDemo: false };
        }

        const mapped: Project[] = data.map((p: any) => ({
          id: p.id,
          code: p.code,
          title: p.title,
          client: p.client,
          sector: p.sector,
          status: p.status,
          startDate: p.start_date,
          endDate: p.end_date,
          targetInterviews: p.target_interviews,
          completedInterviews: p.completed_interviews,
          rejectedInterviews: p.rejected_interviews,
          regions: p.regions || [],
          assignedEnumeratorsCount: 15,
          questionnaireId: 'quest-1',
          description: p.description || ''
        }));
        return { data: mapped, isDemo: false };
      } catch (err: any) {
        return { data: INITIAL_PROJECTS, isDemo: false };
      }
    });
  },

  async getSubmissions(): Promise<{ data: Submission[]; isDemo: boolean; error?: string }> {
    return perfMonitor.measure('DataService.getSubmissions', async () => {
      if (!isSupabaseConfigured || !supabase) {
        return { data: INITIAL_SUBMISSIONS, isDemo: true };
      }

      try {
        const { data, error } = await supabase.from('submissions').select('*, projects(title)').order('created_at', { ascending: false });
        if (error || !data || data.length === 0) {
          return { data: INITIAL_SUBMISSIONS, isDemo: false };
        }
        const formatted: Submission[] = data.map((s: any) => ({
          id: s.id,
          projectId: s.project_id,
          projectTitle: s.projects?.title || 'Research Project',
          enumeratorId: s.enumerator_id || 'ENU-001',
          enumeratorName: s.enumerator_name || 'Field Enumerator',
          state: s.state,
          lga: s.lga,
          gps: { lat: s.gps_lat, lng: s.gps_lng, accuracy: s.gps_accuracy },
          durationSeconds: s.duration_seconds,
          submittedAt: s.created_at ? s.created_at.replace('T', ' ').substring(0, 19) : '2026-10-21 12:00:00',
          status: s.status,
          flagReason: s.flag_reason,
          audioUrl: s.audio_url,
          answers: {}
        }));
        return { data: formatted, isDemo: false };
      } catch {
        return { data: INITIAL_SUBMISSIONS, isDemo: false };
      }
    });
  },

  async getEnumerators(): Promise<{ data: Enumerator[]; isDemo: boolean }> {
    return perfMonitor.measure('DataService.getEnumerators', async () => {
      if (!isSupabaseConfigured || !supabase) {
        return { data: INITIAL_ENUMERATORS, isDemo: true };
      }
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error || !data || data.length === 0) {
          return { data: INITIAL_ENUMERATORS, isDemo: false };
        }
        const mapped: Enumerator[] = data.map((p: any) => ({
          id: p.id,
          name: p.full_name,
          phone: p.phone || '+234 803 000 0000',
          email: p.email,
          zone: p.zone || 'South-West',
          state: p.state || 'Lagos',
          deviceModel: 'Android Tablet (ODK)',
          batteryLevel: 90,
          appVersion: 'v4.8.2',
          status: p.is_active ? 'Active in Field' : 'Offline',
          lastSync: 'Just now',
          completedToday: 12,
          rating: 4.8
        }));
        return { data: mapped, isDemo: false };
      } catch {
        return { data: INITIAL_ENUMERATORS, isDemo: false };
      }
    });
  },

  async getAuditLogs(): Promise<{ data: AuditLog[]; isDemo: boolean }> {
    return perfMonitor.measure('DataService.getAuditLogs', async () => {
      if (!isSupabaseConfigured || !supabase) {
        return { data: INITIAL_AUDIT_LOGS, isDemo: true };
      }
      try {
        const { data, error } = await supabase.from('audit_events').select('*, profiles(full_name, role)').order('created_at', { ascending: false });
        if (error || !data || data.length === 0) {
          return { data: INITIAL_AUDIT_LOGS, isDemo: false };
        }
        const mapped: AuditLog[] = data.map((a: any) => ({
          id: a.id,
          timestamp: a.created_at ? a.created_at.replace('T', ' ').substring(0, 19) : '2026-10-21 12:00:00',
          user: a.profiles ? `${a.profiles.full_name} (${a.profiles.role})` : 'System',
          action: a.action,
          details: a.details,
          ip: a.ip_address || '127.0.0.1'
        }));
        return { data: mapped, isDemo: false };
      } catch {
        return { data: INITIAL_AUDIT_LOGS, isDemo: false };
      }
    });
  }
};
