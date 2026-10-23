import React from 'react';
import { Project, Submission, Enumerator } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  FileSpreadsheet, 
  TrendingUp, 
  MapPin, 
  Smartphone, 
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Activity
} from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  submissions: Submission[];
  enumerators: Enumerator[];
  onNavigateTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, submissions, enumerators, onNavigateTab }) => {
  const totalTarget = projects.reduce((acc, p) => acc + p.targetInterviews, 0);
  const totalCompleted = projects.reduce((acc, p) => acc + p.completedInterviews, 0);
  const activeEnumeratorsCount = enumerators.filter(e => e.status === 'Active in Field').length;
  const flaggedSubmissionsCount = submissions.filter(s => s.status === 'Flagged').length;

  const zonesMap = [
    { name: 'Lagos Metropolitan Hub', state: 'Lagos', count: 42, lat: 6.5244, lng: 3.3792, status: 'Optimal' },
    { name: 'Kano Commercial Node', state: 'Kano', count: 28, lat: 12.0022, lng: 8.5920, status: 'Active' },
    { name: 'Abuja Federal Capital', state: 'FCT', count: 25, lat: 9.0765, lng: 7.3986, status: 'Optimal' },
    { name: 'Port Harcourt Energy Hub', state: 'Rivers', count: 19, lat: 4.8156, lng: 7.0498, status: 'Syncing' },
    { name: 'Ibadan Western Node', state: 'Oyo', count: 22, lat: 7.3775, lng: 3.9470, status: 'Optimal' }
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#17243A] to-[#941B27] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-white/10 text-white border border-white/20 text-xs px-2.5 py-1 rounded-full font-semibold">
              CMRG Situation Room
            </span>
            <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Field Data Streams Active
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Enterprise Field Intelligence & Quality Monitor</h1>
          <p className="text-gray-300 text-xs max-w-2xl leading-relaxed">
            Real-time tracking of consumer research, price indexing, and public opinion surveys across Nigeria. Ensuring absolute data integrity and verifiable GPS audit trails.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => onNavigateTab('builder')}
            className="bg-[#C8202F] hover:bg-red-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <span>Create New Survey</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigateTab('quality')}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all"
          >
            Review Flagged ({flaggedSubmissionsCount})
          </button>
        </div>
        {/* Subtle background decoration */}
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 pointer-events-none">
          <div className="grid grid-cols-6 gap-2">
            {[...Array(36)].map((_, i) => (
              <div key={i} className="w-6 h-6 bg-white rounded-xs"></div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Interviews</p>
            <h3 className="text-2xl font-bold text-[#17243A] mt-1">{totalCompleted.toLocaleString()} <span className="text-xs text-gray-400 font-normal">/ {totalTarget.toLocaleString()}</span></h3>
            <div className="flex items-center gap-1.5 mt-2 text-emerald-600 text-[11px] font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>76.8% Quota Completion Rate</span>
            </div>
          </div>
          <div className="p-3 bg-red-50 text-[#C8202F] rounded-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Enumerators</p>
            <h3 className="text-2xl font-bold text-[#17243A] mt-1">{activeEnumeratorsCount} <span className="text-xs text-gray-400 font-normal">in field</span></h3>
            <div className="flex items-center gap-1.5 mt-2 text-gray-600 text-[11px] font-semibold">
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>Android Tablets Synced</span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quality Audit Flag</p>
            <h3 className="text-2xl font-bold text-[#17243A] mt-1">{flaggedSubmissionsCount} <span className="text-xs text-gray-400 font-normal">submissions</span></h3>
            <div className="flex items-center gap-1.5 mt-2 text-[#C8202F] text-[11px] font-semibold cursor-pointer" onClick={() => onNavigateTab('quality')}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Requires supervisor review</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Field Studies</p>
            <h3 className="text-2xl font-bold text-[#17243A] mt-1">{projects.filter(p => p.status === 'Active').length} <span className="text-xs text-gray-400 font-normal">running</span></h3>
            <div className="flex items-center gap-1.5 mt-2 text-emerald-600 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>GPS Validation Enforced</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Live Map Simulation & Recent Submissions Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Nigeria Field Map Simulation */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#17243A]">Live Nigeria Field Operations Map</h2>
              <p className="text-xs text-gray-500">Real-time geo-pins of enumerators across geopolitical zones</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gray-100 text-gray-700 font-medium px-2.5 py-1 rounded-lg">6 Zones Active</span>
              <button onClick={() => onNavigateTab('enumerators')} className="text-xs font-semibold text-[#C8202F] hover:underline">View Roster</button>
            </div>
          </div>

          {/* Simulated Map Container */}
          <div className="relative bg-[#17243A] rounded-xl h-80 overflow-hidden flex items-center justify-center shadow-inner">
            {/* Map Grid background lines */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            {/* Simulated Country boundary sketch or regional nodes */}
            <div className="absolute inset-6 flex flex-col justify-between pointer-events-none">
              <div className="flex justify-between text-white/40 text-[10px] font-mono">
                <span>[NORTH-WEST: KANO / KADUNA]</span>
                <span>[NORTH-EAST: BORNO / BAUCHI]</span>
              </div>
              <div className="flex justify-between text-white/40 text-[10px] font-mono">
                <span>[SOUTH-WEST: LAGOS / IBADAN]</span>
                <span>[SOUTH-SOUTH: RIVERS / DELTA]</span>
              </div>
            </div>

            {/* Interactive Pins */}
            {zonesMap.map((zone, idx) => (
              <div 
                key={idx}
                className="absolute group cursor-pointer transition-transform hover:scale-110"
                style={{
                  top: `${25 + (idx * 15)}%`,
                  left: `${20 + (idx * 16)}%`
                }}
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-6 h-6 bg-[#C8202F]/30 rounded-full animate-ping"></span>
                  <div className="w-3.5 h-3.5 bg-[#C8202F] rounded-full border-2 border-white shadow-md flex items-center justify-center">
                    <span className="w-1 h-1 bg-white rounded-full"></span>
                  </div>
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white text-[#17243A] text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                  {zone.name} ({zone.count} enumerators)
                </div>
              </div>
            ))}

            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg text-[11px] text-[#17243A] font-medium flex items-center gap-2 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[#C8202F]" />
              <span>GPS Accuracy: High (&lt; 4m average)</span>
            </div>
          </div>

          {/* Regional Hub Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
            {zonesMap.map((zone, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-center">
                <p className="text-[10px] font-semibold text-gray-500 truncate">{zone.state}</p>
                <p className="text-sm font-bold text-[#17243A] mt-0.5">{zone.count} active</p>
                <span className="text-[9px] text-emerald-600 font-medium block mt-0.5">{zone.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Recent Submissions Ticker */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#17243A]">Live Submissions Stream</h2>
              <p className="text-xs text-gray-500">Incoming data from field tablets</p>
            </div>
            <button onClick={() => onNavigateTab('quality')} className="text-xs font-semibold text-[#C8202F] hover:underline">View All</button>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
            {submissions.map((sub) => (
              <div key={sub.id} className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#17243A]">{sub.enumeratorName}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    sub.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                    sub.status === 'Flagged' ? 'bg-amber-100 text-amber-800' :
                    sub.status === 'Rejected' ? 'bg-red-100 text-[#C8202F]' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {sub.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 truncate">{sub.projectTitle}</p>
                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-200/60">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#C8202F]" />
                    {sub.state}, {sub.lga}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {sub.durationSeconds}s duration
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Projects Quick Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#17243A]">Active Research Studies & Quotas</h2>
            <p className="text-xs text-gray-500">Monitor completion targets across all ongoing fieldwork</p>
          </div>
          <button onClick={() => onNavigateTab('projects')} className="text-xs font-semibold text-[#C8202F] hover:underline">Manage Projects</button>
        </div>

        <div className="space-y-4">
          {projects.map((proj) => {
            const pct = Math.round((proj.completedInterviews / proj.targetInterviews) * 100);
            return (
              <div key={proj.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-[#17243A] text-white px-2 py-0.5 rounded">{proj.code}</span>
                      <h3 className="text-xs font-bold text-[#17243A]">{proj.title}</h3>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">{proj.client} • Sector: {proj.sector}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#17243A]">{proj.completedInterviews.toLocaleString()} / {proj.targetInterviews.toLocaleString()}</span>
                    <span className="text-[11px] text-gray-500 block">({pct}% quota achieved)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#C8202F] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
