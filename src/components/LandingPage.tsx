import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  BarChart3, 
  Smartphone, 
  QrCode, 
  CheckCircle2, 
  ArrowRight, 
  Globe, 
  FileText, 
  WifiOff, 
  Lock, 
  Download, 
  Database, 
  Headphones, 
  Building2, 
  Check, 
  Layers, 
  Zap, 
  HelpCircle,
  X,
  Menu
} from 'lucide-react';

interface LandingPageProps {
  onOpenLogin: () => void;
  onContinueAsDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin, onContinueAsDemo }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'home' | 'features' | 'pricing' | 'about' | 'support'>('home');
  const [showQRModal, setShowQRModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#080B10] text-white font-sans flex flex-col selection:bg-[#E30620] selection:text-white">
      {/* HEADER */}
      <header className="bg-white text-[#111827] border-b border-gray-200 sticky top-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveSection('home')}>
            <img 
              src="/assets/aistudio/WhatsApp_Image_2026-10-23_at_5.35.28_PM_edabd00e.jpeg" 
              alt="CMRG Ltd Logo" 
              className="h-9 sm:h-10 w-auto object-contain bg-white rounded"
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
          <button 
            onClick={() => setActiveSection('home')}
            className={`transition-colors hover:text-[#E30620] ${activeSection === 'home' ? 'text-[#E30620] font-semibold underline underline-offset-8' : 'text-gray-700'}`}
          >
            Home
          </button>
          <button 
            onClick={() => setActiveSection('features')}
            className={`transition-colors hover:text-[#E30620] ${activeSection === 'features' ? 'text-[#E30620] font-semibold underline underline-offset-8' : 'text-gray-700'}`}
          >
            Features
          </button>
          <button 
            onClick={() => setActiveSection('pricing')}
            className={`transition-colors hover:text-[#E30620] ${activeSection === 'pricing' ? 'text-[#E30620] font-semibold underline underline-offset-8' : 'text-gray-700'}`}
          >
            Pricing
          </button>
          <button 
            onClick={() => setActiveSection('about')}
            className={`transition-colors hover:text-[#E30620] ${activeSection === 'about' ? 'text-[#E30620] font-semibold underline underline-offset-8' : 'text-gray-700'}`}
          >
            About Us
          </button>
          <button 
            onClick={() => setActiveSection('support')}
            className={`transition-colors hover:text-[#E30620] ${activeSection === 'support' ? 'text-[#E30620] font-semibold underline underline-offset-8' : 'text-gray-700'}`}
          >
            Support
          </button>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <span>EN</span>
          </div>
          <button
            onClick={onOpenLogin}
            className="px-4 py-2 text-xs font-bold text-[#080B10] border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
          >
            Log In
          </button>
          <button
            onClick={onContinueAsDemo}
            className="px-4 py-2 text-xs font-bold text-white bg-[#E30620] rounded-lg hover:bg-[#c5051b] shadow-sm hover:shadow transition-all flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white text-[#111827] border-b border-gray-200 px-6 py-4 flex flex-col gap-4 shadow-lg sticky top-[72px] z-40">
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

      {/* MAIN CONTENT BASED ON SELECTED SECTION */}
      {activeSection === 'home' && (
        <>
          {/* HERO SECTION */}
          <section className="relative overflow-hidden bg-[#080B10] py-20 lg:py-28 px-4 sm:px-8">
            {/* Background reference image layer & gradient overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden opacity-40 lg:opacity-55 pointer-events-none">
              <img 
                src="/assets/aistudio/image_3536d147.png" 
                alt="CMRG Fieldwork Background" 
                className="w-full h-full object-cover object-center scale-105 filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080B10] via-[#080B10]/90 to-[#080B10]/60"></div>
            </div>

            {/* Ambient lighting & red curve decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#E30620]/20 to-transparent rounded-full blur-3xl pointer-events-none z-0"></div>
            <div className="absolute -bottom-20 left-0 w-full h-40 bg-gradient-to-t from-black to-transparent pointer-events-none z-0"></div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              
              {/* Left Column: Copy & CTAs */}
              <div className="lg:col-span-6 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 bg-[#E30620]/15 border border-[#E30620]/40 text-[#E30620] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                  <span>CMRG DATA COLLECT</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
                  Real People.<br />
                  <span className="text-[#E30620]">Real Data.</span>
                </h1>

                <p className="text-gray-200 text-base sm:text-lg leading-relaxed font-normal max-w-xl">
                  “A powerful and flexible data collection platform for market research, public opinion polling and field surveys across Nigeria.”
                </p>

                {/* 4 Feature indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 flex flex-col gap-1 shadow-md">
                    <ShieldCheck className="w-5 h-5 text-[#E30620]" />
                    <span className="text-xs font-semibold text-gray-100">Secure & Reliable</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 flex flex-col gap-1 shadow-md">
                    <MapPin className="w-5 h-5 text-[#E30620]" />
                    <span className="text-xs font-semibold text-gray-100">GPS Verified</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 flex flex-col gap-1 shadow-md">
                    <BarChart3 className="w-5 h-5 text-[#E30620]" />
                    <span className="text-xs font-semibold text-gray-100">Real-time Stats</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 flex flex-col gap-1 shadow-md">
                    <Smartphone className="w-5 h-5 text-[#E30620]" />
                    <span className="text-xs font-semibold text-gray-100">Web, Android & iOS</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="px-6.5 py-4 bg-[#E30620] hover:bg-[#c5051b] text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2.5 text-sm group"
                  >
                    <QrCode className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Scan QR Code to Access the App</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <div className="text-xs text-gray-300 font-medium">
                    <span className="text-white font-semibold">No Play Store. No App Store.</span><br />
                    Just Scan & Start Collecting.
                  </div>
                </div>
              </div>

              {/* Right Column: Phone Mockup & QR Card */}
              <div className="lg:col-span-6 relative flex flex-col sm:flex-row items-center justify-center gap-5">
                
                {/* Field Enumerator App Screen Mockup */}
                <div className="relative bg-gradient-to-b from-[#161D2B] to-[#0D131F] border border-gray-700/80 rounded-3xl p-5 shadow-2xl w-full max-w-sm backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#E30620]"></div>
                      <span className="text-xs font-bold text-white tracking-wide">CMRG Field Collection</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full">Online / GPS Locked</span>
                  </div>

                  <div className="py-4 space-y-3">
                    <div className="bg-black/50 rounded-xl p-3 border border-gray-800">
                      <p className="text-[11px] text-gray-400">Good morning,</p>
                      <p className="text-sm font-bold text-white">Dr. Tunde Fashola (Field Supervisor)</p>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer" onClick={onContinueAsDemo}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#E30620]/20 text-[#E30620] flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">My Assignments</p>
                            <p className="text-[10px] text-gray-400">View active survey quotas (Lagos, Kano)</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>

                      <div className="bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer" onClick={onContinueAsDemo}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                            <Download className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Download Forms</p>
                            <p className="text-[10px] text-gray-400">Offline questionnaires & audio assets</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>

                      <div className="bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer" onClick={onContinueAsDemo}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Database className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Sync Data</p>
                            <p className="text-[10px] text-gray-400">0 pending offline submissions</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="bg-emerald-950/55 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <div>
                        <p className="text-[11px] font-bold text-emerald-300">GPS Location Verified</p>
                        <p className="text-[10px] text-emerald-400/80">Accuracy: 3.4 meters • Ikeja GRA, Lagos</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Access Card */}
                <div className="bg-white text-[#111827] rounded-3xl p-5 shadow-2xl max-w-[210px] w-full text-center flex flex-col items-center">
                  <p className="text-xs font-black uppercase tracking-tight text-gray-900 mb-3">Scan to access<br />CMRG Data Collect</p>
                  
                  {/* QR Code Graphic Box */}
                  <div className="w-36 h-36 bg-gray-50 border-2 border-dashed border-[#E30620]/50 rounded-2xl p-2.5 flex items-center justify-center relative shadow-inner">
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#E30620]"></div>
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#E30620]"></div>
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#E30620]"></div>
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#E30620]"></div>
                    
                    <div className="bg-black p-2 rounded-lg w-full h-full flex flex-col items-center justify-center text-white">
                      <QrCode className="w-20 h-20 text-white" />
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-500 font-medium mt-3">Works on Android & iOS<br />(through your browser)</p>
                  
                  <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-gray-100 text-[11px] font-bold text-gray-700 w-full">
                    <span className="flex items-center gap-1">🤖 Android</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">🍎 iOS</span>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* FEATURES SECTION */}
          <section className="bg-white text-[#111827] py-20 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto text-center space-y-4">
              <span className="text-xs font-black text-[#E30620] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">
                WHY CMRG DATA COLLECT
              </span>
              
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#080B10]">
                Everything you need for field research
              </h2>

              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                “From questionnaire design to real-time monitoring and analytics, CMRG Data Collect brings your data collection workflow together in one powerful platform.”
              </p>

              {/* 6 Feature Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12 text-left">
                
                {/* Card 1 */}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group hover:border-[#E30620]/50">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#080B10] mb-2">Build Questionnaires</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Create surveys with advanced logic, multimedia and AI assistance. Support for skip patterns, multilingual forms, and dynamic constraints.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group hover:border-[#E30620]/50">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <WifiOff className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#080B10] mb-2">Collect in the Field</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Offline mode, GPS location, photo, audio and secure submission. Data is securely cached locally and synced instantly upon reconnection.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group hover:border-[#E30620]/50">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#080B10] mb-2">Geo-Lock Manager</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Search locations, draw polygons, set radius, buffer and manage geofences to ensure enumerators collect data strictly within target boundaries.
                  </p>
                </div>

                {/* Card 4 */}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group hover:border-[#E30620]/50">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#080B10] mb-2">Ensure Data Quality</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Fraud detection, review queue, verification and immutable audit trails. Automatically flag outliers, audio duration anomalies, and speeders.
                  </p>
                </div>

                {/* Card 5 */}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group hover:border-[#E30620]/50">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#080B10] mb-2">Analyse & Visualise</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Dashboards, charts, cross-tabs and real-time insights. Monitor field completion rates across Nigerian states, LGAs, and enumerators live.
                  </p>
                </div>

                {/* Card 6 */}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group hover:border-[#E30620]/50">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E30620] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Download className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#080B10] mb-2">Export Your Data</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    CSV, XLSX, PDF, KML, SPSS (.sav) and Stata (.dta) formats ready for instant statistical analysis and client reporting.
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* PLATFORM SHOWCASE SECTION */}
          <section className="bg-[#080B10] text-white py-20 px-4 sm:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-[#080B10] to-[#080B10] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10 space-y-12">
              
              <div className="text-center space-y-3 max-w-3xl mx-auto">
                <span className="text-xs font-black text-[#E30620] uppercase tracking-widest bg-[#E30620]/10 px-3 py-1 rounded-full border border-[#E30620]/30">
                  ONE PLATFORM. UNLIMITED POSSIBILITIES.
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                  Web. Android. iOS. All Connected.
                </h2>
                <p className="text-gray-300 text-sm sm:text-base">
                  “Access CMRG Data Collect from your browser, or scan the QR code to use the mobile app on any Android or iOS device.”
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-semibold text-gray-400">
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">🌐 Web (Any browser)</span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">🤖 Android (PWA / Browser)</span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">🍎 iOS (Safari / PWA)</span>
                </div>
              </div>

              {/* Laptop and Dashboard Mockup */}
              <div className="bg-[#121824] border border-gray-800 rounded-3xl p-4 sm:p-8 shadow-2xl relative">
                <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
                  <div className="space-y-4 max-w-md">
                    <span className="text-xs bg-[#E30620] text-white font-bold px-2.5 py-1 rounded">Enterprise Dashboard</span>
                    <h3 className="text-2xl font-black">Live Field Monitoring Across Nigeria</h3>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                      Track enumerator GPS coordinates in real time, review flagged submissions instantly, and enforce data retention and cloud deployment security with one click.
                    </p>
                    <button
                      onClick={onContinueAsDemo}
                      className="px-5 py-2.5 bg-white text-[#080B10] hover:bg-gray-100 font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
                    >
                      <span>Explore Live Admin Dashboard</span>
                      <ArrowRight className="w-4 h-4 text-[#E30620]" />
                    </button>
                  </div>

                  <div className="bg-black/60 border border-gray-800 rounded-2xl p-4 w-full lg:w-[540px]">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-800 text-[11px] text-gray-400">
                      <span>CMRG Data Collect Enterprise v4.8</span>
                      <span className="text-emerald-400 font-bold">● System Operational</span>
                    </div>
                    <div className="py-6 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-[10px] text-gray-400">Total Projects</p>
                          <p className="text-lg font-black text-white">124</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-[10px] text-gray-400">Submissions</p>
                          <p className="text-lg font-black text-[#E30620]">8,932</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-[10px] text-gray-400">Completion</p>
                          <p className="text-lg font-black text-emerald-400">78%</p>
                        </div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-300">Lagos State Polling Wave 3</span>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">Active (GPS Verified)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Feature Strip */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-gray-800 text-center">
                <div className="flex flex-col items-center gap-1.5 p-3">
                  <ShieldCheck className="w-5 h-5 text-[#E30620]" />
                  <span className="text-xs font-bold text-gray-200">Secure Infrastructure</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3">
                  <WifiOff className="w-5 h-5 text-[#E30620]" />
                  <span className="text-xs font-bold text-gray-200">Offline & Sync</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3">
                  <BarChart3 className="w-5 h-5 text-[#E30620]" />
                  <span className="text-xs font-bold text-gray-200">Real-time Monitoring</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3">
                  <Layers className="w-5 h-5 text-[#E30620]" />
                  <span className="text-xs font-bold text-gray-200">Advanced Analytics</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 col-span-2 md:col-span-1">
                  <Headphones className="w-5 h-5 text-[#E30620]" />
                  <span className="text-xs font-bold text-gray-200">Expert Support</span>
                </div>
              </div>

            </div>
          </section>
        </>
      )}

      {activeSection === 'features' && (
        <section className="bg-white text-[#111827] py-20 px-4 sm:px-8 flex-1">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-black text-[#E30620] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">COMPREHENSIVE SUITE</span>
              <h2 className="text-3xl sm:text-5xl font-black">All Features & Capabilities</h2>
              <p className="text-gray-600 max-w-xl mx-auto">Designed specifically for demanding market research and field data collection agencies in Nigeria and across Africa.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <FileText className="w-8 h-8 text-[#E30620] mb-4" />
                <h3 className="text-lg font-bold mb-2">Form Builder & Logic</h3>
                <p className="text-sm text-gray-600">Advanced survey builder supporting text, numeric, GPS capture, audio recording, matrix questions, and conditional skip logic.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <WifiOff className="w-8 h-8 text-[#E30620] mb-4" />
                <h3 className="text-lg font-bold mb-2">Robust Offline Sync</h3>
                <p className="text-sm text-gray-600">Field enumerators can collect data in remote areas with zero cellular coverage. IndexedDB auto-syncs when connectivity returns.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <MapPin className="w-8 h-8 text-[#E30620] mb-4" />
                <h3 className="text-lg font-bold mb-2">Geo-Fence Enforcement</h3>
                <p className="text-sm text-gray-600">Define precise state, LGA, or polygon boundaries. The app blocks survey submission if the enumerator is outside the authorized zone.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <ShieldCheck className="w-8 h-8 text-[#E30620] mb-4" />
                <h3 className="text-lg font-bold mb-2">Quality Audit & Flagging</h3>
                <p className="text-sm text-gray-600">Automated fraud detection flags unusually short interview durations, duplicate device IDs, and GPS coordinate mismatches.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <BarChart3 className="w-8 h-8 text-[#E30620] mb-4" />
                <h3 className="text-lg font-bold mb-2">Real-Time Dashboards</h3>
                <p className="text-sm text-gray-600">Monitor completion rates, quota progress, and enumerator performance across active national projects in real time.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <Download className="w-8 h-8 text-[#E30620] mb-4" />
                <h3 className="text-lg font-bold mb-2">Multi-Format Exports</h3>
                <p className="text-sm text-gray-600">Export clean datasets instantly in CSV, Excel (XLSX), SPSS (.sav), Stata (.dta), PDF, or KML mapping formats.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'pricing' && (
        <section className="bg-white text-[#111827] py-20 px-4 sm:px-8 flex-1">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-black text-[#E30620] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">TRANSPARENT PLANS</span>
              <h2 className="text-3xl sm:text-5xl font-black">Flexible Pricing for Research Teams</h2>
              <p className="text-gray-600 max-w-xl mx-auto">Choose the ideal tier for your field research agency, NGO, or corporate polling project.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
              
              <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Starter Field</span>
                  <h3 className="text-2xl font-black text-[#080B10] mt-1 mb-4">₦150,000 <span className="text-xs font-normal text-gray-500">/ month</span></h3>
                  <p className="text-sm text-gray-600 mb-6">Perfect for independent researchers and boutique polling assignments.</p>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E30620]" /> Up to 15 Active Enumerators</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E30620]" /> Offline Mobile PWA Support</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E30620]" /> GPS Coordinate Verification</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E30620]" /> Standard CSV & Excel Export</li>
                  </ul>
                </div>
                <button onClick={onContinueAsDemo} className="w-full mt-8 py-3 bg-[#080B10] text-white font-bold rounded-xl text-xs hover:bg-gray-800 transition-all">
                  Get Started
                </button>
              </div>

              <div className="bg-[#080B10] text-white border-2 border-[#E30620] rounded-3xl p-8 flex flex-col justify-between relative shadow-xl">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E30620] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                  Most Popular
                </div>
                <div>
                  <span className="text-xs font-bold text-[#E30620] uppercase tracking-wide">Enterprise Agency</span>
                  <h3 className="text-2xl font-black mt-1 mb-4">₦450,000 <span className="text-xs font-normal text-gray-400">/ month</span></h3>
                  <p className="text-sm text-gray-300 mb-6">Built for national research agencies conducting large-scale multi-state studies.</p>
                  <ul className="space-y-3 text-sm text-gray-200">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E30620]" /> Unlimited Enumerators</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E30620]" /> Advanced Geo-Lock Polygons</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E30620]" /> Automated Fraud & Outlier Detection</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E30620]" /> SPSS (.sav) & Stata (.dta) Exports</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E30620]" /> Dedicated Supabase Database</li>
                  </ul>
                </div>
                <button onClick={onContinueAsDemo} className="w-full mt-8 py-3 bg-[#E30620] hover:bg-[#c5051b] text-white font-bold rounded-xl text-xs shadow-lg transition-all">
                  Start Enterprise Trial
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Custom / Government</span>
                  <h3 className="text-2xl font-black text-[#080B10] mt-1 mb-4">Custom</h3>
                  <p className="text-sm text-gray-600 mb-6">For government censuses, international NGOs, and multi-country research programs.</p>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E30620]" /> On-Premise / Sovereign Hosting</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E30620]" /> Custom API Integrations</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E30620]" /> Dedicated Field Support Team</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#E30620]" /> SLA & 24/7 Monitoring</li>
                  </ul>
                </div>
                <button onClick={onOpenLogin} className="w-full mt-8 py-3 bg-gray-200 text-[#080B10] font-bold rounded-xl text-xs hover:bg-gray-300 transition-all">
                  Contact Sales
                </button>
              </div>

            </div>
          </div>
        </section>
      )}

      {activeSection === 'about' && (
        <section className="bg-white text-[#111827] py-20 px-4 sm:px-8 flex-1">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-black text-[#E30620] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">ABOUT CMRG LTD</span>
              <h2 className="text-3xl sm:text-5xl font-black">Communication and Marketing Research Group Limited</h2>
              <p className="text-gray-500 font-semibold">RC37852 • Nigeria's Premier Market Research & Field Data Agency</p>
            </div>
            
            <div className="prose prose-lg text-gray-700 space-y-6 leading-relaxed">
              <p>
                CMRG Ltd. (Communication and Marketing Research Group Limited) is a leading full-service market research and field data collection agency operating across Nigeria and West Africa. We specialize in quantitative and qualitative research, public opinion polling, consumer behavior tracking, and rigorous field quality assurance.
              </p>
              <p>
                Recognizing the unique infrastructural challenges of field research across Nigeria's 36 states and 774 Local Government Areas, CMRG developed <strong>CMRG Data Collect</strong> — an enterprise-grade mobile and web platform engineered specifically for reliable offline data collection, GPS geofence verification, and real-time analytical monitoring.
              </p>
              <div className="bg-gray-50 border-l-4 border-[#E30620] p-6 rounded-r-2xl my-6">
                <p className="font-bold text-[#080B10] m-0">Our Mission:</p>
                <p className="text-sm text-gray-600 m-0 mt-1">To empower researchers, enterprises, and governments with flawless, verifiable data that drives impactful decisions across Africa.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'support' && (
        <section className="bg-white text-[#111827] py-20 px-4 sm:px-8 flex-1">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-black text-[#E30620] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">HELP & ASSISTANCE</span>
              <h2 className="text-3xl sm:text-5xl font-black">Support & Technical Resources</h2>
              <p className="text-gray-600">Need help with enumerator deployment, questionnaire logic, or offline synchronization?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <Headphones className="w-8 h-8 text-[#E30620] mb-3" />
                <h3 className="text-lg font-bold mb-1">Field Support Desk</h3>
                <p className="text-sm text-gray-600 mb-4">Our Lagos operations team is available during active survey hours.</p>
                <p className="text-xs font-bold text-[#080B10]">support@cmrg.org • +234 (01) 295 4820</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <FileText className="w-8 h-8 text-[#E30620] mb-3" />
                <h3 className="text-lg font-bold mb-1">Documentation & Guides</h3>
                <p className="text-sm text-gray-600 mb-4">Access technical whitepapers, ODK XML standards, and enumerator manuals.</p>
                <button onClick={onContinueAsDemo} className="text-xs font-bold text-[#E30620] hover:underline flex items-center gap-1">
                  <span>View Technical Whitepaper</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* QR CODE MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white text-[#111827] rounded-3xl p-8 max-w-md w-full shadow-2xl relative text-center space-y-4">
            <button 
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-12 h-12 bg-red-50 text-[#E30620] rounded-2xl mx-auto flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black">Scan to Access CMRG Data Collect</h3>
            <p className="text-xs text-gray-600">
              Point your smartphone camera at the QR code below to launch the web-app instantly on Android or iOS.
            </p>

            <div className="w-56 h-56 bg-gray-50 border-2 border-dashed border-[#E30620] rounded-2xl p-4 mx-auto flex items-center justify-center relative">
              <div className="absolute top-2 left-2 w-3 h-3 bg-[#E30620]"></div>
              <div className="absolute top-2 right-2 w-3 h-3 bg-[#E30620]"></div>
              <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#E30620]"></div>
              <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#E30620]"></div>
              <div className="bg-black p-4 rounded-xl w-full h-full flex items-center justify-center text-white">
                <QrCode className="w-28 h-28 text-white" />
              </div>
            </div>

            <p className="text-[11px] text-gray-500 font-medium">
              URL: <strong className="text-gray-800">https://cmrg-data-collect.vercel.app</strong>
            </p>

            <button
              onClick={() => { setShowQRModal(false); onContinueAsDemo(); }}
              className="w-full py-3 bg-[#E30620] hover:bg-[#c5051b] text-white font-bold rounded-xl text-xs transition-all shadow-md"
            >
              Continue to App in Browser
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#04060A] text-gray-400 py-12 px-4 sm:px-8 border-t border-gray-900 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-900">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img 
                src="/assets/aistudio/WhatsApp_Image_2026-10-23_at_5.35.28_PM_edabd00e.jpeg" 
                alt="CMRG Ltd Logo" 
                className="h-8 w-auto object-contain bg-white rounded"
              />
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Communication and Marketing Research Group Limited (RC37852). Nigeria's trusted partner for market research, opinion polling, and field data collection.
            </p>
          </div>

          <div>
            <p className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Platform</p>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => setActiveSection('home')} className="hover:text-white transition-colors">Overview</button></li>
              <li><button onClick={() => setActiveSection('features')} className="hover:text-white transition-colors">Form Builder</button></li>
              <li><button onClick={() => setActiveSection('features')} className="hover:text-white transition-colors">Offline PWA</button></li>
              <li><button onClick={() => setActiveSection('features')} className="hover:text-white transition-colors">Geo-Lock Manager</button></li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Company</p>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => setActiveSection('about')} className="hover:text-white transition-colors">About CMRG Ltd</button></li>
              <li><button onClick={() => setActiveSection('pricing')} className="hover:text-white transition-colors">Pricing Tiers</button></li>
              <li><button onClick={() => setActiveSection('support')} className="hover:text-white transition-colors">Field Support</button></li>
              <li><button onClick={onOpenLogin} className="hover:text-white transition-colors">Admin Portal</button></li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Nigeria Operations</p>
            <p className="text-gray-400 text-[11px] leading-relaxed mb-2">
              12 Awolowo Road, Ikoyi, Lagos, Nigeria.<br />
              Email: info@cmrg.org<br />
              Phone: +234 (01) 295 4820
            </p>
            <button
              onClick={onContinueAsDemo}
              className="mt-2 px-3 py-1.5 bg-[#E30620] hover:bg-[#c5051b] text-white font-bold rounded-lg text-[11px] transition-all"
            >
              Launch App Demo
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} Communication and Marketing Research Group Limited (CMRG Ltd). All rights reserved.</p>
          <div className="flex items-center gap-4 mt-3 sm:mt-0">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-gray-400 cursor-pointer">Security Compliance</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
