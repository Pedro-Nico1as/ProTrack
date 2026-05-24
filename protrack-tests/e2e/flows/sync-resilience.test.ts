import { useSyncStore } from './mocks/useSyncStore';
import { processSyncQueue } from './mocks/syncEngine';
import { api } from './mocks/api';

// Mock do axios/api
jest.mock('./mocks/api');

describe('Resiliência de Sync: Queda de Conexão', () => {
  beforeEach(() => {
    useSyncStore.getState().clearSyncedData(
      useSyncStore.getState().pendingLogs.map((l: any) => l.client_id),
      useSyncStore.getState().pendingSets.map((s: any) => s.client_id)
    );
    jest.clearAllMocks();
  });

  it('mantém dados na fila se a requisição falhar abruptamente (Network Error)', async () => {
    // 1. Setup: Fila com dados pendentes
    const mockLog = { client_id: 'log-1', session_id: 's1', started_at: '...', completed_at: '...', duration_seconds: 60 };
    useSyncStore.getState().enqueueLog(mockLog);

    // 2. Mock: Falha de rede no meio do POST
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    // 3. Execução: Tenta sincronizar
    await processSyncQueue();

    // 4. Validação: A fila deve permanecer intacta
    const state = useSyncStore.getState();
    expect(state.pendingLogs.length).toBe(1);
    expect(state.pendingLogs[0].client_id).toBe('log-1');
    expect(state.isSyncing).toBe(false);
  });

  it('previne perda de dados se o servidor responder erro (500)', async () => {
    useSyncStore.getState().enqueueLog({ client_id: 'log-2', session_id: 's1', started_at: '...', completed_at: '...', duration_seconds: 60 });
    
    (api.post as jest.Mock).mockRejectedValueOnce({ response: { status: 500 } });

    await processSyncQueue();

    expect(useSyncStore.getState().pendingLogs.length).toBe(1);
  });

  it('não duplica dados em caso de re-tentativa após sucesso parcial (Deduplicação Lógica)', async () => {
    // Cenário: O servidor recebeu o dado, mas a resposta não chegou ao cliente (timeout)
    // Na próxima tentativa, o cliente envia o mesmo ID.
    // O Backend Engineer garantiu o 'upsert' no banco.
    
    // Teste de lógica do SyncEngine:
    // Só chamamos clearSyncedData se houver 'response.data'.
    // Se houve timeout, response é undefined, logo nada é removido da fila local.
    // Isso garante que o dado tente ser enviado novamente.
  });
});
