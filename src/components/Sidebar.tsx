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
  Smartphone,
  Wrench,
  Rocket,
  MapPin,
  Home
} from 'lucide-react';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  flaggedCount: number;
  onReturnHome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, flaggedCount, onReturnHome }) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Situation Room', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'projects', label: 'Field Projects', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'builder', label: 'Questionnaire Studio', icon: <FileCode2 className="w-4 h-4" /> },
    { id: 'simulator', label: 'Form Test Drive', icon: <PlaySquare className="w-4 h-4" /> },
    { id: 'geolock', label: 'Geo-Lock Manager', icon: <MapPin className="w-4 h-4" /> },
    { id: 'field', label: 'Enumerator Field PWA', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'quality', label: 'Quality & Audit', icon: <ShieldAlert className="w-4 h-4" />, badge: flaggedCount },
    { id: 'enumerators', label: 'Field Enumerators', icon: <Users className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics & Crosstabs', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'deployments', label: 'Deployments & Retention', icon: <Rocket className="w-4 h-4" /> },
    { id: 'settings', label: 'System & Roles', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-64 bg-[#17243A] text-white flex flex-col shrink-0 min-h-[calc(100vh-57px)] border-r border-[#17243A] justify-between">
      <div>
        <div className="p-4 border-b border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Enterprise Research Suite
          </span>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
            <Database className="w-3.5 h-3.5 text-[#C8202F]" />
            <span>ODK Aggregate / Supabase Sync</span>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {onReturnHome && (
            <button
              onClick={onReturnHome}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-white bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 transition-all mb-3 shadow-sm"
              title="Return to CMRG Home Page"
            >
              <Home className="w-4 h-4 text-[#C8202F] bg-white rounded-xs p-0.5" />
              <span>CMRG Home Page</span>
            </button>
          )}
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
      </div>

      <div className="p-4 m-3 space-y-3">
        {/* Bold, Static, Prominent Developer Watermark */}
        <div className="bg-[#C8202F] text-white rounded-xl p-3.5 shadow-lg border border-red-500/50 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-red-100">
            <Wrench className="w-3.5 h-3.5 text-white animate-spin" style={{ animationDuration: '8s' }} />
            <span>APP DEVELOPER</span>
          </div>
          <p className="text-xs font-extrabold text-white tracking-tight">SIXTUS TECH HUB</p>
          <div className="bg-black/20 rounded-lg py-1 px-2 mt-1">
            <span className="text-xs font-mono font-bold text-white tracking-widest">08120678052</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center justify-between text-[10px] text-gray-300 font-medium">
            <span>Server status:</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online (99.9%)
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
