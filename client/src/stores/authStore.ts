import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@shared/schema';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setUserAndProfile: (user: User | null, profile: Profile | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setUserAndProfile: (user, profile) => set({ user, profile }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  refreshSession: async () => {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Session refresh error:', error);
      set({ user: null, profile: null });
      return;
    }
    if (session?.user) {
      set({ user: session.user });
    }
  },

  initialize: async () => {
    try {
      // Force refresh session first
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error || !session) {
        // Try getting existing session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession?.user) {
          set({ user: existingSession.user });

          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', existingSession.user.id)
            .single();

          set({ profile: profile || null });
        }
      } else if (session?.user) {
        set({ user: session.user });

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({ profile: profile || null });
      }

      set({ loading: false, initialized: true });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session?.user) {
          set({ user: session.user });

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          set({ profile: profile || null });
        } else {
          set({ user: null, profile: null });
        }
      });
    } catch (err) {
      console.error('Auth initialization error:', err);
      set({ loading: false, initialized: true, user: null, profile: null });
    }
  },
}));
