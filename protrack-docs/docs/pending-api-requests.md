# Tracker de APIs — Mobile ↔ Backend

Estado atual de todos os endpoints consumidos pelo app.

| Endpoint | Tipo | Status | Notas |
|----------|------|--------|-------|
| Login e-mail/senha | Supabase Auth | ✅ Entregue | `signInWithPassword()` |
| Cadastro | Supabase Auth | ✅ Entregue | `signUp()` com `emailRedirectTo` dinâmico |
| Google OAuth | Supabase Auth | ✅ Entregue | `signInWithOAuth()` via `expo-auth-session` |
| Sign In with Apple | Supabase Auth | ✅ Entregue | `signInWithIdToken()` via `expo-apple-authentication` |
| Recuperar senha | Supabase Auth | ✅ Entregue | `resetPasswordForEmail()` integrado na `AuthScreen` |
| Redefinir senha | Supabase Auth | ✅ Entregue | `updateUser({ password })` na `ResetPasswordScreen` |
| Perfil do usuário | REST | ✅ Entregue | `GET/PATCH /rest/v1/profiles` |
| Atualizar nome (Auth + Profile) | Supabase Auth + REST | ✅ Entregue | `EditProfileScreen` — escrita dual |
| Listar planos publicados | REST | ✅ Entregue | `GET /rest/v1/workout_plans?is_published=eq.true` |
| Sessões de um plano | REST | ✅ Entregue | `GET /rest/v1/workout_sessions?plan_id=eq.{id}` |
| Exercícios de uma sessão | REST | ✅ Entregue | `GET /rest/v1/session_exercises?session_id=eq.{id}` |
| Biblioteca de exercícios | REST | ✅ Entregue | `GET /rest/v1/exercises` |
| Exercícios customizados | REST | ✅ Entregue | `GET/POST /rest/v1/user_custom_exercises` |
| Histórico de treinos | REST | ✅ Entregue | `GET /rest/v1/user_workout_logs` com joins |
| Último peso de exercício | REST | ✅ Entregue | `GET /rest/v1/user_set_logs?or=(exercise_id,custom_exercise_id)` |
| Gravar treino finalizado | Edge Function | ✅ Entregue | `POST /functions/v1/save-workout` |
| Progresso por exercício | Edge Function | ✅ Entregue | `GET /functions/v1/user-progress?exercise_id=` |
| Resumo semanal | Edge Function | ✅ Entregue | `GET /functions/v1/weekly-summary` |
| Deletar conta | Edge Function | ✅ Entregue | `POST /functions/v1/delete-account` |

## Pendências

| Feature | Tipo | Prioridade | Notas |
|---------|------|-----------|-------|
| IAP / Assinaturas | SDK externo | 🔴 Alta | RevenueCat — definições não iniciadas |
| Provider Apple no Supabase Dashboard | Config Infra | 🔴 Alta | Necessário para Sign In with Apple em produção |
