import { create } from 'zustand';

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

export const useSyncStore = create<SyncState>((set) => ({
  pendingLogs: [],
  pendingSets: [],
  isSyncing: false,
  enqueueLog: (log) => set((state) => ({ pendingLogs: [...state.pendingLogs, log] })),
  enqueueSet: (setLog) => set((state) => ({ pendingSets: [...state.pendingSets, setLog] })),
  clearSyncedData: (logIds, setIds) =>
    set((state) => ({
      pendingLogs: state.pendingLogs.filter((l) => !logIds.includes(l.client_id)),
      pendingSets: state.pendingSets.filter((s) => !setIds.includes(s.client_id)),
    })),
  setSyncing: (isSyncing) => set({ isSyncing }),
}));
