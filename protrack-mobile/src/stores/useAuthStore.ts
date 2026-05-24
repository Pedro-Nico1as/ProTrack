import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  isInitialized: boolean;
  isResettingPassword: boolean;
  setSession: (session: Session | null) => void;
  setIsResettingPassword: (val: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isInitialized: false,
  isResettingPassword: false,
  setSession: (session) => set({ session, user: session?.user || null, isInitialized: true }),
  setIsResettingPassword: (isResettingPassword) => set({ isResettingPassword }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, isResettingPassword: false });
  },
}));

// Listener para mudanças no estado de auth
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});
