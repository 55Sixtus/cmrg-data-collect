import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  BarChart3, 
  Smartphone, 
  QrCode, 
  ArrowRight, 
  Globe, 
  FileText, 
  CloudRain,
  Radio,
  Layers,
  Headphones,
  Check,
  ChevronDown,
  X,
  Menu,
  Download,
  WifiOff
} from 'lucide-react';

interface LandingPageProps {
  onOpenLogin: () => void;
  onContinueAsDemo: () => void;
  onOpenInstall?: (code: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin, onContinueAsDemo, onOpenInstall }) => {
  const [activeSection, setActiveSection] = useState<'home' | 'features' | 'pricing' | 'about' | 'support'>('home');
  const [showQRModal, setShowQRModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans flex flex-col selection:bg-[#E30620] selection:text-white">
      {/* 1. TOP HEADER - EXACT MATCH TO IMAGE */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Left: Authentic CMRG Ltd. Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveSection('home')}>
          <img 
            src="/assets/aistudio/cmrg_logo_clean.png" 
            alt="CMRG Ltd. Communication and Marketing Research Group Limited" 
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-gray-700">
          <button 
            onClick={() => setActiveSection('home')}
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

      {/* Mobile Drawer */}
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
            {/* Visual background image with high-resolution composite from master image */}
            <div className="w-full max-w-[1400px] mx-auto relative">
              
              {/* For large screens (desktop): render the exact full hero image banner with interactive overlays */}
              <div className="hidden lg:block relative w-full overflow-hidden">
                <img 
                  src="/assets/aistudio/hero_full_section.jpg" 
                  alt="CMRG Data Collect - Real People. Real Data." 
                  className="w-full h-auto object-cover select-none"
                />

                {/* Interactive Clickable Hotspot on the "Scan QR Code" action button */}
                <button
                  type="button"
                  onClick={() => setShowQRModal(true)}
                  className="absolute bottom-[8.5%] left-[4.5%] w-[190px] h-[48px] rounded-full opacity-0 hover:opacity-20 bg-white transition-opacity cursor-pointer"
                  title="Scan QR Code to Access the App"
                />

                {/* Additional clickable hotspot over the Get Started / Login prompt in phone tablet */}
                <button
                  type="button"
                  onClick={onContinueAsDemo}
                  className="absolute bottom-[10%] left-[23.5%] w-[80px] h-[30px] rounded-md opacity-0 hover:opacity-20 bg-white transition-opacity cursor-pointer"
                  title="Sign In to Data Collect"
                />
              </div>

              {/* For responsive screens (< lg): flex layout with high-res typography and devices */}
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

                  {/* 4 Feature Badges */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#E30620] shrink-0" />
                      <span className="text-xs font-semibold text-gray-200">Secure & Reliable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#E30620] shrink-0" />
                      <span className="text-xs font-semibold text-gray-200">GPS Verified Fieldwork</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#E30620] shrink-0" />
                      <span className="text-xs font-semibold text-gray-200">Real-time Analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-[#E30620] shrink-0" />
                      <span className="text-xs font-semibold text-gray-200">Web, Android & iOS</span>
                    </div>
                  </div>

                  {/* QR Action Button */}
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
                      <p>Just Scan & Start Collecting.</p>
                    </div>
                  </div>
                </div>

                {/* Hero visual image */}
                <div className="pt-4 rounded-2xl overflow-hidden border border-gray-800">
                  <img 
                    src="/assets/aistudio/hero_devices_only.png" 
                    alt="CMRG Fieldwork Devices & Enumerator" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

            </div>
          </section>

          {/* 3. WHY CMRG DATA COLLECT SECTION (WHITE MIDDLE SECTION) */}
          <section className="bg-white text-[#111827] py-16 sm:py-20 px-4 sm:px-8 border-b border-gray-100">
            <div className="max-w-7xl mx-auto space-y-12">
              
              {/* Section Header */}
              <div className="text-center space-y-2 max-w-3xl mx-auto">
                <span className="text-[11px] font-bold text-[#E30620] uppercase tracking-widest">
                  WHY CMRG DATA COLLECT
                </span>
                
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0B0F17]">
                  Everything you need for field research
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-2xl mx-auto">
                  From questionnaire design to real-time monitoring and analytics, CMRG Data Collect brings your data collection workflow together in one powerful platform.
                </p>
              </div>

              {/* 6 Feature Cards Grid - Exact replica of the 6 cards in image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                
                {/* 1. Build Questionnaires */}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5 text-[#E30620]" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0B0F17] mb-1.5">
                      Build Questionnaires
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Create surveys with advanced logic, multimedia and AI assistance.
                    </p>
                  </div>
                </div>

                {/* 2. Collect in the Field */}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Smartphone className="w-5 h-5 text-[#E30620]" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0B0F17] mb-1.5">
                      Collect in the Field
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Offline mode, GPS location, photo, audio and secure submission.
                    </p>
                  </div>
                </div>

                {/* 3. Geo-Lock Manager */}
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

                {/* 4. Ensure Data Quality */}
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

                {/* 5. Analyse & Visualise */}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <BarChart3 className="w-5 h-5 text-[#E30620]" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0B0F17] mb-1.5">
                      Analyse & Visualise
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Dashboards, charts, cross-tabs and real-time insights.
                    </p>
                  </div>
                </div>

                {/* 6. Export Your Data */}
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

          {/* 4. "ONE PLATFORM. UNLIMITED POSSIBILITIES." DARK RED SECTION */}
          <section className="bg-gradient-to-r from-[#07090E] via-[#090D15] to-[#8A000A] text-white py-14 px-4 sm:px-8 relative overflow-hidden border-b border-gray-900">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column (Cols 1-5): Copy & Platform Badges */}
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

                {/* 3 Platforms row */}
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

              {/* Center Column (Cols 6-8): Device Mockups Graphic */}
              <div className="lg:col-span-4 flex items-center justify-center">
                <img 
                  src="/assets/aistudio/bottom_banner_devices_clean.png" 
                  alt="CMRG Data Collect Mobile and Laptop Mockup" 
                  className="w-full max-w-[420px] h-auto object-contain drop-shadow-2xl"
                />
              </div>

              {/* Right Column (Cols 9-12): Bold Statement */}
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

          {/* 5. BOTTOM TRUST & CAPABILITIES STRIP (WHITE BAR) */}
          <section className="bg-white border-t border-gray-150 py-4 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-700">
              
              {/* 5 Feature Icons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 sm:gap-8 font-semibold">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#E30620]" />
                  <span>Secure Infrastructure</span>
                </div>
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-[#E30620]" />
                  <span>Offline & Sync</span>
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

              {/* CMRG Ltd. Brand Mark on the right */}
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
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B0F17]">All Features & Capabilities</h2>
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
                <h3 className="text-sm font-bold text-[#0B0F17] mb-1.5">Supervisor Quality & Audit</h3>
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
              <span className="text-xs font-bold text-[#E30620] uppercase tracking-wider">TRANSPARENT PLANS</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B0F17]">Flexible Pricing for Research Teams</h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">Choose the tier that matches your research volume, field teams, and geographical reach across Nigeria.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Starter Field</span>
                  <h3 className="text-xl font-extrabold text-[#0B0F17] mt-1 mb-3">₦150,000 <span className="text-xs font-normal text-gray-500">/ month</span></h3>
                  <p className="text-xs text-gray-600 mb-4">Ideal for boutique polling teams and independent researchers.</p>
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#E30620]" /> Up to 15 Active Enumerators</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#E30620]" /> Offline Mobile PWA Support</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#E30620]" /> GPS Boundary Verification</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#E30620]" /> Standard CSV & Excel Export</li>
                  </ul>
                </div>
                <button onClick={onContinueAsDemo} className="w-full mt-6 py-2.5 bg-[#0B0F17] text-white font-bold rounded-xl text-xs hover:bg-gray-800 transition-all">
                  Get Started
                </button>
              </div>

              <div className="bg-[#0B0F17] text-white border-2 border-[#E30620] rounded-3xl p-6 flex flex-col justify-between relative shadow-xl">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E30620] text-white text-[10px] font-bold uppercase px-3 py-0.5 rounded-full">
                  Most Popular
                </div>
                <div>
                  <span className="text-xs font-bold text-[#E30620] uppercase">Enterprise Agency</span>
                  <h3 className="text-xl font-extrabold mt-1 mb-3">₦450,000 <span className="text-xs font-normal text-gray-400">/ month</span></h3>
                  <p className="text-xs text-gray-300 mb-4">Built for national research agencies conducting multi-state fieldwork.</p>
                  <ul className="space-y-2 text-xs text-gray-200">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#E30620]" /> Unlimited Enumerators</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#E30620]" /> Leaflet Geo-Lock Polygons</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#E30620]" /> Supabase Realtime Telemetry</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#E30620]" /> SPSS (.sav) & Stata (.dta) Exports</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#E30620]" /> NDPR Data Retention Automation</li>
                  </ul>
                </div>
                <button onClick={onContinueAsDemo} className="w-full mt-6 py-2.5 bg-[#E30620] hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-md">
                  Start Enterprise Trial
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Government / NGO</span>
                  <h3 className="text-xl font-extrabold text-[#0B0F17] mt-1 mb-3">Custom</h3>
                  <p className="text-xs text-gray-600 mb-4">For censuses, multilateral agencies, and nationwide surveys.</p>
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#E30620]" /> Sovereign / Dedicated Cloud Host</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#E30620]" /> Custom API & ODK Endpoints</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#E30620]" /> 24/7 Field Support SLA</li>
                  </ul>
                </div>
                <button onClick={onOpenLogin} className="w-full mt-6 py-2.5 bg-gray-200 text-[#0B0F17] font-bold rounded-xl text-xs hover:bg-gray-300 transition-all">
                  Contact Sales
                </button>
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
              <p className="text-xs text-gray-500 font-semibold">RC37852 • Premier Research & Field Intelligence Agency</p>
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
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-12 h-12 bg-red-50 text-[#E30620] rounded-2xl mx-auto flex items-center justify-center shadow-inner">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0B0F17]">Scan QR with Phone Camera</h3>
              <p className="text-xs text-gray-500 mt-1">
                Scan to open browser page → tap <b>"INSTALL APP"</b> to add to home screen with offline sync.
              </p>
            </div>

            <div className="w-52 h-52 bg-gradient-to-br from-[#0B0F17] to-[#17243A] border-2 border-[#E30620] rounded-2xl p-4 mx-auto flex flex-col items-center justify-center relative shadow-lg">
              <div className="bg-white p-2.5 rounded-xl flex flex-col items-center justify-center shadow-md">
                <QrCode className="w-28 h-28 text-[#0B0F17]" />
                <span className="text-[9px] font-mono font-bold text-[#E30620] mt-1 tracking-wider">SCAN TO INSTALL</span>
              </div>
              <span className="text-[10px] font-mono text-gray-300 mt-2">
                app.ourfield.com/install/CMRG-2026-NGR
              </span>
            </div>

            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold text-gray-800">
              Link: app.ourfield.com/install/CMRG-2026-NGR
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setShowQRModal(false);
                  if (onOpenInstall) {
                    onOpenInstall('CMRG-2026-NGR');
                  } else {
                    onContinueAsDemo();
                  }
                }}
                className="w-full py-3.5 bg-[#E30620] hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Open Phone Install Page (PWA)</span>
              </button>

              <button
                onClick={() => { setShowQRModal(false); onContinueAsDemo(); }}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-all"
              >
                Or Continue to Web Console
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#05070B] text-gray-400 py-10 px-4 sm:px-8 border-t border-gray-900 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/aistudio/cmrg_logo_clean.png" 
              alt="CMRG Ltd." 
              className="h-6 w-auto object-contain brightness-200"
            />
            <span className="text-[11px] text-gray-500">© 2026 CMRG Ltd. All rights reserved.</span>
          </div>

          <div className="text-[11px] text-gray-500 flex items-center gap-4">
            <span className="hover:text-gray-300 cursor-pointer" onClick={() => setActiveSection('about')}>About</span>
            <span className="hover:text-gray-300 cursor-pointer" onClick={() => setActiveSection('pricing')}>Pricing</span>
            <span className="hover:text-gray-300 cursor-pointer" onClick={() => setActiveSection('support')}>Support</span>
            <span className="hover:text-gray-300 cursor-pointer" onClick={onOpenLogin}>Supervisor Sign In</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
