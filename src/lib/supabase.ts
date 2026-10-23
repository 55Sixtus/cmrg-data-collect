import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_URL = 'https://kmwzmyupvqjitugpckzp.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttd3pteXVwdnFqaXR1Z3Bja3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MjQyODAsImV4cCI6MjEwODIwMDI4MH0.ql6hFTANRa4xPlYQ1lUaclTWP3fhr81ciDoUaurFvxc';

function sanitizeUrl(url?: string): string {
  if (!url) return SUPABASE_PROJECT_URL;
  let u = url.trim().replace(/^["'`]|["'`]$/g, '').trim();
  
  // Extract canonical domain if surrounded by quotes, brackets, or /rest/v1
  const match = u.match(/https:\/\/[a-z0-9-]+\.supabase\.co/i);
  if (match) {
    return match[0];
  }

  u = u.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  if (!u || u.includes('your-project') || u.includes('MY_APP_URL')) {
    return SUPABASE_PROJECT_URL;
  }
  return u;
}

function sanitizeKey(key?: string): string {
  if (!key) return SUPABASE_ANON_KEY;
  let k = key.trim().replace(/^["'`]|["'`]$/g, '').trim();

  // If the string contains a full valid JWT anywhere (even if surrounded by brackets, ellipsis, or notes)
  const jwtMatches = k.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g);
  if (jwtMatches && jwtMatches.length > 0) {
    // Pick the longest valid JWT token
    const validJwt = jwtMatches.find(j => j.split('.').length === 3 && j.length > 80);
    if (validJwt) {
      return validJwt;
    }
  }

  // Strip prefixes
  k = k.replace(/^(anon\s+public|public|anon|bearer)\s*:\s*/i, '').trim();
  k = k.replace(/^(anon\s+public|public|anon)\s+/i, '').trim();
  k = k.replace(/\s+/g, '');

  if (!k || k === 'your-anon-key' || k.length < 50 || k.includes('...')) {
    return SUPABASE_ANON_KEY;
  }
  return k;
}

export const supabaseUrl = sanitizeUrl(import.meta.env.VITE_SUPABASE_URL);
export const supabaseAnonKey = sanitizeKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.startsWith('eyJ')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { 
        persistSession: true, 
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;
