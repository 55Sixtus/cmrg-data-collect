import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://kmwzmyupvqjitugpckzp.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttd3pteXVwdnFqaXR1Z3Bja3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MjQyODAsImV4cCI6MjEwODIwMDI4MH0.ql6hFTANRa4xPlYQ1lUaclTWP3fhr81ciDoUaurFvxc';

function sanitizeUrl(url?: string): string {
  if (!url) return FALLBACK_URL;
  let u = url.trim().replace(/^["'`]|["'`]$/g, '').trim();
  u = u.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  if (!u || u.includes('your-project') || u.includes('MY_APP_URL')) {
    return FALLBACK_URL;
  }
  return u;
}

function sanitizeKey(key?: string): string {
  if (!key) return FALLBACK_KEY;
  let k = key.trim().replace(/^["'`]|["'`]$/g, '').trim();
  // Strip accidental prefixes like 'public: ', 'anon: ', 'anon public: ', 'Bearer '
  k = k.replace(/^(anon\s+public|public|anon|bearer)\s*:\s*/i, '').trim();
  k = k.replace(/^(anon\s+public|public|anon)\s+/i, '').trim();
  // Strip any internal spaces or linebreaks
  k = k.replace(/\s+/g, '');
  if (!k || k === 'your-anon-key' || k.length < 20) {
    return FALLBACK_KEY;
  }
  return k;
}

const supabaseUrl = sanitizeUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = sanitizeKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('MY_APP_URL')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    })
  : null;
