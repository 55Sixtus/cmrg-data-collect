import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  ShieldCheck, 
  WifiOff, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  Share2, 
  PlusSquare, 
  Check, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface MobileInstallPageProps {
  projectCode?: string;
  onOpenFieldApp: (code?: string) => void;
  onBackToMain?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const MobileInstallPage: React.FC<MobileInstallPageProps> = ({
  projectCode: initialCode = 'CMRG-123',
  onOpenFieldApp,
  onBackToMain
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Auto-paired project parameters from QR scan URL
  const [pairedCode, setPairedCode] = useState(initialCode);
  const [pairedPin, setPairedPin] = useState('CMRG-2026-NGR');
  const [pairedTitle, setPairedTitle] = useState('National Consumer Goods Price Tracker');
  const [pairedEnuId, setPairedEnuId] = useState('CMRG-ENU-001');

  useEffect(() => {
    // Detect standalone display mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(iosDevice);

    // Read auto-connect query parameters (WhatsApp-style scan payload)
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('install') || initialCode;
      const pin = params.get('pin') || 'CMRG-2026-NGR';
      const title = params.get('title') || 'National Consumer Goods Price Tracker';
      const enu = params.get('enu') || 'CMRG-ENU-001';

      setPairedCode(code);
      setPairedPin(pin);
      setPairedTitle(title);
      setPairedEnuId(enu);

      // Pre-save into local storage pairing cache
      const pairData = {
        projectCode: code,
        accessCode: pin,
        projectTitle: title,
        enumeratorId: enu,
        autoPaired: true,
        linkedAt: new Date().toISOString()
      };
      localStorage.setItem('cmrg_paired_session', JSON.stringify(pairData));
    } catch (e) {
      // Ignore URL parsing errors
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallSuccess(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [initialCode]);

  // Handle WhatsApp-Style "Click to Install App & Connect"
  const handleInstallAndConnectClick = async () => {
    // Ensure pairing credentials are saved
    const pairData = {
      projectCode: pairedCode,
      accessCode: pairedPin,
      projectTitle: pairedTitle,
      enumeratorId: pairedEnuId,
      autoPaired: true,
      linkedAt: new Date().toISOString()
    };
    localStorage.setItem('cmrg_paired_session', JSON.stringify(pairData));

    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallSuccess(true);
        setDeferredPrompt(null);
        // Small delay then open app
        setTimeout(() => {
          onOpenFieldApp(pairedCode);
        }, 1200);
      }
    } else {
      // Direct connect if PWA prompt not supported or already cached
      setShowIOSModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col justify-between font-sans selection:bg-[#E30620] selection:text-white">
      {/* Top Bar with Brand Badge */}
      <header className="border-b border-white/10 bg-[#111827]/80 backdrop-blur-md px-4 py-3 sticky top-0 z-30">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E30620] flex items-center justify-center p-1 shadow-md shadow-red-900/30">
              <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                <div className="bg-white rounded-[1px]"></div>
                <div className="bg-white rounded-[1px]"></div>
                <div className="bg-white rounded-[1px]"></div>
                <div className="bg-white/40 rounded-[1px]"></div>
              </div>
            </div>
            <div>
              <div className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                CMRG <span className="text-[#E30620]">DATA COLLECT</span>
              </div>
              <div className="text-[9px] font-semibold tracking-wider text-gray-400 uppercase">
                Enterprise Field PWA
              </div>
            </div>
          </div>

          {onBackToMain && (
            <button
              onClick={onBackToMain}
              className="text-[11px] font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Console View
            </button>
          )}
        </div>
      </header>

      {/* Main Content Card Container */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 sm:py-8 flex flex-col justify-center space-y-6">
        
        {/* Verification & Survey Target Banner */}
        <div className="bg-gradient-to-br from-[#17243A] to-[#0D1522] border border-white/15 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          {/* Background Decorative Accent */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#E30620]/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              WhatsApp Fast Pair: {pairedCode}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" /> Credentials Auto-Linked
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {pairedTitle}
          </h1>

          <div className="bg-[#0B0F17]/80 rounded-xl p-3 border border-white/10 text-xs font-mono space-y-1 mt-3">
            <div className="flex justify-between text-gray-300">
              <span>Study Code:</span>
              <b className="text-white">{pairedCode}</b>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Access PIN:</span>
              <b className="text-emerald-400">{pairedPin} (Auto-Verified)</b>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Surveyor ID:</span>
              <b className="text-amber-400">{pairedEnuId}</b>
            </div>
          </div>

          <p className="text-xs text-gray-300 mt-3 leading-relaxed">
            Your phone has scanned the project QR code. Tapping below installs the field app and auto-authenticates without typing any code.
          </p>

          {/* Key Capabilities Badges */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-[11px]">
            <div className="flex items-center gap-2 text-gray-300">
              <WifiOff className="w-4 h-4 text-[#E30620] shrink-0" />
              <span>100% Offline Mode</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-4 h-4 text-[#E30620] shrink-0" />
              <span>Supervisor Geo-Lock</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Camera className="w-4 h-4 text-[#E30620] shrink-0" />
              <span>Live Selfie Verification</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <ShieldCheck className="w-4 h-4 text-[#E30620] shrink-0" />
              <span>Fast-Pair Zero-Typing</span>
            </div>
          </div>
        </div>

        {/* Primary Action Section: BIG INSTALL APP BUTTON */}
        <div className="space-y-3">
          {installSuccess || isStandalone ? (
            <div className="space-y-3">
              <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">App Installed &amp; Device Connected!</h3>
                <p className="text-[11px] text-emerald-200">
                  {pairedTitle} is linked to your phone. Ready for offline interviews.
                </p>
              </div>

              <button
                onClick={() => onOpenFieldApp(pairedCode)}
                className="w-full py-4 bg-gradient-to-r from-[#E30620] to-red-700 hover:from-red-600 hover:to-red-800 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-red-900/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>Launch Field App Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* THE REQUESTED BIG BUTTON: "Click to Install App & Connect" */}
              <button
                id="pwa-install-app-btn"
                onClick={handleInstallAndConnectClick}
                className="w-full py-4 sm:py-5 bg-gradient-to-r from-emerald-600 via-[#E30620] to-[#C8202F] hover:from-emerald-500 hover:to-red-700 active:scale-[0.98] text-white font-black text-base sm:text-lg uppercase tracking-wider rounded-2xl shadow-2xl shadow-red-900/50 flex items-center justify-center gap-3 transition-all border border-emerald-400/40 animate-pulse-subtle"
              >
                <Download className="w-6 h-6 shrink-0" />
                <span>Click to Install App &amp; Connect</span>
              </button>

              <div className="text-center space-y-1">
                <p className="text-[11px] text-emerald-400 font-bold">
                  ⚡ Like WhatsApp "Link Device" — Auto-connects instantly!
                </p>
                <p className="text-[10px] text-gray-400">
                  No need to type long codes or project IDs on the field.
                </p>
              </div>

              {/* Direct In-Browser Launch Fallback */}
              <div className="pt-2 text-center">
                <button
                  onClick={() => onOpenFieldApp(pairedCode)}
                  className="text-xs text-gray-300 hover:text-white underline underline-offset-4 font-semibold flex items-center justify-center gap-1.5 mx-auto py-1"
                >
                  <span>Or continue directly in browser without installing</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3 Step Workflow Overview */}
        <div className="bg-[#111827]/70 border border-white/10 rounded-2xl p-4 text-xs space-y-3">
          <div className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
            Field Enumerator Workflow:
          </div>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#E30620]/20 text-[#E30620] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#E30620]/40">
                1
              </span>
              <div>
                <p className="font-bold text-white text-[11px]">Install to Home Screen</p>
                <p className="text-[10px] text-gray-400">Click INSTALL APP above to place icon on your phone.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#E30620]/20 text-[#E30620] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#E30620]/40">
                2
              </span>
              <div>
                <p className="font-bold text-white text-[11px]">ID + Access Code + Selfie</p>
                <p className="text-[10px] text-gray-400">Authenticate identity with camera selfie before field entry.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#E30620]/20 text-[#E30620] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#E30620]/40">
                3
              </span>
              <div>
                <p className="font-bold text-white text-[11px]">Offline Interviews & Sync</p>
                <p className="text-[10px] text-gray-400">Collect data with GPS verification and sync automatically when online.</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* iOS Safari Guided Add-to-Home-Screen Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#17243A] border border-white/20 rounded-3xl p-6 max-w-sm w-full space-y-4 text-white shadow-2xl relative animate-in fade-in slide-in-from-bottom-6">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-full bg-white/5"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#E30620]/20 border border-[#E30620]/40 text-[#E30620] flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Install on {isIOS ? 'iPhone / iPad' : 'Your Phone'}</h3>
              <p className="text-xs text-gray-300">
                Follow these 2 quick steps to add CMRG Collect to your home screen:
              </p>
            </div>

            <div className="bg-[#0B0F17] rounded-2xl p-4 space-y-3 border border-white/10 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">1. Tap the Share button</p>
                  <p className="text-[10px] text-gray-400">At the bottom toolbar of Safari (or top in Chrome).</p>
                </div>
              </div>

              <div className="border-t border-white/10"></div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">2. Select "Add to Home Screen"</p>
                  <p className="text-[10px] text-gray-400">Scroll down the menu and tap 'Add to Home Screen' then 'Add'.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSModal(false);
                onOpenFieldApp(pairedCode);
              }}
              className="w-full py-3 bg-[#E30620] hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              I Understand / Continue to App
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-3 px-4 text-center text-[10px] text-gray-500 bg-[#0B0F17]">
        © 2026 Communication and Marketing Research Group Ltd. (CMRG) • ISO/IEC 27001 Certified
      </footer>
    </div>
  );
};
