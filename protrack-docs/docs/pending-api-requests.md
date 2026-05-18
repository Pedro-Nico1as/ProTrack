# Tracker de Entrega de APIs (Agente Mobile <-> Backend)

Este documento registra o status dos endpoints requisitados pelo aplicativo móvel.

| Feature / Endpoint | Tipo | Path / Filtros | Status | Observações |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** - Login Native | Supabase | `POST /auth/v1/token` | ✅ Entregue | Gerenciado pelo Supabase |
| **Auth** - Logout | Supabase | `POST /auth/v1/logout` | ✅ Entregue | Gerenciado pelo Supabase |
| **Treinos** - Listar Planos | REST | `GET /rest/v1/workout_plans?is_published=eq.true` | ✅ Entregue | Apenas planos publicados |
| **Treinos** - Detalhes do Plano | REST | `GET /rest/v1/workout_plans?id=eq.{id}` | ✅ Entregue | |
| **Treinos** - Sessões | REST | `GET /rest/v1/workout_sessions?plan_id=eq.{id}` | ✅ Entregue | |
| **Treinos** - Exercícios da Sessão | REST | `GET /rest/v1/session_exercises?session_id=eq.{id}`| ✅ Entregue | |
| **Biblioteca** - Listar Exercícios | REST | `GET /rest/v1/exercises` | ✅ Entregue | |
| **Biblioteca** - Filtro Muscular | REST | `GET /rest/v1/exercises?muscle_group=eq.{group}` | ✅ Entregue | |
| **Sync** - Offline Sincronização | Edge Function| `POST /functions/v1/sync-workout` | ✅ Entregue | Necessita implementação do código (Deno) |
| **Stats** - Progresso do Usuário | Edge Function| `GET /functions/v1/user-progress` | ✅ Entregue | Necessita implementação do código (Deno) |
| **Stats** - Resumo Semanal | Edge Function| `GET /functions/v1/weekly-summary` | ✅ Entregue | Necessita implementação do código (Deno) |
