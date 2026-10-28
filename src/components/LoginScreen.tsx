import React, { useState } from 'react';
import { supabase, resetSupabaseClient } from '../lib/supabase';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight, 
  UserPlus, 
  LogIn, 
  Globe,
  Check
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onContinueAsDemo?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onContinueAsDemo }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('greatezirim8@gmail.com');
  const [password, setPassword] = useState('Admin2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);

  const sanitizeEmailInput = (raw: string): string => {
    let clean = raw.trim();
    if (!clean.includes('@')) {
      const match = clean.match(/^(.+?)(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|cmrg\.org)$/i);
      if (match) {
        clean = `${match[1]}@${match[2]}`;
      }
    }
    return clean;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = sanitizeEmailInput(email);
    if (!finalEmail || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    let client = supabase;
    if (!client) {
      client = resetSupabaseClient();
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmailNotConfirmed(false);

    try {
      if (mode === 'signin') {
        let authResult = await client.auth.signInWithPassword({
          email: finalEmail,
          password
        });

        if (
          authResult.error && 
          (authResult.error.message?.toLowerCase().includes('api key') ||
           (authResult.error as any).status === 401)
        ) {
          client = resetSupabaseClient();
          authResult = await client.auth.signInWithPassword({
            email: finalEmail,
            password
          });
        }

        if (authResult.error) {
          const err = authResult.error;
          if (err.message.toLowerCase().includes('email not confirmed') || (err as any).code === 'email_not_confirmed') {
            setEmailNotConfirmed(true);
            setErrorMessage('Your account email has not been confirmed yet. Please check your inbox or confirm the user in your authentication settings.');
            return;
          }
          throw err;
        }

        if (authResult.data.session) {
          onLoginSuccess();
        }
      } else {
        let authResult = await client.auth.signUp({
          email: finalEmail,
          password
        });

        if (authResult.error) {
          throw authResult.error;
        }

        if (authResult.data.session) {
          onLoginSuccess();
        } else if (authResult.data.user) {
          setSuccessMessage(`Account created for ${finalEmail}! Please sign in with your credentials.`);
          setMode('signin');
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify credentials.';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        setErrorMessage('Invalid login credentials. Please check your email and password or create a new account.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col lg:flex-row font-sans selection:bg-[#E30620] selection:text-white">
      
      {/* LEFT SIDE: HERO BRANDING & VALUE PROPOSITION (Matching Image 2) */}
      <div className="lg:w-7/12 relative bg-gradient-to-br from-[#0F172A] via-[#0B0F17] to-[#1E0406] p-8 lg:p-16 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
        
        {/* Background decorative glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E30620]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onContinueAsDemo}>
            <img 
              src="/assets/aistudio/cmrg_logo_clean.png" 
              alt="CMRG Ltd." 
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">CMRG Ltd.</p>
            <p className="text-[10px] text-gray-400">Research for a Better Tomorrow</p>
          </div>
        </div>

        {/* Center Hero Copy */}
        <div className="relative z-10 my-auto py-12 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400">
            <span className="w-2 h-2 rounded-full bg-[#E30620] animate-pulse"></span>
            Enterprise Field Research Suite v4.8
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.08]">
            Real People.<br />
            <span className="text-[#E30620]">Real Data.</span><br />
            Real Insights.
          </h1>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            A smarter way to manage field research, nationwide public opinion polls, surveys and data collection.
          </p>

          {/* 4 Feature Pills */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-[#E30620]/20 flex items-center justify-center text-[#E30620]">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-gray-200">Mobile Data Collection</span>
            </div>

            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-[#E30620]/20 flex items-center justify-center text-[#E30620]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-gray-200">GPS &amp; Geofencing</span>
            </div>

            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-[#E30620]/20 flex items-center justify-center text-[#E30620]">
                <LogIn className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-gray-200">Real-time Dashboards</span>
            </div>

            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-[#E30620]/20 flex items-center justify-center text-[#E30620]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-gray-200">Secure &amp; Reliable</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Links */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div className="flex items-center gap-6">
            <span>Market Research</span>
            <span>Public Opinion Polling</span>
            <span>Social Research</span>
            <span>Field Surveys</span>
          </div>
          <p>© 2026 CMRG Ltd. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT SIDE: PROFESSIONAL LOGIN / SIGNUP CARD (Matching Image 2) */}
      <div className="lg:w-5/12 bg-white text-[#111827] p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
        
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#E30620] flex items-center justify-center shadow-lg shadow-red-900/30 mb-4">
              <div className="grid grid-cols-2 gap-0.5 w-6 h-6">
                <div className="bg-white rounded-[1px]"></div>
                <div className="bg-white rounded-[1px]"></div>
                <div className="bg-white rounded-[1px]"></div>
                <div className="bg-white/40 rounded-[1px]"></div>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-gray-500">
              {mode === 'signin' ? 'Sign in to access your research workspace.' : 'Register a new administrator or researcher profile.'}
            </p>
          </div>

          {/* Quick Prefill for Evaluation */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <div>
                <p className="font-bold text-emerald-900 leading-tight">Demo Admin Account</p>
                <p className="text-[11px] text-emerald-700 font-mono">greatezirim8@gmail.com</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('greatezirim8@gmail.com');
                setPassword('Admin2026');
                setMode('signin');
                setErrorMessage(null);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs transition-colors"
            >
              Prefill Login
            </button>
          </div>

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-[#E30620] p-3.5 rounded-xl flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong>Authentication Notice: </strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-semibold text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@cmrg.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmail(sanitizeEmailInput(email))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E30620]/20 focus:border-[#E30620] font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-gray-700">Password</label>
                {mode === 'signin' && (
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact system administrator to reset password.'); }} className="text-[11px] font-semibold text-[#E30620] hover:underline">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E30620]/20 focus:border-[#E30620] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signin' && (
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                  className="rounded border-gray-300 text-[#E30620] focus:ring-[#E30620]"
                />
                <label htmlFor="remember" className="text-xs text-gray-600 select-none cursor-pointer">Remember me for 30 days</label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E30620] hover:bg-red-700 text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Logins matching Image 2 */}
          <div className="space-y-3 pt-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-[11px] font-semibold uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={onContinueAsDemo}
              className="w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={onContinueAsDemo}
              className="w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <div className="flex gap-0.5 items-center">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              </div>
              <span>Continue with Zoho</span>
            </button>
          </div>

          {/* Mode switch */}
          <div className="text-center pt-2 text-xs">
            {mode === 'signin' ? (
              <p className="text-gray-500">
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="font-bold text-[#E30620] hover:underline">
                  Create account
                </button>
              </p>
            ) : (
              <p className="text-gray-500">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('signin')} className="font-bold text-[#E30620] hover:underline">
                  Sign in
                </button>
              </p>
            )}
          </div>

        </div>

        {/* Secure Footer */}
        <div className="pt-6 border-t border-gray-100 text-center text-[11px] text-gray-400 space-y-1">
          <p className="font-semibold text-gray-600">Secure access to your projects, questionnaires, fieldwork and research data.</p>
          <p>© 2026 CMRG Ltd. All rights reserved. • Secure Research. Reliable Data.</p>
        </div>

      </div>

    </div>
  );
};
