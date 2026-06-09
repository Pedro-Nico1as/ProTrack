# ProTrack & Flow

> App mobile de fitness que une curadoria de atletas profissionais  
> com ferramentas de registro de performance.

## O que é
O ProTrack & Flow é uma plataforma de treinamento que preenche a lacuna entre atletas de elite e entusiastas do fitness. O app oferece planos de treino autênticos com curadoria de atletas parceiros, combinados com ferramentas avançadas de registro de performance — histórico de cargas, PR por exercício e resumo semanal.

## Status do projeto

| Fase | Status | Período |
|------|--------|---------|
| Fase 0 — Discovery | ✅ Completo | Sem 1-2 |
| Fase 1 — Design & Arquitetura | ✅ Completo | Sem 3-5 |
| Fase 2 — MVP | 🔄 Em andamento | Sem 6-14 |

**Versão atual:** `0.3.x` | **Bundle ID iOS:** `com.protrack.app` | **Build:** `1`

## Arquitetura

```
React Native (Expo SDK 54) + TypeScript
        │
        ├── Autenticação: Supabase Auth (Email/Senha, Google OAuth, Sign in with Apple)
        ├── Banco de Dados: PostgreSQL via PostgREST (Supabase)
        ├── Lógica de Negócio: Supabase Edge Functions (Deno)
        ├── Estado local: Zustand + AsyncStorage (treino ativo e treinos customizados)
        └── Navegação: React Navigation 7 (Stack + Bottom Tabs)
```

## Estrutura de Pastas

```
ProTrack/
├── protrack-mobile/       # App React Native (Expo)
│   ├── src/
│   │   ├── screens/       # Telas (Auth, Home, ActiveWorkout, BuildWorkout, Profile)
│   │   ├── components/    # Componentes reutilizáveis (core/ e home/ e workout/)
│   │   ├── stores/        # Zustand stores (Auth, ActiveWorkout, CustomWorkouts)
│   │   ├── services/      # api.ts (PostgREST + Edge Functions), supabase.ts
│   │   ├── navigation/    # RootNavigator, TabNavigator, types.ts
│   │   ├── theme/         # tokens.ts (Design System)
│   │   ├── constants/     # strings.ts, predefinedWorkouts.ts
│   │   └── utils/         # authUtils.ts, uuid.ts
│   └── assets/            # Imagens, fontes (Outfit), vídeos
├── supabase/
│   ├── functions/         # Edge Functions: save-workout, user-progress, weekly-summary, delete-account
│   └── migrations/        # 15 migrations aplicadas
├── protrack-tests/
│   ├── integration/       # Testes com mock Express server (auth/ e sync/)
│   └── e2e/               # Testes de fluxo com mocks
└── protrack-docs/         # Esta documentação
```

## Documentação

- [API Reference](./docs/api.md)
- [Histórico de Migrations](./docs/migrations.md)
- [Estratégia de Gravação de Treinos](./docs/offline-sync.md)
- [Agent Handoff Log](./docs/agent-handoff.md)
- [Tracker de APIs (Mobile ↔ Backend)](./docs/pending-api-requests.md)

## Time

| Agente | Responsabilidade |
|--------|-----------------|
| Mobile Engineer | App iOS/Android (React Native + Expo) |
| Backend Engineer | Supabase: banco, Edge Functions, auth |
| QA Engineer | Testes de integração e E2E |
| Technical Writer | Documentação |
