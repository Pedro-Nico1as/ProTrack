# ProTrack & Flow — API Reference

## Autenticação (Supabase Native)

Gerenciado pelo cliente `@supabase/supabase-js`. Não há chamadas diretas pelo app — tudo via `supabase.auth.*`.

| Operação | Método Supabase |
|----------|----------------|
| Login e-mail/senha | `supabase.auth.signInWithPassword()` |
| Cadastro | `supabase.auth.signUp()` |
| Google OAuth | `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| Sign In with Apple | `supabase.auth.signInWithIdToken({ provider: 'apple', token })` |
| Logout | `supabase.auth.signOut()` |
| Recuperar senha | `supabase.auth.resetPasswordForEmail()` |
| Atualizar senha | `supabase.auth.updateUser({ password })` |
| Atualizar perfil | `supabase.auth.updateUser({ data: { full_name } })` |

---

## REST Endpoints (PostgREST)

Todas as requisições autenticadas enviam `Authorization: Bearer <user_jwt>`.  
Dados públicos usam a `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

### Planos de Treino

#### Listar Planos Publicados
```
GET /rest/v1/workout_plans?is_published=eq.true&limit=2&select=id,name,athlete_name,exercise_count,youtube_thumbnail,badge
```
- **Auth**: Public (Anon key)

#### Detalhes de um Plano
```
GET /rest/v1/workout_plans?id=eq.{id}
```
- **Auth**: Public

### Sessões de Treino

```
GET /rest/v1/workout_sessions?plan_id=eq.{id}
```
- **Auth**: Public

### Exercícios da Sessão

```
GET /rest/v1/session_exercises?session_id=eq.{id}&select=*,exercises(*)
```
- **Auth**: Public

### Biblioteca de Exercícios

#### Listar exercícios globais
```
GET /rest/v1/exercises?select=*
GET /rest/v1/exercises?muscle_group=eq.{group}
```
- **Auth**: Public

> [!CAUTION]
> A inserção em `public.exercises` está **bloqueada** por RLS. Novos exercícios criados pelo usuário são salvos em `user_custom_exercises`.

### Exercícios Customizados do Usuário

O `fetchExercises()` combina a biblioteca global com os exercícios customizados do usuário em uma única lista.

#### Listar exercícios customizados
```
GET /rest/v1/user_custom_exercises?select=*
```
- **Auth**: Required (JWT)

#### Criar exercício customizado
```
POST /rest/v1/user_custom_exercises
```
- **Auth**: Required (JWT)
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
- **Nota**: `user_id` é preenchido automaticamente pelo banco (`DEFAULT auth.uid()`). RLS garante isolamento total.

### Histórico de Treinos

```
GET /rest/v1/user_workout_logs
  ?select=id,completed_at,duration_seconds,user_set_logs(weight_kg,reps_done,exercises(name),user_custom_exercises(name))
  &order=completed_at.desc
  &limit=100
```
- **Auth**: Required (JWT)

### Último Peso de um Exercício

```
GET /rest/v1/user_set_logs
  ?or=(exercise_id.eq.{id},custom_exercise_id.eq.{id})
  &order=completed_at.desc
  &limit=1
  &select=weight_kg
```
- **Auth**: Required (JWT)
- Suporta tanto exercícios da biblioteca global quanto customizados.

### Perfil do Usuário

```
GET /rest/v1/profiles?id=eq.{user_id}&select=*
PATCH /rest/v1/profiles?id=eq.{user_id}
```
- **Auth**: Required (JWT)

---

## Edge Functions

Base URL: `{SUPABASE_URL}/functions/v1/`  
Todas requerem `Authorization: Bearer <jwt>`.

### POST /functions/v1/save-workout

Grava um treino finalizado de forma síncrona.

- **Auth**: Required (JWT). Em ambiente de dev/teste (`SUPABASE_ENV != 'production'`), aceita `mock-valid-token`.
- **Request Body**:
```json
{
  "workout": {
    "session_id": "uuid | null",
    "started_at": "2026-06-09T18:00:00Z",
    "completed_at": "2026-06-09T19:00:00Z",
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
      "completed_at": "2026-06-09T18:10:00Z"
    }
  ]
}
```
- **Response**:
```json
{ "log_id": "uuid", "sets_saved": 4 }
```
- **Erros**: `401` JWT inválido · `400` `started_at` ou `completed_at` ausentes

### GET /functions/v1/user-progress

Retorna histórico de cargas e PR de um exercício (global ou customizado).

- **Auth**: Required (JWT). Aceita `mock-valid-token` em dev.
- **Query Param**: `exercise_id={uuid}` (obrigatório)
- **Response**:
```json
{
  "personal_record": { "weight_kg": 120, "achieved_at": "2026-06-01T..." },
  "history": [{ "date": "2026-06-01", "max_weight_kg": 120 }]
}
```
- **Erros**: `400` `exercise_id` ausente ou não-UUID

> [!NOTE]
> A query filtra por `exercise_id` OU `custom_exercise_id` (`.or()`), com `limit(500)` de segurança. Suporta tanto exercícios da biblioteca global quanto customizados.

### GET /functions/v1/weekly-summary

Resumo da semana atual do usuário (calculado em UTC, a partir de segunda-feira).

- **Auth**: Required (JWT). Aceita `mock-valid-token` em dev.
- **Response**:
```json
{
  "workouts": 3,
  "volume_kg": 12500,
  "duration_minutes": 180
}
```

### POST /functions/v1/delete-account

Exclui permanentemente a conta e todos os dados do usuário em cascata.

- **Auth**: Required (JWT obrigatório — **sem mock token**)
- **Ordem de deleção**:
  1. `user_set_logs` dos logs do usuário
  2. `user_workout_logs` do usuário
  3. `profiles` do usuário
  4. `auth.users` via Admin API
- **Response**: `{ "success": true }`
- **Erros**: `401` JWT inválido · `400` falha na exclusão (verificar `SUPABASE_SERVICE_ROLE_KEY`)

---

## Ambiente de Testes & Mock Auth

Os testes de integração usam um **mock Express server** embutido em `protrack-tests/integration/helpers.ts`. Não há dependência de Supabase local ativo.

- Token `mock-valid-token` é aceito pelas Edge Functions `save-workout`, `user-progress` e `weekly-summary` **apenas em ambientes não-produção** (`SUPABASE_ENV != 'production'`).
- Em produção, qualquer request com `mock-valid-token` retorna `401`.
- `delete-account` **nunca** aceita mock token.
