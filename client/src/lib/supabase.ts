import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';

// For Capacitor, use localStorage instead of default
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage, // Explicitly use localStorage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for mobile apps
  },
});
