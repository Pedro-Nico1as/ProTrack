import { createStore } from 'zustand/vanilla';

interface Log {
  client_id: string;
  session_id: string | null;
  started_at: string;
  completed_at: string;
  duration_seconds: number;
  notes?: string;
}

interface SetLog {
  client_id: string;
  log_client_id: string;
  session_exercise_id: string | null;
  exercise_id?: string | null;
  set_number: number;
  weight_kg: number;
  reps_done: number;
  completed_at: string;
}

interface SyncState {
  pendingLogs: Log[];
  pendingSets: SetLog[];
  isSyncing: boolean;
  enqueueLog: (log: Log) => void;
  enqueueSet: (set: SetLog) => void;
  clearSyncedData: (logIds: string[], setIds: string[]) => void;
  setSyncing: (isSyncing: boolean) => void;
}

export const useSyncStore = createStore<SyncState>((set) => ({
  pendingLogs: [],
  pendingSets: [],
  isSyncing: false,
  enqueueLog: (log: Log) => set((state: SyncState) => ({ pendingLogs: [...state.pendingLogs, log] })),
  enqueueSet: (setLog: SetLog) => set((state: SyncState) => ({ pendingSets: [...state.pendingSets, setLog] })),
  clearSyncedData: (logIds: string[], setIds: string[]) =>
    set((state: SyncState) => ({
      pendingLogs: state.pendingLogs.filter((l: Log) => !logIds.includes(l.client_id)),
      pendingSets: state.pendingSets.filter((s: SetLog) => !setIds.includes(s.client_id)),
    })),
  setSyncing: (isSyncing: boolean) => set({ isSyncing }),
}));
