# Histórico de Migrations

15 migrations aplicadas. Listadas em ordem cronológica.

---

## 20260509192527 — `initial_schema`
**Schema inicial do ProTrack & Flow.**
- Tabelas: `exercises`, `workout_plans`, `workout_sessions`, `session_exercises`, `user_workout_logs`, `user_set_logs`
- RLS ativado. Extensão `uuid-ossp` habilitada.
- Políticas: logs privados por `auth.uid()`; planos públicos se `is_published = true`.

---

## 20260510221600 — `add_exercise_metadata`
- Colunas `thumbnail_url` (TEXT) e `description` (TEXT) adicionadas a `exercises`.

---

## 20260512212600 — `real_exercise_library`
- Substitui placeholders por uma biblioteca curada de 46 exercícios reais com links do YouTube.
- **Rollback**: `DELETE FROM public.exercises;`

---

## 20260516220000 — `performance_indexes`
- Índices adicionados em foreign keys para otimizar JOINs e queries:
  - `idx_workout_plans_athlete_id`
  - `idx_session_exercises_exercise_id`
  - `idx_user_workout_logs_session_id`

---

## 20260516221500 — `add_exercise_id_to_set_logs`
- Coluna `exercise_id UUID` adicionada a `user_set_logs` para suportar treinos avulsos (onde `session_exercise_id` é nulo).
- **Rollback**: `ALTER TABLE user_set_logs DROP COLUMN IF EXISTS exercise_id;`

---

## 20260517125500 — `add_workout_partitions`
- Nova tabela `workout_partitions` para suportar splits de treino (A/B/C).
- Vinculada a `session_exercises` via FK.

---

## 20260517210000 — `bypass_rls_for_mvp`
- RLS desativado temporariamente em `user_workout_logs` e `user_set_logs` para desenvolvimento sem autenticação.
- ⚠️ Revertido pela migration `20260523200000`.

---

## 20260518212000 — `create_profiles_trigger`
- Função `handle_new_user()` e trigger `on_auth_user_created` criados.
- Insere automaticamente um perfil em `public.profiles` após cada novo cadastro em `auth.users`.
- Sanitiza o `full_name` para gerar um `username` único com sufixos incrementais.

---

## 20260523200000 — `restore_rls`
- RLS reativado em `user_workout_logs` e `user_set_logs`.
- Políticas: SELECT e INSERT restritos a `auth.uid() = user_id`.
- **Rollback**: `ALTER TABLE public.user_workout_logs DISABLE ROW LEVEL SECURITY;`

---

## 20260523204500 — `auto_confirm_users`
- Trigger `auto_confirm_user` criado para confirmar e-mails automaticamente no cadastro (ambiente de desenvolvimento).
- ⚠️ Removido em produção pela migration `20260524141500`.

---

## 20260524130000 — `fix_unique_username_trigger`
- Corrige o trigger `handle_new_user` para evitar conflito de `UNIQUE` no `username`.
- Sanitiza o nome (lowercase, sem caracteres especiais) e adiciona sufixo numérico incremental em caso de colisão.

---

## 20260524141000 — `remove_offline_columns`
- **Breaking Change**: Remove `client_id` (UNIQUE) e `synced_at` de `user_workout_logs` e `client_id` de `user_set_logs`.
- Arquitetura de sync offline com fila descontinuada. O app passou a usar `save-workout` (gravação síncrona).
- Índice `idx_user_set_logs_exercise_completed` adicionado em `(exercise_id, completed_at DESC)`.
- **Rollback**: `ALTER TABLE user_workout_logs ADD COLUMN IF NOT EXISTS client_id UUID UNIQUE; ...`

---

## 20260524141500 — `remove_auto_confirm_prod`
- Remove o trigger de auto-confirmação de e-mail do ambiente de produção.
- Restaura o fluxo padrão de verificação por e-mail no Supabase Auth.
- **Rollback**: Re-executar `20260523204500_auto_confirm_users.sql`.

---

## 20260531231330 — `allow_user_insert_exercises`
- Cria policy `"Users can insert exercises"` em `public.exercises` para permitir INSERT por usuários autenticados.
- ⚠️ **Substituída** pela migration seguinte que reverte esta política em favor de tabela privada.

---

## 20260601224433 — `create_user_custom_exercises`
- **Breaking Change (Segurança)**: Remove a policy `"Users can insert exercises"` de `public.exercises`.
- Nova tabela `public.user_custom_exercises`:
  - Campos: `id`, `user_id`, `name`, `muscle_group`, `youtube_video_id`, `instructions`, `equipment[]`, `created_at`
  - RLS completo (SELECT/INSERT/UPDATE/DELETE) por `auth.uid()`
- `user_set_logs` recebe coluna `custom_exercise_id UUID` (nullable, FK → `user_custom_exercises.id` com `ON DELETE SET NULL`).
- Índices: `idx_user_set_logs_custom_exercise_id` e `idx_user_set_logs_custom_exercise_completed`.
- **Rollback**: `DROP TABLE IF EXISTS public.user_custom_exercises CASCADE; ALTER TABLE public.user_set_logs DROP COLUMN IF EXISTS custom_exercise_id;`
