import React from 'react';
import { TabType } from '../types';
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileCode2, 
  PlaySquare, 
  ShieldAlert, 
  Users, 
  BarChart3, 
  Settings,
  Database,
  Smartphone
} from 'lucide-react';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  flaggedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, flaggedCount }) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Situation Room', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'projects', label: 'Field Projects', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'builder', label: 'Questionnaire Studio', icon: <FileCode2 className="w-4 h-4" /> },
    { id: 'simulator', label: 'Form Test Drive', icon: <PlaySquare className="w-4 h-4" /> },
    { id: 'quality', label: 'Quality & Audit', icon: <ShieldAlert className="w-4 h-4" />, badge: flaggedCount },
    { id: 'enumerators', label: 'Field Enumerators', icon: <Users className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics & Crosstabs', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'System & Roles', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-64 bg-[#17243A] text-white flex flex-col shrink-0 min-h-[calc(100vh-57px)] border-r border-[#17243A]">
      <div className="p-4 border-b border-white/10">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
          Enterprise Research Suite
        </span>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
          <Database className="w-3.5 h-3.5 text-[#C8202F]" />
          <span>ODK Aggregate / Supabase Sync</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#C8202F] text-white shadow-md font-semibold'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-gray-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white text-[#C8202F]' : 'bg-[#C8202F] text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 m-3 bg-white/5 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Smartphone className="w-4 h-4 text-[#C8202F]" />
          <span className="text-xs font-bold text-white">Android Field App</span>
        </div>
        <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
          Deploy surveys securely to enumerator tablets. Offline-first sync enabled.
        </p>
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
          <span>Server status:</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online (99.9%)
          </span>
        </div>
      </div>
    </aside>
  );
};
