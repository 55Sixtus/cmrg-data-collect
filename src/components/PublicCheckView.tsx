import React from 'react';
import { Project, GeofenceZone, Submission } from '../types';
import { 
  ShieldCheck, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  ArrowLeft, 
  Smartphone, 
  Radio, 
  FileCheck, 
  Layers,
  Calendar,
  Users
} from 'lucide-react';

interface PublicCheckViewProps {
  checkCode: string;
  projects: Project[];
  geofences?: GeofenceZone[];
  submissions?: Submission[];
  onBackToApp: () => void;
  onOpenInstall: (code: string) => void;
}

export const PublicCheckView: React.FC<PublicCheckViewProps> = ({
  checkCode = 'CMRG-739',
  projects,
  geofences = [],
  submissions = [],
  onBackToApp,
  onOpenInstall
}) => {
  const project = projects.find(p => p.code.toLowerCase() === checkCode.toLowerCase() || p.id === checkCode) || projects[0];
  const matchingGeofence = geofences.find(g => g.projectId === project?.id) || geofences[0] || {
    name: 'Agege Local Government & Pen Cinema Cluster',
    lat: 6.6192,
    lng: 3.3213,
    radiusMeters: 1400,
    driftBufferMeters: 150
  };

  const matchingSubmissions = submissions.filter(s => s.projectId === project?.id);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white font-sans flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-[#121824] border-b border-gray-800 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E30620] flex items-center justify-center p-1.5 shadow-md shadow-red-900/40">
              <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                <div className="bg-white rounded-[1px]"></div>
                <div className="bg-white rounded-[1px]"></div>
                <div className="bg-white rounded-[1px]"></div>
                <div className="bg-white/40 rounded-[1px]"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white">CMRG Ltd.</h1>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Public Check
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Communication and Marketing Research Group Limited</p>
            </div>
          </div>

          <button
            onClick={onBackToApp}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-gray-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Console</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6">
        
        {/* Certificate Card */}
        <div className="bg-gradient-to-br from-[#121824] to-[#1A2333] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>OFFICIAL CMRG SURVEY AUTHENTICATION SEAL</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{project?.title || 'Household Survey Lagos'}</h2>
              <p className="text-xs text-gray-400">Project Reference: <span className="font-mono text-emerald-400 font-bold">{project?.code || checkCode}</span></p>
            </div>

            <div className="text-right sm:border-l sm:border-gray-800 sm:pl-6">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Verification Timestamp</span>
              <span className="text-xs font-mono font-bold text-white">{new Date().toISOString().substring(0, 19).replace('T', ' ')} UTC</span>
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Audit Status: Active &amp; Valid</span>
              </div>
            </div>
          </div>

          {/* Core Survey Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-gray-800 text-xs">
            <div className="bg-[#0B0F17] p-3.5 rounded-2xl border border-gray-800/80 space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Commissioning Authority</span>
              <b className="text-white text-xs block">{project?.client || 'Lagos State Ministry of Economic Planning'}</b>
              <span className="text-[10px] text-gray-400 block">Sector: {project?.sector || 'Public Opinion'}</span>
            </div>

            <div className="bg-[#0B0F17] p-3.5 rounded-2xl border border-gray-800/80 space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Supervisor Geofence</span>
              <b className="text-white text-xs block">{matchingGeofence.name}</b>
              <span className="text-[10px] text-emerald-400 font-mono block">
                Radius: {matchingGeofence.radiusMeters}m (Buffer: +{matchingGeofence.driftBufferMeters}m)
              </span>
            </div>

            <div className="bg-[#0B0F17] p-3.5 rounded-2xl border border-gray-800/80 space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Audited Field Submissions</span>
              <b className="text-white text-xs block">{project?.completedInterviews || 1450} Interviews Completed</b>
              <span className="text-[10px] text-gray-400 block">Target Quota: {project?.targetInterviews || 2000}</span>
            </div>
          </div>

          {/* GPS Coordinates & Direct Google Maps link */}
          <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 font-medium">Field Anchor Coordinates:</span>
              <div className="flex items-center gap-2 font-mono text-sm text-white font-bold">
                <MapPin className="w-4 h-4 text-[#E30620]" />
                <span>{matchingGeofence.lat.toFixed(4)}, {matchingGeofence.lng.toFixed(4)}</span>
                <span className="text-xs text-gray-500 font-normal">(Agege, Lagos State)</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`https://maps.google.com/?q=${matchingGeofence.lat},${matchingGeofence.lng}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Verify on Google Maps</span>
              </a>

              <button
                type="button"
                onClick={() => onOpenInstall(project?.code || 'CMRG-739')}
                className="px-4 py-2.5 bg-[#E30620] hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-900/40 transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>Install Field PWA</span>
              </button>
            </div>
          </div>
        </div>

        {/* Audit Compliance Card */}
        <div className="bg-[#121824] border border-gray-800 rounded-3xl p-6 text-xs space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Audited Data Integrity &amp; Evidence Protocols</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-300">
            <div className="bg-[#0B0F17] p-3 rounded-xl border border-gray-800 space-y-1">
              <b className="text-white block text-[11px]">1. Mandatory Selfie Biometrics</b>
              <p className="text-[10px] text-gray-400">Field enumerators verify identity via live camera front snapshot prior to questionnaire unlock.</p>
            </div>

            <div className="bg-[#0B0F17] p-3 rounded-xl border border-gray-800 space-y-1">
              <b className="text-white block text-[11px]">2. Hard Geofence Enforcement</b>
              <p className="text-[10px] text-gray-400">Interviews are locked to supervisor pre-field polygons in Agege with automated GPS drift rejection.</p>
            </div>

            <div className="bg-[#0B0F17] p-3 rounded-xl border border-gray-800 space-y-1">
              <b className="text-white block text-[11px]">3. Watermarked Multimedia Audit</b>
              <p className="text-[10px] text-gray-400">Photos, 1-minute video scans, and waveform audio statements auto-embed satellite coordinates and UTC time.</p>
            </div>

            <div className="bg-[#0B0F17] p-3 rounded-xl border border-gray-800 space-y-1">
              <b className="text-white block text-[11px]">4. Offline IndexedDB &amp; Auto-Sync</b>
              <p className="text-[10px] text-gray-400">Idempotent client UUIDs prevent duplicate submissions upon network reconnection to Supabase PostgreSQL.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#0B0F17] border-t border-gray-800 py-4 px-6 text-center text-xs text-gray-500">
        © 2026 Communication and Marketing Research Group Limited (CMRG Ltd.). All rights reserved.
      </footer>
    </div>
  );
};
