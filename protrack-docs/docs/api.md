# ProTrack & Flow API Documentation

## Auth (Supabase Native)
Os endpoints de autenticação são gerenciados diretamente pelo cliente do Supabase.
- `POST /auth/v1/token`: Login/Cadastro via Google e Apple.
- `POST /auth/v1/logout`: Encerra a sessão.

## REST Endpoints (PostgREST)

Todas as requisições requerem o header `Authorization: Bearer <user_jwt>`, exceto para leitura de dados públicos (quando configurado no RLS, mas a Anon Key ainda é enviada).

### Workout Plans (Planos de Treino)

#### Listar Planos Publicados
- **Método**: `GET /rest/v1/workout_plans?is_published=eq.true`
- **Auth**: Public (Anon key)
- **Response**: Array de objetos `workout_plans`

#### Obter Detalhes de um Plano
- **Método**: `GET /rest/v1/workout_plans?id=eq.{id}`
- **Auth**: Public
- **Response**: Objeto `workout_plans`

### Workout Sessions (Sessões)
- **Método**: `GET /rest/v1/workout_sessions?plan_id=eq.{id}`
- **Auth**: Public
- **Response**: Array de objetos `workout_sessions` ordenados por `day_number`

### Session Exercises (Exercícios da Sessão)
- **Método**: `GET /rest/v1/session_exercises?session_id=eq.{id}`
- **Auth**: Public
- **Response**: Array de `session_exercises` (idealmente com relacionamentos expandidos para a tabela `exercises` via Select param: `select=*,exercises(*)`)

### Exercises (Biblioteca de Exercícios)

#### Listar Exercícios
- **Método**: `GET /rest/v1/exercises`
- **Método (Filtro)**: `GET /rest/v1/exercises?muscle_group=eq.{group}`
- **Auth**: Public
- **Response**: Array de `exercises`

> [!CAUTION]
> A inserção direta em `public.exercises` foi **bloqueada** pela migration `20260601190000`. Exercícios customizados agora são salvos na tabela privada `user_custom_exercises`.

### Exercícios Customizados do Usuário (`user_custom_exercises`)

#### Criar Exercício Customizado
- **Método**: `POST /rest/v1/user_custom_exercises`
- **Auth**: Required (JWT obrigatório)
- **Headers**: `Prefer: return=representation`
- **Request Body**:
```json
{
  "name": "Rosca Direta",
  "muscle_group": "Bíceps",
  "youtube_video_id": "abc123",
  "instructions": "Mantenha os cotovelos fixos.",
  "equipment": []
}
```
- **Response**: Array com o objeto `user_custom_exercises` criado.
- **Nota**: O `user_id` é preenchido automaticamente pelo banco (`DEFAULT auth.uid()`). RLS garante isolamento total entre usuários.


## Edge Functions

As Edge Functions devem ser chamadas com método `POST` (ou GET, se aplicável e com JWT no header).

### POST /functions/v1/save-workout
**Descrição**: Grava um treino finalizado de forma síncrona. Substitui o endpoint `sync-workout` que foi descontinuado. Não depende de `client_id` nem de lógica de deduplication.
- **Auth**: Required (JWT obrigatório). Em ambiente de desenvolvimento/teste (`SUPABASE_ENV != 'production'`), aceita `mock-valid-token` para testes automatizados.
- **Request Body**:
```json
{
  "workout": {
    "session_id": "uuid | null",
    "started_at": "2024-05-09T18:00:00Z",
    "completed_at": "2024-05-09T19:00:00Z",
    "duration_seconds": 3600,
    "notes": "Treino pesado hoje"
  },
  "sets": [
    {
      "session_exercise_id": "uuid | null",
      "exercise_id": "uuid | null",
      "set_number": 1,
      "weight_kg": 100.5,
      "reps_done": 10,
      "completed_at": "2024-05-09T18:10:00Z"
    }
  ]
}
```
- **Response Body**:
```json
{
  "log_id": "uuid-do-log-criado",
  "sets_saved": 4
}
```
- **Error Codes**:
  - `401 Unauthorized`: JWT ausente ou inválido.
  - `400 Bad Request`: `workout.started_at` ou `workout.completed_at` ausentes.

> [!NOTE]
> O campo `exercise_id` é opcional em planos estruturados, mas é **obrigatório** em treinos avulsos/ad-hoc (como os do fluxo "Montar Treino") onde `session_exercise_id` é nulo.


### GET /functions/v1/user-progress
**Descrição**: Retorna o histórico de cargas e PR (Personal Record) de um usuário para um exercício específico.
- **Auth**: Required
- **Query Params**: `exercise_id={id}` (Obrigatório, deve ser um UUID válido)
- **Response Body**:
```json
{
  "personal_record": {
    "weight_kg": 120,
    "achieved_at": "2024-05-01T..."
  },
  "history": [
    {
      "date": "2024-05-01",
      "max_weight_kg": 120
    }
  ]
}
```
- **Error Codes**:
  - `400 Bad Request`: Se `exercise_id` estiver ausente ou não for um UUID válido.

### GET /functions/v1/weekly-summary
**Descrição**: Retorna o resumo de treinos da semana atual do usuário logado (calculado estritamente em UTC a partir de segunda-feira).
- **Auth**: Required
- **Response Body**:
```json
{
  "workouts": 3,
  "volume_kg": 12500,
  "duration_minutes": 180,
  "workouts_completed": 3,
  "total_volume_kg": 12500,
  "time_spent_minutes": 180
}
```

> [!NOTE]
> **Duplicidade de Chaves para Retrocompatibilidade:**
> O endpoint retorna chaves no formato compacto (`workouts`, `volume_kg`, `duration_minutes`) para compatibilidade direta com o modelo interno da UI móvel e também no formato estendido da API (`workouts_completed`, `total_volume_kg`, `time_spent_minutes`) para consistência de nomenclatura na documentação.


### POST /functions/v1/delete-account
**Descrição**: Exclui permanentemente a conta do usuário logado, juntamente com todos os seus dados associados (logs de treino, logs de séries e perfil). A exclusão do usuário do `auth.users` é realizada via Supabase Admin Client.
- **Auth**: Required (JWT obrigatório)
- **Response Body**:
```json
{
  "success": true
}
```
- **Error Codes**:
  - `401 Unauthorized`: JWT ausente ou inválido.
  - `400 Bad Request`: Falha ao excluir os dados relacionados ou a própria conta (ex: permissões insuficientes se `SUPABASE_SERVICE_ROLE_KEY` não estiver configurada).

## Ambiente de Testes & Mock Auth

Para viabilizar a execução de testes de integração locais e em pipelines CI/CD sem a necessidade de gerar tokens JWT reais do Supabase Auth:
- O token `mock-valid-token` no header `Authorization` é interpretado pelas Edge Functions `user-progress` e `weekly-summary` no ambiente de desenvolvimento/sandbox como pertencente ao usuário de teste `d290f1ee-6c54-4b01-90e6-d701748f0851`.
- Quando esse token de teste é utilizado, a Edge Function inicializa o cliente com o privilégio `service_role` para contornar restrições de validação de assinatura de token.

> [!CAUTION]
> A Edge Function `save-workout` **não aceita** `mock-valid-token`. Ela exige JWT real em todas as requisições. O endpoint `sync-workout` foi **descontinuado** e removido do código-base.
