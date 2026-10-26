import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Bell, 
  Search, 
  RefreshCw, 
  User, 
  LogOut, 
  Menu, 
  FolderKanban, 
  Users, 
  FileSpreadsheet, 
  ArrowRight,
  X,
  Wifi,
  WifiOff,
  CloudUpload,
  Database,
  QrCode
} from 'lucide-react';
import { Project, Submission, Enumerator, TabType } from '../types';
import { offlineQueue } from '../services/offlineQueue';

interface HeaderProps {
  activeProjectCount: number;
  projects: Project[];
  submissions: Submission[];
  enumerators: Enumerator[];
  onSignOut: () => void;
  onToggleSidebar: () => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenWhatsAppConnect?: (projectCode?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeProjectCount, 
  projects, 
  submissions, 
  enumerators, 
  onSignOut, 
  onToggleSidebar,
  onNavigateTab,
  onOpenWhatsAppConnect
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  
  // Offline Data Queue State
  const [offlineCount, setOfflineCount] = useState(0);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Subscribe to IndexedDB Offline Queue and Network changes
  useEffect(() => {
    const unsubscribe = offlineQueue.subscribe((count, online) => {
      setOfflineCount(count);
      setIsOnline(online);
    });

    const cleanupAutoSync = offlineQueue.initAutoSync();

    return () => {
      unsubscribe();
      cleanupAutoSync();
    };
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const res = await offlineQueue.syncQueue();
      setLastSyncTime('Just now');
      if (res.synced > 0) {
        console.log(`Synced ${res.synced} offline submissions from IndexedDB to database.`);
      }
    } finally {
      setTimeout(() => {
        setSyncing(false);
      }, 800);
    }
  };

  // Filter matching items
  const query = searchQuery.toLowerCase().trim();
  const matchingProjects = query ? projects.filter(p => p.title.toLowerCase().includes(query) || p.code.toLowerCase().includes(query) || p.client.toLowerCase().includes(query)) : [];
  const matchingSubmissions = query ? submissions.filter(s => s.enumeratorName.toLowerCase().includes(query) || s.id.toLowerCase().includes(query) || s.state.toLowerCase().includes(query) || s.lga.toLowerCase().includes(query)) : [];
  const matchingEnumerators = query ? enumerators.filter(e => e.name.toLowerCase().includes(query) || e.id.toLowerCase().includes(query) || e.state.toLowerCase().includes(query)) : [];

  const hasResults = matchingProjects.length > 0 || matchingSubmissions.length > 0 || matchingEnumerators.length > 0;

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-gray-600 hover:text-[#17243A] hover:bg-gray-100 rounded-lg transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <img 
            src="/assets/aistudio/cmrg_logo_clean.png" 
            alt="CMRG Ltd Logo" 
            className="h-8 sm:h-9 w-auto object-contain"
          />
          <span className="hidden sm:inline-block bg-red-50 text-[#C8202F] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-red-200">v4.8 Enterprise</span>
        </div>
      </div>

      {/* Global Search Bar with Live Dropdown */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative" ref={searchRef}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, submissions, enumerators, LGAs (Ctrl+K)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg pl-9 pr-9 py-2 text-xs text-[#1B2430] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8202F]/20 focus:border-[#C8202F] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchFocused && query && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto divide-y divide-gray-100">
            {!hasResults ? (
              <div className="p-6 text-center text-gray-500 text-xs">
                No matching research records found for "{searchQuery}".
              </div>
            ) : (
              <div className="p-2 space-y-3">
                {/* Projects Section */}
                {matchingProjects.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 rounded-md">
                      Projects ({matchingProjects.length})
                    </div>
                    {matchingProjects.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onNavigateTab('projects');
                          setIsSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="px-3 py-2 hover:bg-red-50/50 rounded-lg cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <FolderKanban className="w-4 h-4 text-[#C8202F]" />
                          <div>
                            <p className="text-xs font-bold text-[#17243A] group-hover:text-[#C8202F] transition-colors">{p.title}</p>
                            <span className="text-[10px] text-gray-500">{p.code} • {p.client}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#C8202F]" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Submissions Section */}
                {matchingSubmissions.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 rounded-md">
                      Submissions ({matchingSubmissions.length})
                    </div>
                    {matchingSubmissions.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onNavigateTab('quality');
                          setIsSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="px-3 py-2 hover:bg-red-50/50 rounded-lg cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          <div>
                            <p className="text-xs font-bold text-[#17243A] group-hover:text-[#C8202F] transition-colors">{s.enumeratorName} ({s.id})</p>
                            <span className="text-[10px] text-gray-500">{s.state}, {s.lga} • {s.status}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#C8202F]" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Enumerators Section */}
                {matchingEnumerators.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 rounded-md">
                      Enumerators ({matchingEnumerators.length})
                    </div>
                    {matchingEnumerators.map(e => (
                      <div
                        key={e.id}
                        onClick={() => {
                          onNavigateTab('enumerators');
                          setIsSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="px-3 py-2 hover:bg-red-50/50 rounded-lg cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-xs font-bold text-[#17243A] group-hover:text-[#C8202F] transition-colors">{e.name} ({e.id})</p>
                            <span className="text-[10px] text-gray-500">{e.state} State • {e.status}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#C8202F]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Toolbar */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Offline Queue Indicator Badge (IndexedDB) */}
        {offlineCount > 0 ? (
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
            title="Click to trigger manual push from IndexedDB to server"
          >
            <CloudUpload className={`w-3.5 h-3.5 text-amber-700 ${syncing ? 'animate-bounce' : ''}`} />
            <span>{syncing ? 'Syncing Queue...' : `${offlineCount} Queued Offline (Sync)`}</span>
          </button>
        ) : !isOnline ? (
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-[#C8202F] px-2.5 py-1.5 rounded-lg text-xs font-semibold">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Offline Mode</span>
          </div>
        ) : null}

        {/* WhatsApp-Style Fast Pair QR Connect Button */}
        {onOpenWhatsAppConnect && (
          <button
            onClick={() => onOpenWhatsAppConnect()}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all active:scale-[0.98]"
            title="Scan QR to connect field enumerators (WhatsApp-Style)"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Link Devices (QR)</span>
            <span className="sm:hidden">Pair QR</span>
          </button>
        )}

        {/* Sync Status Button */}
        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="hidden sm:flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 transition-colors"
          title="Server Sync Status"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#C8202F] ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : `Synced (${lastSyncTime})`}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-[#17243A] hover:bg-gray-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#C8202F] rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-3.5 bg-[#17243A] text-white flex items-center justify-between">
                <span className="font-semibold text-xs uppercase tracking-wider">Field Operations Alerts</span>
                <span className="bg-[#C8202F] text-white text-[10px] px-2 py-0.5 rounded-full font-medium">3 New</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                <div className="p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                    <div>
                      <p className="text-xs font-semibold text-[#1B2430]">Speeder Flagged in Kano</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Enumerator ENU-208 completed survey in 184s.</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">10 mins ago</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C8202F] mt-1.5 shrink-0"></span>
                    <div>
                      <p className="text-xs font-semibold text-[#1B2430]">GPS Mismatch Alert</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Submission sub-8925 flagged for 45km displacement.</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-200">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#17243A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            TF
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-[#1B2430]">Dr. Tunde Fashola</p>
            <p className="text-[10px] text-gray-500 font-medium">Lead Research Director</p>
          </div>
          <button
            onClick={onSignOut}
            className="p-2 text-gray-400 hover:text-[#C8202F] hover:bg-red-50 rounded-lg transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
