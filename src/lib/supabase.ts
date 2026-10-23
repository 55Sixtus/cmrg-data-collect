import { createClient } from '@supabase/supabase-js';

let rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kmwzmyupvqjitugpckzp.supabase.co';
// Sanitize URL in case user pasted /rest/v1/ or trailing slashes
rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

const supabaseUrl = rawUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttd3pteXVwdnFqaXR1Z3Bja3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MjQyODAsImV4cCI6MjEwODIwMDI4MH0.ql6hFTANRa4xPlYQ1lUaclTWP3fhr81ciDoUaurFvxc';

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
