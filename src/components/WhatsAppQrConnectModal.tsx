import React, { useState } from 'react';
import { Project, Enumerator } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Radio, 
  ArrowRight, 
  X, 
  Sparkles,
  RefreshCw,
  Check
} from 'lucide-react';

interface WhatsAppQrConnectModalProps {
  projects: Project[];
  enumerators?: Enumerator[];
  initialProjectCode?: string;
  onClose: () => void;
  onSimulatePhoneScan?: (code: string, pin: string, title: string, enuId: string) => void;
}

export const WhatsAppQrConnectModal: React.FC<WhatsAppQrConnectModalProps> = ({
  projects,
  enumerators = [],
  initialProjectCode,
  onClose,
  onSimulatePhoneScan
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects.find(p => p.code === initialProjectCode)?.id || projects[0]?.id || 'proj-1'
  );
  const [assignedEnuId, setAssignedEnuId] = useState<string>('CMRG-ENU-001');
  const [copied, setCopied] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const accessPin = 'CMRG-2026-NGR';

  // Construct real URL for QR scan
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://app.ourfield.com';
  const qrConnectUrl = `${currentOrigin}?install=${selectedProject.code}&pin=${accessPin}&title=${encodeURIComponent(selectedProject.title)}&enu=${assignedEnuId}&connect=true`;
  const displayBrandUrl = `app.ourfield.com/install/${selectedProject.code}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(qrConnectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#111827] text-white rounded-3xl max-w-4xl w-full border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header - WhatsApp Web inspired top bar */}
        <div className="bg-[#17243A] px-6 py-4 border-b border-white/10 flex items-center justify-between">
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
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                  CMRG DATA COLLECT <span className="text-[#E30620]">WEB CONNECT</span>
                </h2>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse" /> WhatsApp-Style Fast Pair
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Scan with phone camera to install and auto-link project — zero typing required on the field.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Step Instructions + Right WhatsApp-Style QR Card */}
        <div className="p-6 sm:p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column (7 cols): Step Instructions */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#E30620] uppercase tracking-wider">
                Instant Field Enumerator Pairing
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                To link a phone to this research study:
              </h3>
            </div>

            <ol className="space-y-4 text-xs sm:text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#E30620] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                  1
                </span>
                <div>
                  <p className="font-bold text-white">Open Camera or QR scanner on enumerator's phone</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Works on any Android phone or iPhone — no special scanner app needed.</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#E30620] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                  2
                </span>
                <div>
                  <p className="font-bold text-white">Point phone camera at this QR code</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">A banner will appear on their phone screen. Tap it to open their browser.</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#E30620] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                  3
                </span>
                <div>
                  <p className="font-bold text-white">Tap "Click to Install App & Connect"</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Like WhatsApp <i>"Link a Device"</i> — the app installs to their phone home screen and <b>auto-connects this study and access PIN</b>.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                  4
                </span>
                <div>
                  <p className="font-bold text-white">Ready for Field Work!</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Enumerator snaps their verification selfie and immediately starts collecting interviews offline. No typing long codes!
                  </p>
                </div>
              </li>
            </ol>

            {/* Project & Enumerator Pairing Config */}
            <div className="bg-[#17243A]/80 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-gray-300">Target Study to Auto-Link:</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-[#0B0F17] border border-white/20 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-[#E30620]"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.title.slice(0, 36)}...
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                <span className="text-gray-400">Auto-Assigned Surveyor ID:</span>
                <input
                  type="text"
                  value={assignedEnuId}
                  onChange={(e) => setAssignedEnuId(e.target.value)}
                  className="bg-[#0B0F17] border border-white/20 rounded-lg px-2.5 py-1 text-xs font-mono text-emerald-400 font-bold w-40"
                  placeholder="e.g. CMRG-ENU-001"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                <span>Embedded Access PIN:</span>
                <span className="font-mono text-white font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10">{accessPin}</span>
              </div>
            </div>

            {/* Test Simulation Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSimulatePhoneScan) {
                    onSimulatePhoneScan(selectedProject.code, accessPin, selectedProject.title, assignedEnuId);
                  } else {
                    window.location.href = `/?install=${selectedProject.code}&pin=${accessPin}&title=${encodeURIComponent(selectedProject.title)}&enu=${assignedEnuId}&connect=true`;
                  }
                }}
                className="flex-1 py-3 bg-[#E30620] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Test Phone Auto-Connect Screen (Simulate Scan)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-white/10"
                title="Copy pair link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): WhatsApp-Style QR Card */}
          <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
            
            <div className="bg-white p-5 rounded-3xl shadow-2xl relative border-4 border-[#E30620]/30 w-72 h-72 flex flex-col items-center justify-center">
              {/* WhatsApp-Style Center Brand Icon */}
              <div className="relative w-full h-full bg-white flex flex-col items-center justify-center p-2 rounded-2xl">
                {/* SVG High-Contrast QR Code */}
                <div className="relative flex items-center justify-center">
                  <QrCode className="w-56 h-56 text-[#0B0F17]" />
                  {/* Center Emblem */}
                  <div className="absolute w-12 h-12 bg-[#E30620] rounded-xl flex items-center justify-center border-2 border-white shadow-md">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Pulsing indicator tag */}
              <div className="absolute -bottom-3 bg-[#0B0F17] border border-emerald-500/50 text-emerald-400 text-[10px] font-mono font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>POINT PHONE CAMERA HERE</span>
              </div>
            </div>

            <div className="space-y-1 max-w-xs">
              <p className="text-xs font-mono font-bold text-gray-200">
                {displayBrandUrl}
              </p>
              <p className="text-[11px] text-gray-400">
                Code will auto-pair <b className="text-white">{selectedProject.code}</b> without typing any credentials.
              </p>
            </div>

            {/* Connected Field Devices Roster (Live Simulation) */}
            <div className="bg-[#17243A]/60 border border-white/10 rounded-2xl p-3 w-full text-left space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Recently Paired Devices:</span>
              </span>
              <div className="text-[11px] space-y-1 text-gray-300">
                <div className="flex items-center justify-between">
                  <span>📱 Samsung Galaxy A14 (Kwame Asante)</span>
                  <span className="text-emerald-400 text-[10px] font-mono">Linked • Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>📱 Tecno Camon 20 (Amina Bello)</span>
                  <span className="text-emerald-400 text-[10px] font-mono">Linked • 3m ago</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-[#0B0F17] px-6 py-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <span>Communication and Marketing Research Group Limited (CMRG Ltd.)</span>
          <span className="font-mono text-gray-500">Fast-Pair Protocol v2.6 • Offline-First</span>
        </div>

      </div>
    </div>
  );
};
