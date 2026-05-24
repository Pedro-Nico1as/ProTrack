import { api } from './api';
import { useSyncStore } from './useSyncStore';

export async function processSyncQueue(): Promise<void> {
  const store = useSyncStore.getState();
  
  if (store.isSyncing) return;
  
  const logs = store.pendingLogs;
  const sets = store.pendingSets;
  
  if (logs.length === 0 && sets.length === 0) return;
  
  store.setSyncing(true);
  
  try {
    const response = await api.post('/sync-workout', { logs, sets });
    
    if (response && response.data) {
      const { synced_ids = [], conflicts = [] } = response.data;
      
      const idsToRemove = [...synced_ids, ...conflicts];
      
      const logIdsToRemove = logs
        .filter((l) => idsToRemove.includes(l.client_id))
        .map((l) => l.client_id);
      const setIdsToRemove = sets
        .filter((s) => idsToRemove.includes(s.client_id))
        .map((s) => s.client_id);
        
      store.clearSyncedData(logIdsToRemove, setIdsToRemove);
    }
  } catch (error) {
    // Treat as error to not clean the queue
  } finally {
    store.setSyncing(false);
  }
}
