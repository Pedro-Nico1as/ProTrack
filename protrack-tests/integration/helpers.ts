import request from 'supertest';
import express from 'express';

// Mock DB in memory for validation/assertions during tests
export const mockDb = {
  workoutLogs: [] as any[],
  setLogs: [] as any[],
  reset() {
    this.workoutLogs = [];
    this.setLogs = [];
  }
};

// Create lightweight Express mock app representing Supabase Edge Functions
const app = express();
app.use(express.json());

app.post('/functions/v1/save-workout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token || token === 'undefined' || token === 'null') {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  if (token !== 'mock-valid-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { workout, sets } = req.body;
  if (!workout || !workout.started_at || !workout.completed_at) {
    return res.status(400).json({ error: 'workout.started_at e workout.completed_at são obrigatórios' });
  }

  const logId = `mock-log-uuid-${Math.random().toString(36).substr(2, 9)}`;
  mockDb.workoutLogs.push({
    id: logId,
    user_id: TEST_USER.id,
    ...workout
  });

  if (Array.isArray(sets) && sets.length > 0) {
    sets.forEach((s) => {
      mockDb.setLogs.push({
        id: `mock-set-uuid-${Math.random().toString(36).substr(2, 9)}`,
        log_id: logId,
        ...s
      });
    });
  }

  return res.status(200).json({
    log_id: logId,
    sets_saved: sets?.length ?? 0
  });
});

// Use real API URL if provided (for remote/local testing), otherwise fallback to the mock app
const BASE_URL = process.env.API_URL;

export const api = {
  post: (url: string, body: any, token?: string) => {
    const target = BASE_URL || app;
    const req = request(target).post(url).send(body);
    if (token) req.set('Authorization', `Bearer ${token}`);
    return req;
  },
  get: (url: string, token?: string) => {
    const target = BASE_URL || app;
    const req = request(target).get(url);
    if (token) req.set('Authorization', `Bearer ${token}`);
    return req;
  }
};

export const TEST_USER = {
  id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  email: 'test@protrack.com',
  token: 'mock-valid-token'
};

