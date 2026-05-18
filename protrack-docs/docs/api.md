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
- **Método**: `GET /rest/v1/exercises`
- **Método (Filtro)**: `GET /rest/v1/exercises?muscle_group=eq.{group}`
- **Auth**: Public
- **Response**: Array de `exercises`

## Edge Functions

As Edge Functions devem ser chamadas com método `POST` (ou GET, se aplicável e com JWT no header).

### POST /functions/v1/sync-workout
**Descrição**: Sincroniza logs de treino e séries registrados offline. Executa deduplicação baseada em `client_id`.
- **Auth**: Required
- **Request Body**:
```json
{
  "logs": [
    {
      "client_id": "uuid",
      "session_id": "uuid",
      "started_at": "2024-05-09T18:00:00Z",
      "completed_at": "2024-05-09T19:00:00Z",
      "duration_seconds": 3600,
      "notes": "Treino pesado hoje"
    }
  ],
  "sets": [
    {
      "client_id": "uuid",
      "log_client_id": "uuid",
      "session_exercise_id": "uuid",
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
  "synced": 5,
  "synced_count": 5,
  "synced_ids": [
    "client_id_do_log",
    "client_id_do_set_1",
    "client_id_do_set_2"
  ],
  "conflicts": [
    "client_id_de_serie_orfa"
  ]
}
```
> [!NOTE]
> Séries enviadas sem um log correspondente local ou no banco de dados (`log_client_id` inválido) são categorizadas como órfãs e retornadas em `conflicts` para que o cliente móvel limpe a fila local e evite retentativas infinitas.

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
  "workouts_completed": 3,
  "total_volume_kg": 12500,
  "time_spent_minutes": 180
}
```

> [!NOTE]
> **Contrato Mobile ↔ Backend Resolvido:**
> O aplicativo móvel mapeia com segurança em `src/services/api.ts` tanto o formato compacto (`workouts`, `volume_kg`, `duration_minutes`) quanto o formato estendido da API (`workouts_completed`, `total_volume_kg`, `time_spent_minutes`) para seu modelo interno, garantindo 100% de compatibilidade e estabilidade na renderização dos cards na `HomeScreen`.


