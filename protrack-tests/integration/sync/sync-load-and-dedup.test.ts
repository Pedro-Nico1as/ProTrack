import { api, TEST_USER } from '../helpers';

describe('Sync-Workout: Load and Deduplication Validation', () => {
  const syncEndpoint = '/functions/v1/sync-workout';

  const generateLogs = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
      client_id: `log-uuid-${i}`,
      session_id: 'session-template-uuid',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      duration_seconds: 3600,
      notes: `Batch test log ${i}`
    }));
  };

  const generateSets = (logClientId: string, count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
      client_id: `set-uuid-${logClientId}-${i}`,
      log_client_id: logClientId,
      session_exercise_id: 'exercise-template-uuid',
      set_number: i + 1,
      weight_kg: 80.5,
      reps_done: 10,
      completed_at: new Date().toISOString()
    }));
  };

  it('suporta volume de dados esperado (Múltiplos logs e sets)', async () => {
    const logs = generateLogs(5);
    const sets = [
      ...generateSets(logs[0].client_id, 3),
      ...generateSets(logs[1].client_id, 3),
      ...generateSets(logs[2].client_id, 2),
    ];

    const payload = { logs, sets };
    const response = await api.post(syncEndpoint, payload, TEST_USER.token);
    
    expect(response.status).toBe(200);
    expect(response.body.synced).toBe(logs.length + sets.length);
  });

  it('valida comportamento de deduplicação (client_id upsert)', async () => {
    const singleLog = generateLogs(1);
    const payload = { logs: singleLog, sets: [] };

    // Primeira chamada: Cria o registro
    const res1 = await api.post(syncEndpoint, payload, TEST_USER.token);
    expect(res1.body.synced).toBe(1);
    
    // Segunda chamada com o mesmo client_id: Deve fazer upsert
    const res2 = await api.post(syncEndpoint, payload, TEST_USER.token);
    expect(res2.status).toBe(200);
    expect(res2.body.synced).toBe(1); // Upsert conta como 1 processado
  });

  it('verifica erro 400 para payloads sem Authorization header', async () => {
    const payload = { logs: [], sets: [] };
    const response = await api.post(syncEndpoint, payload); 
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Unauthorized');
  });
});
