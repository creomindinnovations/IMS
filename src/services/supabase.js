import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => Boolean(url && anonKey);

export const supabase = isSupabaseConfigured()
  ? createClient(url, anonKey)
  : null;

/** Separate client for admin creating users without replacing the admin session */
export const supabaseAdminCreate = isSupabaseConfigured()
  ? createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
  }
  return supabase;
}
