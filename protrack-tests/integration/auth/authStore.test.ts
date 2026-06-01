// Mock supabase client to avoid network requests during store tests
jest.mock('../../../protrack-mobile/src/services/supabase', () => ({
  supabase: {
    auth: {
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(),
    },
  },
}));

// Mock other stores to prevent react-native-mmkv import issues in Node environment
jest.mock('../../../protrack-mobile/src/stores/useCustomWorkoutsStore', () => ({
  useCustomWorkoutsStore: {
    getState: () => ({
      clearWorkouts: jest.fn(),
    }),
  },
}));

jest.mock('../../../protrack-mobile/src/stores/useActiveWorkoutStore', () => ({
  useActiveWorkoutStore: {
    getState: () => ({
      finishWorkout: jest.fn(),
    }),
  },
}));

import { useAuthStore } from '../../../protrack-mobile/src/stores/useAuthStore';
import { supabase } from '../../../protrack-mobile/src/services/supabase';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useAuthStore.setState({
      session: null,
      user: null,
      isInitialized: false,
      isResettingPassword: false,
    });
  });

  it('initializes with default values', () => {
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isInitialized).toBe(false);
    expect(state.isResettingPassword).toBe(false);
  });

  it('updates session and user via setSession', () => {
    const mockUser = { id: 'user-123', email: 'test@protrack.com' } as any;
    const mockSession = { access_token: 'token-abc', user: mockUser } as any;

    useAuthStore.getState().setSession(mockSession);

    const state = useAuthStore.getState();
    expect(state.session).toEqual(mockSession);
    expect(state.user).toEqual(mockUser);
    expect(state.isInitialized).toBe(true);
  });

  it('handles null session via setSession', () => {
    useAuthStore.getState().setSession(null);

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isInitialized).toBe(true);
  });

  it('toggles isResettingPassword via setIsResettingPassword', () => {
    useAuthStore.getState().setIsResettingPassword(true);
    expect(useAuthStore.getState().isResettingPassword).toBe(true);

    useAuthStore.getState().setIsResettingPassword(false);
    expect(useAuthStore.getState().isResettingPassword).toBe(false);
  });

  it('clears state on signOut', async () => {
    const mockUser = { id: 'user-123', email: 'test@protrack.com' } as any;
    const mockSession = { access_token: 'token-abc', user: mockUser } as any;

    useAuthStore.getState().setSession(mockSession);
    useAuthStore.getState().setIsResettingPassword(true);

    await useAuthStore.getState().signOut();

    const state = useAuthStore.getState();
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isResettingPassword).toBe(false);
  });
});
