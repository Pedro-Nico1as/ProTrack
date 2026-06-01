import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { useActiveWorkoutStore } from './useActiveWorkoutStore';

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
    // Limpa estado de treino ativo ao sair
    useActiveWorkoutStore.getState().finishWorkout();

    await supabase.auth.signOut();
    set({ session: null, user: null, isResettingPassword: false });
  },
}));

// Listener para mudanças no estado de auth
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});
