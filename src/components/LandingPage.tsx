import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  BarChart3, 
  Smartphone, 
  QrCode, 
  ArrowRight, 
  Globe, 
  FileText, 
  Radio,
  Headphones,
  Check,
  ChevronDown,
  X,
  Menu,
  Download,
  WifiOff
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface LandingPageProps {
  onOpenLogin: () => void;
  onContinueAsDemo: () => void;
  onOpenInstall?: (code: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin, onContinueAsDemo, onOpenInstall }) => {
  const [activeSection, setActiveSection] = useState<'home' | 'features' | 'pricing' | 'about' | 'support'>('home');
  const [showQRModal, setShowQRModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://app.ourfield.com';
  const qrUrl = `${currentOrigin}/?install=CMRG-123&connect=true`;

  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans flex flex-col selection:bg-[#E30620] selection:text-white">
      {/* 1. TOP HEADER - EXACT MATCH TO IMAGE */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Left: Authentic CMRG Ltd. Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveSection('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <img 
            src="/assets/aistudio/cmrg_logo_clean.png" 
            alt="CMRG Ltd. Communication and Marketing Research Group Limited" 
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-gray-700">
          <button 
            onClick={() => { setActiveSection('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`transition-colors py-1 ${
              activeSection === 'home' 
                ? 'text-[#E30620] font-semibold border-b-2 border-[#E30620]' 
                : 'hover:text-[#E30620]'
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => setActiveSection('features')}
            className={`transition-colors py-1 ${
              activeSection === 'features' 
                ? 'text-[#E30620] font-semibold border-b-2 border-[#E30620]' 
                : 'hover:text-[#E30620]'
            }`}
          >
            Features
          </button>
          <button 
            onClick={() => setActiveSection('pricing')}
            className={`transition-colors py-1 ${
              activeSection === 'pricing' 
                ? 'text-[#E30620] font-semibold border-b-2 border-[#E30620]' 
                : 'hover:text-[#E30620]'
            }`}
          >
            Pricing
          </button>
          <button 
            onClick={() => setActiveSection('about')}
            className={`transition-colors py-1 ${
              activeSection === 'about' 
                ? 'text-[#E30620] font-semibold border-b-2 border-[#E30620]' 
                : 'hover:text-[#E30620]'
            }`}
          >
            About Us
          </button>
          <button 
            onClick={() => setActiveSection('support')}
            className={`transition-colors py-1 ${
              activeSection === 'support' 
                ? 'text-[#E30620] font-semibold border-b-2 border-[#E30620]' 
                : 'hover:text-[#E30620]'
            }`}
          >
            Support
          </button>
        </nav>

        {/* Right Actions: Language, Log In, Get Started */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg bg-gray-50/50">
            <Globe className="w-3.5 h-3.5 text-gray-500" />
            <span>EN</span>
            <ChevronDown className="w-3 h-3 text-gray-400 ml-0.5" />
          </div>

          <button
            onClick={onOpenLogin}
            className="px-4 py-2 text-xs font-semibold text-gray-900 border border-gray-200 hover:border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all"
          >
            Log In
          </button>

          <button
            onClick={onContinueAsDemo}
            className="px-5 py-2 text-xs font-bold text-white bg-[#E30620] hover:bg-red-700 rounded-lg shadow-sm transition-all"
          >
            Get Started
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-black"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer (Auto closes on scroll) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-3 shadow-lg sticky top-[57px] z-40">
          <button onClick={() => { setActiveSection('home'); setMobileMenuOpen(false); }} className="text-left font-semibold py-1">Home</button>
          <button onClick={() => { setActiveSection('features'); setMobileMenuOpen(false); }} className="text-left font-semibold py-1">Features</button>
          <button onClick={() => { setActiveSection('pricing'); setMobileMenuOpen(false); }} className="text-left font-semibold py-1">Pricing</button>
          <button onClick={() => { setActiveSection('about'); setMobileMenuOpen(false); }} className="text-left font-semibold py-1">About Us</button>
          <button onClick={() => { setActiveSection('support'); setMobileMenuOpen(false); }} className="text-left font-semibold py-1">Support</button>
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
              className="w-full py-2.5 text-center text-xs font-bold border border-gray-300 rounded-lg"
            >
              Log In
            </button>
            <button
              onClick={() => { onContinueAsDemo(); setMobileMenuOpen(false); }}
              className="w-full py-2.5 text-center text-xs font-bold text-white bg-[#E30620] rounded-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN BODY ACCORDING TO ACTIVE SECTION */}
      {activeSection === 'home' && (
        <>
          {/* HERO SECTION - EXACT REPRODUCTION OF THE MARKETING IMAGE */}
          <section className="relative bg-[#07090E] text-white overflow-hidden">
            <div className="w-full max-w-[1400px] mx-auto relative">
              
              {/* Desktop banner */}
              <div className="hidden lg:block relative w-full overflow-hidden">
                <img 
                  src="/assets/aistudio/hero_full_section.jpg" 
                  alt="CMRG Data Collect - Real People. Real Data." 
                  className="w-full h-auto object-cover select-none"
                />

                <button
                  type="button"
                  onClick={() => setShowQRModal(true)}
                  className="absolute bottom-[8.5%] left-[4.5%] w-[190px] h-[48px] rounded-full opacity-0 hover:opacity-20 bg-white transition-opacity cursor-pointer"
                  title="Scan QR Code to Access the App"
                />

                <button
                  type="button"
                  onClick={onContinueAsDemo}
                  className="absolute bottom-[10%] left-[23.5%] w-[80px] h-[30px] rounded-md opacity-0 hover:opacity-20 bg-white transition-opacity cursor-pointer"
                  title="Sign In to Data Collect"
                />
              </div>

              {/* Responsive fallback */}
              <div className="lg:hidden p-6 sm:p-10 space-y-8">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                    CMRG DATA COLLECT
                  </span>
                  
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1]">
                    Real People.<br />
                    <span className="text-[#E30620]">Real Data.</span>
                  </h1>

                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-lg">
                    A powerful and flexible data collection platform for market research, public opinion polling and field surveys across Nigeria.
                  </p>

                  {/* Enhanced card-based feature highlights for mobile */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#E30620]/20 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-[#E30620]" />
                      </div>
                      <span className="text-xs font-semibold text-gray-200 leading-tight">Secure &amp; Reliable</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#E30620]/20 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-[#E30620]" />
                      </div>
                      <span className="text-xs font-semibold text-gray-200 leading-tight">GPS Geo-Locked</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#E30620]/20 flex items-center justify-center shrink-0">
                        <BarChart3 className="w-4 h-4 text-[#E30620]" />
                      </div>
                      <span className="text-xs font-semibold text-gray-200 leading-tight">Live Analytics</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#E30620]/20 flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4 text-[#E30620]" />
                      </div>
                      <span className="text-xs font-semibold text-gray-200 leading-tight">Zero-Install PWA</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <button
                      onClick={() => setShowQRModal(true)}
                      className="px-6 py-3.5 bg-[#E30620] hover:bg-red-700 text-white font-bold rounded-full shadow-lg transition-all flex items-center gap-2.5 text-xs"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Scan QR Code to Access the App</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <div className="text-[11px] text-gray-300">
                      <p className="font-semibold text-white">No Playstore. No App Store.</p>
                      <p>Just Scan &amp; Start Collecting.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 rounded-2xl overflow-hidden border border-gray-800">
                  <img 
                    src="/assets/aistudio/hero_devices_only.png" 
                    alt="CMRG Fieldwork Devices &amp; Enumerator" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

            </div>
          </section>

          {/* 3. GET STARTED / HOW IT WORKS SECTION (CARD-BASED ENTERPRISE WORKFLOW) */}
          <section className="bg-white text-[#111827] py-16 px-4 sm:px-8 border-b border-gray-200">
            <div className="max-w-7xl mx-auto space-y-12">
              
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="text-xs font-bold text-[#E30620] uppercase tracking-wider">
                  GET STARTED IN MINUTES
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B0F17]">
                  How to Get Started with CMRG
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Deploy surveys rapidly across Nigeria. A streamlined, card-based field workflow designed for market researchers, project managers, and enumerators.
                </p>
              </div>

              {/* 4 Step Process Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Step 1 */}
                <div className="bg-gray-50/70 hover:bg-white border border-gray-200/90 hover:border-[#E30620]/40 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-red-50 text-[#E30620] border border-red-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5 text-[#E30620]" />
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                        Step 01
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0B0F17] group-hover:text-[#E30620] transition-colors">
                        Design Survey
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                        Build forms with 11+ question types, branching logic, audio prompts, and multilingual translations.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] font-semibold text-[#E30620]">
                    <span>Questionnaire Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-gray-50/70 hover:bg-white border border-gray-200/90 hover:border-blue-500/40 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                        Step 02
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0B0F17] group-hover:text-blue-600 transition-colors">
                        Lock Geo-Perimeter
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                        Establish Leaflet geofences, target quotas and meter drift buffers before field deployment.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] font-semibold text-blue-600">
                    <span>Geo-Lock Manager</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-gray-50/70 hover:bg-white border border-gray-200/90 hover:border-emerald-500/40 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <QrCode className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                        Step 03
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0B0F17] group-hover:text-emerald-600 transition-colors">
                        Scan QR &amp; Collect
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                        Enumerators scan WhatsApp QR to install instant PWA. Works offline with automatic background sync.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] font-semibold text-emerald-600">
                    <span>Zero-Install PWA</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-gray-50/70 hover:bg-white border border-gray-200/90 hover:border-amber-500/40 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <BarChart3 className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                        Step 04
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0B0F17] group-hover:text-amber-600 transition-colors">
                        Live Monitor &amp; Export
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                        Watch GIS telemetry in Situation Room, verify audio/photos, and export XLSX, CSV, or KML files.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] font-semibold text-amber-600">
                    <span>Situation Room</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>

              {/* Bottom CTA within Get Started */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-base font-bold text-[#0B0F17]">
                    Ready to deploy your next field research project?
                  </h4>
                  <p className="text-xs text-gray-500">
                    Sign in to your CMRG console or scan the QR code to start collecting on any mobile device.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="px-5 py-2.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Scan App QR</span>
                  </button>
                  <button
                    onClick={onContinueAsDemo}
                    className="px-6 py-2.5 bg-[#E30620] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* 4. WHY CHOOSE CMRG DATA COLLECT SECTION */}
          <section className="bg-gray-50 text-[#111827] py-16 px-4 sm:px-8 border-b border-gray-200">
            <div className="max-w-7xl mx-auto space-y-12">
              
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="text-xs font-bold text-[#E30620] uppercase tracking-wider">
                  ENTERPRISE ADVANTAGE
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B0F17]">
                  Why Choose CMRG Data Collect?
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Designed from the ground up for African market research agencies, NGOs, and public opinion pollsters requiring bulletproof data integrity.
                </p>
              </div>

              {/* 6 Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5 text-[#E30620]" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0B0F17] mb-1.5">
                      Universal Questionnaire Builder
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      20+ question types, branching logic, repeat roster groups, and AI prompt generation.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <WifiOff className="w-5 h-5 text-[#E30620]" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0B0F17] mb-1.5">
                      Collect in the Field
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Offline mode, GPS location, photo, audio and secure submission.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <MapPin className="w-5 h-5 text-[#E30620]" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0B0F17] mb-1.5">
                      Geo-Lock Manager
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Search locations, draw polygons, set radius, buffer and manage geofences.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-5 h-5 text-[#E30620]" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0B0F17] mb-1.5">
                      Ensure Data Quality
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Fraud detection, review queue, verification and immutable audit trails.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <BarChart3 className="w-5 h-5 text-[#E30620]" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0B0F17] mb-1.5">
                      Analyse &amp; Visualise
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Dashboards, charts, cross-tabs and real-time insights.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Download className="w-5 h-5 text-[#E30620]" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0B0F17] mb-1.5">
                      Export Your Data
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      CSV, XLSX, PDF, KML, SPSS (.sav) and Stata (.dta) formats.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* 4. PRICING SECTION — EXACT REPRODUCTION OF IMAGE 3 (CMRG Plan) */}
          <section className="bg-white text-[#111827] py-16 px-4 sm:px-8 border-b border-gray-200">
            <div className="max-w-7xl mx-auto space-y-10">
              
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-[#E30620] uppercase tracking-wider">
                  SIMPLE &amp; TRANSPARENT
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B0F17]">
                  CMRG Plan
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
                  We've designed a flexible and affordable plan to give CMRG's research teams everything they need — without the high costs.
                </p>
              </div>

              {/* Pricing Card Grid matching Image 3 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 max-w-6xl mx-auto">
                
                {/* Left Card: CMRG Research Plan (Cols 1-7) */}
                <div className="lg:col-span-7 bg-[#FFFBFB] border-2 border-red-200 rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#E30620] text-white text-[10px] font-bold px-4 py-1 rounded-bl-2xl uppercase tracking-wider">
                    Recommended
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#E30620]/10 flex items-center justify-center text-[#E30620]">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#0B0F17]">CMRG Research Plan</h3>
                      <p className="text-xs text-gray-500">Full platform access with offline collection, GPS, dashboards &amp; reports.</p>
                    </div>
                  </div>

                  {/* Price Banner */}
                  <div className="bg-white border border-red-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                    <div>
                      <div className="text-3xl sm:text-4xl font-black text-[#0B0F17]">
                        Only $100 <span className="text-xs font-semibold text-gray-500">/ month</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">(CMRG Maintenance Fee)</p>
                    </div>
                    <button
                      onClick={onContinueAsDemo}
                      className="px-6 py-3 bg-[#E30620] hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all w-full sm:w-auto text-center"
                    >
                      Get Started
                    </button>
                  </div>

                  {/* Feature Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#E30620] shrink-0" />
                      <span>Unlimited Projects &amp; Forms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#E30620] shrink-0" />
                      <span>Unlimited Enumerators (as needed)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#E30620] shrink-0" />
                      <span>Offline Data Collection &amp; Sync</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#E30620] shrink-0" />
                      <span>GPS &amp; Geofencing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#E30620] shrink-0" />
                      <span>Advanced Dashboards &amp; Reports</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#E30620] shrink-0" />
                      <span>Priority Support</span>
                    </div>
                  </div>
                </div>

                {/* Right Card: No Per-User Fees Note (Cols 8-12) */}
                <div className="lg:col-span-5 bg-gray-50 border border-gray-200 rounded-3xl p-8 space-y-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-gray-200/80 text-gray-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>

                  <h4 className="text-base font-bold text-[#0B0F17]">No Per-User or Per-Survey Fees</h4>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    Your $100/month covers the platform maintenance, updates and support. No hidden charges. No extra fees for users or surveys within your plan.
                  </p>

                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-lg font-serif italic text-[#E30620] font-bold">
                      "More research. Less cost."
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* 5. "ONE PLATFORM. UNLIMITED POSSIBILITIES." DARK RED SECTION */}
          <section className="bg-gradient-to-r from-[#07090E] via-[#090D15] to-[#8A000A] text-white py-14 px-4 sm:px-8 relative overflow-hidden border-b border-gray-900">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-5 space-y-3.5">
                <span className="text-[11px] font-bold text-[#E30620] uppercase tracking-wider block">
                  ONE PLATFORM. UNLIMITED POSSIBILITIES.
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Web. Android. iOS. All Connected.
                </h2>

                <p className="text-xs text-gray-300 leading-relaxed">
                  Access CMRG Data Collect from your browser, or scan the QR code to use the mobile app on any Android or iOS device.
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <Globe className="w-3.5 h-3.5 text-[#E30620]" />
                    </div>
                    <div className="text-[11px]">
                      <p className="font-bold text-white leading-tight">Web</p>
                      <p className="text-gray-400 text-[10px]">(Any browser)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <Smartphone className="w-3.5 h-3.5 text-[#E30620]" />
                    </div>
                    <div className="text-[11px]">
                      <p className="font-bold text-white leading-tight">Android</p>
                      <p className="text-gray-400 text-[10px]">(App via QR)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <Smartphone className="w-3.5 h-3.5 text-[#E30620]" />
                    </div>
                    <div className="text-[11px]">
                      <p className="font-bold text-white leading-tight">iOS</p>
                      <p className="text-gray-400 text-[10px]">(App via QR)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex items-center justify-center">
                <img 
                  src="/assets/aistudio/bottom_banner_devices_clean.png" 
                  alt="CMRG Data Collect Mobile and Laptop Mockup" 
                  className="w-full max-w-[420px] h-auto object-contain drop-shadow-2xl"
                />
              </div>

              <div className="lg:col-span-3 text-left lg:text-right space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight tracking-tight uppercase">
                  BETTER DATA.<br />
                  BETTER DECISIONS.
                </h3>
                <div className="text-xs text-gray-300 space-y-0.5">
                  <p className="font-bold text-white">CMRG Data Collect</p>
                  <p className="text-gray-400 text-[11px]">Your field research partner in Nigeria.</p>
                </div>
              </div>

            </div>
          </section>

          {/* 6. BOTTOM TRUST & CAPABILITIES STRIP (WHITE BAR) */}
          <section className="bg-white border-t border-gray-150 py-4 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-700">
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 sm:gap-8 font-semibold">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#E30620]" />
                  <span>Secure Infrastructure</span>
                </div>
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-[#E30620]" />
                  <span>Offline &amp; Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#E30620]" />
                  <span>Real-time Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#E30620]" />
                  <span>Advanced Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-[#E30620]" />
                  <span>Expert Support</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <img 
                  src="/assets/aistudio/cmrg_logo_clean.png" 
                  alt="CMRG Ltd." 
                  className="h-6 sm:h-7 w-auto object-contain"
                />
              </div>

            </div>
          </section>
        </>
      )}

      {/* ADDITIONAL SECTIONS (FEATURES, PRICING, ABOUT US, SUPPORT) */}
      {activeSection === 'features' && (
        <section className="bg-white text-[#111827] py-16 px-4 sm:px-8 flex-1">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#E30620] uppercase tracking-wider">COMPREHENSIVE SUITE</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B0F17]">All Features &amp; Capabilities</h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">Engineered specifically for demanding market research and field data collection agencies across Nigeria.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <FileText className="w-7 h-7 text-[#E30620] mb-3" />
                <h3 className="text-sm font-bold text-[#0B0F17] mb-1.5">Questionnaire Studio</h3>
                <p className="text-xs text-gray-600">Dynamic form builder supporting 11 question types, skip logic, audio prompts, and multi-version publishing.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <WifiOff className="w-7 h-7 text-[#E30620] mb-3" />
                <h3 className="text-sm font-bold text-[#0B0F17] mb-1.5">Offline-First PWA</h3>
                <p className="text-xs text-gray-600">Reliable IndexedDB queue for zero-connectivity areas with automatic background synchronization when online.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <MapPin className="w-7 h-7 text-[#E30620] mb-3" />
                <h3 className="text-sm font-bold text-[#0B0F17] mb-1.5">Geo-Lock Manager</h3>
                <p className="text-xs text-gray-600">Set interactive Leaflet geofences, Nigerian city presets, and 50m–500m drift buffers for strict location integrity.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <ShieldCheck className="w-7 h-7 text-[#E30620] mb-3" />
                <h3 className="text-sm font-bold text-[#0B0F17] mb-1.5">Supervisor Quality &amp; Audit</h3>
                <p className="text-xs text-gray-600">Review flagged submissions, verify GPS timestamps, approve supervisor overrides, and inspect audio evidence.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <BarChart3 className="w-7 h-7 text-[#E30620] mb-3" />
                <h3 className="text-sm font-bold text-[#0B0F17] mb-1.5">Live Situation Room</h3>
                <p className="text-xs text-gray-600">Supabase Realtime live field monitor, real-time quota tracking, and interactive Leaflet map markers.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <Download className="w-7 h-7 text-[#E30620] mb-3" />
                <h3 className="text-sm font-bold text-[#0B0F17] mb-1.5">Statistical Data Exports</h3>
                <p className="text-xs text-gray-600">Export clean datasets in CSV, Excel (XLSX), SPSS (.sav), Stata (.dta), PDF, or KML mapping formats.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'pricing' && (
        <section className="bg-white text-[#111827] py-16 px-4 sm:px-8 flex-1">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#E30620] uppercase tracking-wider">SIMPLE &amp; TRANSPARENT</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B0F17]">CMRG Plan</h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">We've designed a flexible and affordable plan to give CMRG's research teams everything they need — without the high costs.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 max-w-6xl mx-auto">
              <div className="lg:col-span-7 bg-[#FFFBFB] border-2 border-red-200 rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#E30620] text-white text-[10px] font-bold px-4 py-1 rounded-bl-2xl uppercase tracking-wider">
                  Recommended
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E30620]/10 flex items-center justify-center text-[#E30620]">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#0B0F17]">CMRG Research Plan</h3>
                    <p className="text-xs text-gray-500">Full platform access with offline collection, GPS, dashboards &amp; reports.</p>
                  </div>
                </div>

                <div className="bg-white border border-red-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-[#0B0F17]">
                      Only $100 <span className="text-xs font-semibold text-gray-500">/ month</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">(CMRG Maintenance Fee)</p>
                  </div>
                  <button
                    onClick={onContinueAsDemo}
                    className="px-6 py-3 bg-[#E30620] hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all w-full sm:w-auto text-center"
                  >
                    Get Started
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#E30620] shrink-0" />
                    <span>Unlimited Projects &amp; Forms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#E30620] shrink-0" />
                    <span>Unlimited Enumerators (as needed)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#E30620] shrink-0" />
                    <span>Offline Data Collection &amp; Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#E30620] shrink-0" />
                    <span>GPS &amp; Geofencing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#E30620] shrink-0" />
                    <span>Advanced Dashboards &amp; Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#E30620] shrink-0" />
                    <span>Priority Support</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-gray-50 border border-gray-200 rounded-3xl p-8 space-y-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-gray-200/80 text-gray-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#0B0F17]">No Per-User or Per-Survey Fees</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your $100/month covers the platform maintenance, updates and support. No hidden charges. No extra fees for users or surveys within your plan.
                </p>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-lg font-serif italic text-[#E30620] font-bold">
                    "More research. Less cost."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'about' && (
        <section className="bg-white text-[#111827] py-16 px-4 sm:px-8 flex-1">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#E30620] uppercase tracking-wider">ABOUT CMRG LTD</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B0F17]">Communication and Marketing Research Group Limited</h2>
              <p className="text-xs text-gray-500 font-semibold">RC37852 • Premier Research &amp; Field Intelligence Agency</p>
            </div>
            
            <div className="text-xs sm:text-sm text-gray-600 space-y-4 leading-relaxed">
              <p>
                CMRG Ltd. (Communication and Marketing Research Group Limited) is a premier full-service market research agency operating across Nigeria and West Africa. We specialize in quantitative field research, consumer tracking, public opinion polling, and data analytics.
              </p>
              <p>
                Addressing Nigeria's 36 states and 774 LGAs, CMRG engineered <strong>CMRG Data Collect</strong> to eliminate paper inaccuracies, prevent location spoofing via GPS Geo-Lock, and synchronize field interviews reliably through offline PWAs.
              </p>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'support' && (
        <section className="bg-white text-[#111827] py-16 px-4 sm:px-8 flex-1">
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <span className="text-xs font-bold text-[#E30620] uppercase tracking-wider">TECHNICAL SUPPORT</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B0F17]">Field Support Desk</h2>
            <p className="text-xs text-gray-500">Available 24/7 during nationwide field deployments.</p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-xs text-gray-700 max-w-md mx-auto space-y-2">
              <p><b>Email:</b> support@cmrg.org</p>
              <p><b>Telephone:</b> +234 (01) 295 4820</p>
              <p><b>Developer Hub:</b> SIXTUS TECH HUB (08120678052)</p>
            </div>
          </div>
        </section>
      )}

      {/* QR CODE ACCESS MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-[#111827] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-center space-y-4 border border-gray-100">
            <button 
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black rounded-full bg-gray-100"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#E30620]/10 text-[#E30620] flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">Scan to Install PWA</h3>
              <p className="text-xs text-gray-500">Scan with any phone camera to install CMRG Data Collect instantly.</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex justify-center">
              <QRCodeSVG value={qrUrl} size={180} level="H" includeMargin={true} />
            </div>

            <p className="text-[10px] text-gray-400 font-mono break-all">{qrUrl}</p>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-3 bg-[#E30620] hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#0B0F17] text-white py-12 px-4 sm:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src="/assets/aistudio/cmrg_logo_clean.png" alt="CMRG Ltd." className="h-7 w-auto object-contain filter brightness-0 invert" />
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Communication and Marketing Research Group Limited (CMRG Ltd.) is Nigeria's premier field intelligence and market research agency.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => { setActiveSection('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => setActiveSection('features')} className="hover:text-white transition-colors">Features &amp; Capabilities</button></li>
              <li><button onClick={() => setActiveSection('pricing')} className="hover:text-white transition-colors">Pricing &amp; Plans</button></li>
              <li><button onClick={() => setActiveSection('about')} className="hover:text-white transition-colors">About CMRG Ltd.</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Research Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Market Research &amp; FMCG</li>
              <li>Public Opinion Polling</li>
              <li>Household Socio-Economic Surveys</li>
              <li>Retail Audit &amp; Price Tracking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Contact &amp; Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Lagos, Nigeria</li>
              <li>support@cmrg.org</li>
              <li>+234 (01) 295 4820</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-gray-800 text-center text-[10px] text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Communication and Marketing Research Group Limited (CMRG Ltd.). All rights reserved.</p>
          <p>Engineered by Sixtus Tech Hub</p>
        </div>
      </footer>

    </div>
  );
};
