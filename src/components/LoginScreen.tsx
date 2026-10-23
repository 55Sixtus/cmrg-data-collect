import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle, Eye, EyeOff, Wrench } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (!supabase) {
      setErrorMessage('Supabase client is not initialized. Please verify environment configuration.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col justify-center items-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2.5">
            <div className="grid grid-cols-4 gap-0.5 bg-[#C8202F] p-1.5 rounded-sm shadow-xs">
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
            <p className="text-xs text-gray-500 font-medium mt-1">
              Enterprise Field Intelligence & Situation Room
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5 tracking-wide">
              Tech savvy <span className="text-[#C8202F]">•</span> Data Integrity <span className="text-[#C8202F]">•</span> Actionable insights
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-[#C8202F] p-3.5 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-semibold">Sign-in Error</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="block font-semibold text-gray-700">Enterprise Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="name@cmrg.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C8202F] hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with Supabase...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Secure Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Footer security notice & Bold Static Developer Watermark */}
        <div className="pt-4 border-t border-gray-100 text-center space-y-3">
          <p className="text-[11px] text-gray-500">
            Protected by Supabase Auth & Row Level Security (RLS).
          </p>

          <div className="bg-[#C8202F] text-white rounded-xl p-3 shadow-md text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-red-100">
              <Wrench className="w-3.5 h-3.5 text-white" />
              <span>APP DEVELOPER</span>
            </div>
            <p className="text-xs font-extrabold text-white tracking-tight">SIXTUS TECH HUB</p>
            <div className="bg-black/20 rounded-lg py-1 px-2 mt-1 inline-block">
              <span className="text-xs font-mono font-bold text-white tracking-widest">08120678052</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
