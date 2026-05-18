import request from 'supertest';

// Placeholder for Supabase project URL - this will be updated once the Backend agent provides it
const BASE_URL = process.env.API_URL || 'http://localhost:54321';

export const api = {
  post: (url: string, body: any, token?: string) => {
    const req = request(BASE_URL).post(url).send(body);
    if (token) req.set('Authorization', `Bearer ${token}`);
    return req;
  },
  get: (url: string, token?: string) => {
    const req = request(BASE_URL).get(url);
    if (token) req.set('Authorization', `Bearer ${token}`);
    return req;
  }
};

export const TEST_USER = {
  id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  email: 'test@protrack.com',
  token: 'mock-valid-token'
};
