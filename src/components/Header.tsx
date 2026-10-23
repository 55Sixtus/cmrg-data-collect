import React, { useState } from 'react';
import { ShieldCheck, Bell, Search, RefreshCw, User, LogOut, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeProjectCount: number;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeProjectCount, onSignOut }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSyncTime('Just now');
    }, 1200);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-xs">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          {/* Red square grid homage to CMRG logo */}
          <div className="grid grid-cols-4 gap-0.5 bg-[#C8202F] p-1 rounded-sm shadow-xs">
            <div className="w-1.5 h-1.5 bg-white rounded-2xs"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-2xs"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-2xs"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-2xs"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-2xs"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-2xs"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-2xs"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-2xs"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#17243A] text-lg tracking-tight">CMRG <span className="text-[#C8202F]">DATA COLLECT</span></span>
              <span className="bg-red-50 text-[#C8202F] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-red-200">v4.8 Enterprise</span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium tracking-wide">
              Tech savvy <span className="text-[#C8202F]">•</span> Data Integrity <span className="text-[#C8202F]">•</span> Actionable insights
            </p>
          </div>
        </div>
      </div>

      {/* Global Search & Quick Actions */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search surveys, enumerators, LGAs, or submissions (Ctrl+K)..."
            className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs text-[#1B2430] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8202F]/20 focus:border-[#C8202F] transition-all"
          />
        </div>
      </div>

      {/* Right Toolbar */}
      <div className="flex items-center gap-4">
        {/* Sync Status Button */}
        <button
          onClick={handleSync}
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
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-[#17243A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            TF
          </div>
          <div className="hidden lg:block text-left">
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
