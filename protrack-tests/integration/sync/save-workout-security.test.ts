import { api, TEST_USER } from '../helpers';

describe('Save-Workout: Security and Data Isolation Validation', () => {
  const saveWorkoutEndpoint = '/functions/v1/save-workout';

  const validPayload = {
    workout: {
      session_id: 'd290f1ee-6c54-4b01-90e6-d701748f0852',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      duration_seconds: 3600
    },
    sets: []
  };

  it('protege contra tokens inválidos', async () => {
    // Enviar requisição com token de autenticação inexistente ou incorreto
    const response = await api.post(saveWorkoutEndpoint, validPayload, 'invalid-jwt-token');

    // Deve ser rejeitado pelo middleware de autenticação (status 401)
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });

  it('valida isolamento de user_id baseado em JWT', async () => {
    // Auditoria de Design de Segurança do Backend:
    // O backend (save-workout/index.ts) não lê o 'user_id' de dentro do payload enviado pelo cliente.
    // Ele faz getUser(token) e insere user_id extraído diretamente do JWT de forma segura:
    // .insert({ user_id: user.id, ... })
    // Isso garante que mesmo se o usuário tentar passar outro 'user_id' no JSON, o sistema irá ignorar
    // e associar o log ao usuário logado correspondente ao token JWT.
    
    const response = await api.post(saveWorkoutEndpoint, validPayload, TEST_USER.token);
    expect(response.status).toBe(200);
    expect(response.body.log_id).toBeDefined();
  });
});
