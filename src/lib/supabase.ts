import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_URL = 'https://kmwzmyupvqjitugpckzp.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttd3pteXVwdnFqaXR1Z3Bja3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MjQyODAsImV4cCI6MjEwODIwMDI4MH0.ql6hFTANRa4xPlYQ1lUaclTWP3fhr81ciDoUaurFvxc';

function extractJwtRef(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = typeof atob !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf8');
    const parsed = JSON.parse(jsonStr);
    return parsed?.ref || null;
  } catch {
    return null;
  }
}

function sanitizeUrl(url?: string): string {
  if (!url) return SUPABASE_PROJECT_URL;
  let u = url.trim().replace(/^["'`]|["'`]$/g, '').trim();
  
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

  // If the string contains a full valid JWT anywhere (even if surrounded by brackets, notes, or prefixes)
  const jwtMatches = k.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g);
  if (jwtMatches && jwtMatches.length > 0) {
    for (const match of jwtMatches) {
      if (match.length > 80 && extractJwtRef(match) === 'kmwzmyupvqjitugpckzp') {
        return match;
      }
    }
  }

  // Strip common user-typed prefixes including "ANNON KEY:" or "anon public:"
  k = k.replace(/^(annon\s+key|anon\s+key|anon\s+public|public|anon|bearer)\s*:\s*/i, '').trim();
  k = k.replace(/^(annon|anon\s+public|public|anon)\s+/i, '').trim();
  k = k.replace(/\s+/g, '');

  if (!k || k === 'your-anon-key' || k.length < 50 || k.includes('...')) {
    return SUPABASE_ANON_KEY;
  }

  // Validate that the project ref in the JWT matches the CMRG project
  const ref = extractJwtRef(k);
  if (ref && ref !== 'kmwzmyupvqjitugpckzp') {
    console.warn(`[Supabase Config] Provided API key belongs to project "${ref}", but expected "kmwzmyupvqjitugpckzp". Falling back to verified CMRG key.`);
    return SUPABASE_ANON_KEY;
  }

  return k;
}

export let supabaseUrl = sanitizeUrl(import.meta.env.VITE_SUPABASE_URL);
export let supabaseAnonKey = sanitizeKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

export let isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.startsWith('eyJ')
);

export function buildSupabaseClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: { 
      persistSession: true, 
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}

export let supabase: SupabaseClient | null = isSupabaseConfigured
  ? buildSupabaseClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Resets the client to the verified CMRG Supabase URL and verified Anon Key.
 * Useful if environment variables on Vercel or local storage held an invalid key.
 */
export function resetSupabaseClient(): SupabaseClient {
  console.log('[Supabase Config] Resetting to verified canonical CMRG project key...');
  supabaseUrl = SUPABASE_PROJECT_URL;
  supabaseAnonKey = SUPABASE_ANON_KEY;
  isSupabaseConfigured = true;
  supabase = buildSupabaseClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}
