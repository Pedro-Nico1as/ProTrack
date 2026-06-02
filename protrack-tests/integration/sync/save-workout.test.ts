import { api, TEST_USER } from '../helpers';

describe('POST /functions/v1/save-workout', () => {
  const saveWorkoutEndpoint = '/functions/v1/save-workout';

  const validPayload = {
    workout: {
      session_id: 'd290f1ee-6c54-4b01-90e6-d701748f0852',
      started_at: '2024-05-09T18:00:00Z',
      completed_at: '2024-05-09T19:00:00Z',
      duration_seconds: 3600,
      notes: 'Treino pesado hoje'
    },
    sets: [
      {
        session_exercise_id: '123e4567-e89b-12d3-a456-426614174001',
        exercise_id: '123e4567-e89b-12d3-a456-426614174002',
        set_number: 1,
        weight_kg: 100.5,
        reps_done: 10,
        completed_at: '2024-05-09T18:10:00Z'
      }
    ]
  };

  it('syncs/saves workout log and sets successfully (200)', async () => {
    const response = await api.post(saveWorkoutEndpoint, validPayload, TEST_USER.token);
    expect(response.status).toBe(200);
    expect(response.body.log_id).toBeDefined();
    expect(response.body.sets_saved).toBe(validPayload.sets.length);
  });

  it('returns 401 without auth token', async () => {
    const response = await api.post(saveWorkoutEndpoint, validPayload);
    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Missing Authorization header');
  });

  it('returns 400 for payload missing started_at and completed_at', async () => {
    const invalidPayload = {
      workout: {
        session_id: 'd290f1ee-6c54-4b01-90e6-d701748f0852',
        duration_seconds: 3600
      },
      sets: []
    };
    const response = await api.post(saveWorkoutEndpoint, invalidPayload, TEST_USER.token);
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('workout.started_at e workout.completed_at são obrigatórios');
  });

  it('syncs/saves workout containing custom exercises successfully (200)', async () => {
    const customExercisePayload = {
      workout: {
        session_id: 'd290f1ee-6c54-4b01-90e6-d701748f0852',
        started_at: '2024-05-09T18:00:00Z',
        completed_at: '2024-05-09T19:00:00Z',
        duration_seconds: 3600,
        notes: 'Treino com exercício customizado'
      },
      sets: [
        {
          session_exercise_id: '123e4567-e89b-12d3-a456-426614174001',
          exercise_id: null,
          custom_exercise_id: 'd290f1ee-6c54-4b01-90e6-d701748f0853',
          set_number: 1,
          weight_kg: 80.0,
          reps_done: 12,
          completed_at: '2024-05-09T18:15:00Z'
        }
      ]
    };

    const response = await api.post(saveWorkoutEndpoint, customExercisePayload, TEST_USER.token);
    expect(response.status).toBe(200);
    expect(response.body.log_id).toBeDefined();
    expect(response.body.sets_saved).toBe(customExercisePayload.sets.length);
  });
});
