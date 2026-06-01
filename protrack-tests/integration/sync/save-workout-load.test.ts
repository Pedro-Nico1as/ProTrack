import { api, TEST_USER } from '../helpers';

describe('Save-Workout: Load and Volume Validation', () => {
  const saveWorkoutEndpoint = '/functions/v1/save-workout';

  const generateSets = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
      session_exercise_id: 'exercise-template-uuid',
      exercise_id: 'exercise-uuid',
      set_number: i + 1,
      weight_kg: 80.5,
      reps_done: 10,
      completed_at: new Date().toISOString()
    }));
  };

  it('suporta volume de dados esperado (Múltiplos sets)', async () => {
    const sets = generateSets(15);
    const payload = {
      workout: {
        session_id: 'session-template-uuid',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        duration_seconds: 3600,
        notes: 'Volume load test log'
      },
      sets
    };

    const response = await api.post(saveWorkoutEndpoint, payload, TEST_USER.token);
    
    expect(response.status).toBe(200);
    expect(response.body.log_id).toBeDefined();
    expect(response.body.sets_saved).toBe(sets.length);
  });

  it('verifica erro 401 para payloads sem Authorization header', async () => {
    const payload = {
      workout: {
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      },
      sets: []
    };
    const response = await api.post(saveWorkoutEndpoint, payload); 
    
    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Missing Authorization header');
  });
});
