import React, { useState } from 'react';
import { supabase, supabaseUrl, resetSupabaseClient, SUPABASE_ANON_KEY } from '../lib/supabase';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  UserPlus, 
  LogIn, 
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Key
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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showVercelGuide, setShowVercelGuide] = useState(false);
  const [isApiKeyError, setIsApiKeyError] = useState(false);

  // Auto-correct common typos like missing '@' in greatezirim8gmail.com
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

  const handleFixAndResetKey = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      resetSupabaseClient();
      setIsApiKeyError(false);
      setSuccessMessage('Successfully reset Supabase client to the verified CMRG Anon Key! Retrying authentication...');
      
      // Attempt auto-login with current form credentials
      const finalEmail = sanitizeEmailInput(email);
      if (supabase && finalEmail && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: finalEmail,
          password
        });
        if (!error && data.session) {
          onLoginSuccess();
          return;
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reinitialize Supabase client.');
    } finally {
      setLoading(false);
    }
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
    setIsApiKeyError(false);

    try {
      if (mode === 'signin') {
        let authResult = await client.auth.signInWithPassword({
          email: finalEmail,
          password
        });

        // Self-Healing mechanism: if invalid API key is reported from bad environment or cache
        if (
          authResult.error && 
          (authResult.error.message?.toLowerCase().includes('api key') ||
           (authResult.error as any).status === 401)
        ) {
          console.warn('Invalid API key detected during sign in. Auto-healing with verified CMRG key...');
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
            setErrorMessage('Your account email has not been confirmed yet. Please check your inbox or confirm the user in Supabase Authentication Dashboard.');
            return;
          }

          if (err.message.toLowerCase().includes('api key')) {
            setIsApiKeyError(true);
            setErrorMessage('Invalid API Key: The client encountered an API key error. Click "Fix & Use Verified Key" below to connect with the tested CMRG Anon Key.');
            return;
          }

          throw err;
        }

        if (authResult.data.session) {
          onLoginSuccess();
        }
      } else {
        // Sign up flow
        let authResult = await client.auth.signUp({
          email: finalEmail,
          password
        });

        if (
          authResult.error && 
          authResult.error.message?.toLowerCase().includes('api key')
        ) {
          client = resetSupabaseClient();
          authResult = await client.auth.signUp({
            email: finalEmail,
            password
          });
        }

        if (authResult.error) {
          throw authResult.error;
        }

        if (authResult.data.session) {
          onLoginSuccess();
        } else if (authResult.data.user) {
          setSuccessMessage(
            `Account created for ${finalEmail}! A confirmation link has been sent to your inbox. You can also auto-confirm this user directly in your Supabase Dashboard under Authentication -> Users.`
          );
          setMode('signin');
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify credentials.';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        setErrorMessage('Invalid login credentials. If you have not registered this email yet, click "Create Account" below.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    const finalEmail = sanitizeEmailInput(email);
    if (!finalEmail || !supabase) return;
    setResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: finalEmail
      });
      if (error) throw error;
      setSuccessMessage('Confirmation email resent successfully! Please check your inbox and spam folder.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not resend confirmation email.');
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden p-6 sm:p-8 space-y-5">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2.5">
            <div className="grid grid-cols-4 gap-0.5 bg-[#C8202F] p-1.5 rounded shadow-xs">
              <div className="w-2 h-2 bg-white rounded-2xs"></div>
              <div className="w-2 h-2 bg-white rounded-2xs"></div>
              <div className="w-2 h-2 bg-white rounded-2xs"></div>
              <div className="w-2 h-2 bg-white rounded-2xs"></div>
              <div className="w-2 h-2 bg-white rounded-2xs"></div>
              <div className="w-2 h-2 bg-white rounded-2xs"></div>
              <div className="w-2 h-2 bg-white rounded-2xs"></div>
              <div className="w-2 h-2 bg-white rounded-2xs"></div>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#17243A] tracking-tight">
              CMRG <span className="text-[#C8202F]">DATA COLLECT</span>
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Enterprise Field Intelligence &amp; Situation Room
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-2 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-medium text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Supabase Connected ({supabaseUrl.replace('https://', '')})</span>
            </div>
          </div>
        </div>

        {/* Mode Toggle: Sign In vs Create Account */}
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMessage(null); setIsApiKeyError(false); }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signin' ? 'bg-white text-[#17243A] shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(null); setIsApiKeyError(false); }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signup' ? 'bg-white text-[#17243A] shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Account
          </button>
        </div>

        {/* Success Notification */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-start gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-[#C8202F] p-3.5 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <strong className="block font-semibold">
                {emailNotConfirmed ? 'Email Confirmation Required' : isApiKeyError ? 'Invalid API Key Detected' : 'Sign-in Notice'}
              </strong>
              <span>{errorMessage}</span>

              {isApiKeyError && (
                <div className="pt-2 border-t border-red-200/60 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={handleFixAndResetKey}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#C8202F] hover:bg-red-700 px-3 py-2 rounded-lg shadow-xs transition-colors"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Fix &amp; Use Verified CMRG Key Now</span>
                  </button>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    This resets your browser session to the active Supabase anon key for project kmwzmyupvqjitugpckzp.
                  </p>
                </div>
              )}
              
              {emailNotConfirmed && (
                <div className="pt-2 border-t border-red-200/60 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendingEmail}
                    className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-white bg-[#C8202F] px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {resendingEmail ? 'Resending...' : 'Resend Confirmation Email'}
                  </button>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    Tip: If you are the Supabase admin, go to <strong>Authentication &gt; Users</strong> in Supabase Dashboard and click <strong>"Confirm Email"</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verified Admin Credentials Quick Prefill */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <div>
              <p className="font-bold text-emerald-900 leading-tight">Verified Admin Account</p>
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
              setIsApiKeyError(false);
            }}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] shadow-2xs transition-colors"
          >
            Prefill Login
          </button>
        </div>

        {/* Login / Signup Form */}
        <form onSubmit={handleAuth} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-gray-700">Administrator / Researcher Email</label>
              {email.includes('gmail.com') && !email.includes('@') && (
                <span className="text-[10px] text-emerald-600 font-medium">Auto-corrected with @</span>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="name@cmrg.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmail(sanitizeEmailInput(email))}
                className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg pl-9 pr-4 py-3 text-xs text-[#1B2430] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8202F]/20 focus:border-[#C8202F]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F6F7F9] border border-gray-200 rounded-lg pl-9 pr-10 py-3 text-xs text-[#1B2430] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8202F]/20 focus:border-[#C8202F]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-[11px] text-gray-500">Must be at least 6 characters.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C8202F] hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === 'signin' ? 'Authenticating with Supabase...' : 'Creating User in Supabase...'}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{mode === 'signin' ? 'Sign In to Secure Dashboard' : 'Register Administrator Account'}</span>
              </>
            )}
          </button>
        </form>

        {/* Demo / Sandbox Quick Access */}
        {onContinueAsDemo && (
          <div>
            <button
              type="button"
              onClick={onContinueAsDemo}
              className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-[#17243A] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Explore Dashboard in Demo / Sandbox Mode</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        )}

        {/* Vercel Environment & Build Cache Help Section */}
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
          <button
            type="button"
            onClick={() => setShowVercelGuide(!showVercelGuide)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-gray-700 hover:bg-gray-100/70 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-gray-500" />
              <span>Vercel Deployment &amp; Build Cache Guide</span>
            </span>
            {showVercelGuide ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
          </button>
          
          {showVercelGuide && (
            <div className="p-3.5 pt-1 space-y-3 text-[11px] text-gray-600 border-t border-gray-200 bg-white">
              <div className="space-y-1">
                <p className="font-bold text-gray-900">1. Why Vercel says: "Remove public framework prefix..."</p>
                <p className="leading-relaxed">
                  Vercel flags variables with prefixes like <code className="bg-gray-100 px-1 py-0.5 rounded text-[#C8202F]">VITE_</code> because they are bundled into client browsers. <strong>This is normal and safe for Supabase Anon Key</strong>, because Supabase Anon keys are public keys protected by Row-Level Security (RLS). You can safely ignore Vercel's prompt, or simply omit it because the app has the verified key built-in as a fallback.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-gray-900">2. Why "Use existing Build Cache" caused the old error:</p>
                <p className="leading-relaxed">
                  Vite bundles environment variables into static JS chunks at build time. If you rebuild on Vercel with <em>"Use existing Build Cache"</em>, Vercel skips rebuilding and serves the old cached code with the broken key. 
                </p>
                <p className="bg-amber-50 border border-amber-200 p-2 rounded text-amber-900 font-medium">
                  <strong>Fix on Vercel:</strong> In your Vercel Project Dashboard &gt; Deployments &gt; Click the 3 dots &gt; Select <strong>"Redeploy"</strong> &gt; <strong>UNCHECK "Use existing Build Cache"</strong> (or click "Redeploy without Cache").
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleFixAndResetKey}
                  className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Re-verify Connection to kmwzmyupvqjitugpckzp</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Static Developer Watermark */}
        <div className="pt-2 border-t border-gray-100 text-center space-y-3">
          <p className="text-[11px] text-gray-500">
            Protected by Supabase Auth &amp; Row Level Security (RLS).
          </p>

          <div className="bg-[#C8202F] text-white rounded-xl p-3 shadow-md text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-red-100">
              <Wrench className="w-3.5 h-3.5 text-white" />
              <span>APP DEVELOPER</span>
            </div>
            <p className="text-xs font-extrabold text-white tracking-tight">SIXTUS TECH HUB</p>
            <div className="bg-black/20 rounded-lg py-1 px-2.5 mt-1 inline-block">
              <span className="text-xs font-mono font-bold text-white tracking-widest">08120678052</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
