# Changelog

Siga o formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Unreleased]

## [0.4.0] - 2026-06-08
### Added
- **Sign In with Apple:** `expo-apple-authentication` integrado na `AuthScreen`. Botão condicional (iOS + disponibilidade). Fluxo via `signInWithIdToken({ provider: 'apple' })`.
- **Exercícios Customizados (tabela privada):** Nova tabela `user_custom_exercises` com RLS completo por usuário. Usuários podem criar exercícios personalizados visíveis apenas para si. API mobile combina biblioteca global + customizados em uma lista unificada.
- **Wordmark SVG oficial:** Logotipo ProTrack exibido como SVG inline na tela de boas-vindas via `react-native-svg`.
- **Tela de Boas-vindas (AuthScreen):** Novo estado `welcome` como modo inicial da Auth, com `AnimatedGlowBackground` (3 blobs animados via Reanimated). Transições entre modos (`welcome → login → register → forgot`) via `LayoutAnimation`.
- **Fluxo "Esqueci a Senha" integrado:** Modo `forgot` incorporado na `AuthScreen`, sem tela separada. Chama `resetPasswordForEmail()` com redirect dinâmico.
- **Treinos Pré-Definidos:** 10 rotinas prontas na HomeScreen (Full Body, PPL, ABC, ABCDE, Upper/Lower, Glúteos & Pernas, Superiores em V, Força Máxima, Cardio & Core, Arm Day). Cards horizontais com imagens e modal de detalhes por partição.
- **Exclusão de Conta:** Edge Function `delete-account` com deleção em cascata (set_logs → workout_logs → profile → auth.users via Admin API). UI com confirmação destructive na `ProfileScreen`.
- **Pipeline CI/CD:** GitHub Actions com lint + testes (Node.js 20). Testes de integração usam mock Express server — sem dependência de Supabase local.

### Changed
- **Design System v3 (vermelho/preto):** Paleta anterior (azul/laranja/rosa) substituída. Cores atuais: `primary: #E43232`, `accent: #FF4D4D`, `background: #000000`. Gradiente de botão: `['#E43232', '#C62828']`.
- **`app.json` — Produção iOS:** `name: Protrack`, `bundleIdentifier: com.protrack.app`, `buildNumber: 1`, `deploymentTarget: 16.0`.
- **Deep links dinâmicos:** URLs de redirect hardcoded substituídas por `makeRedirectUri()` de `expo-auth-session`, suportando Expo Go e produção automaticamente.
- **Mock token alinhado:** `save-workout` e `delete-account` aceitam `mock-valid-token` em dev, bloqueiam em produção (`SUPABASE_ENV`).
- **`user-progress` otimizado:** Query com `JOIN !inner` e filtro por `exercise_id` OU `custom_exercise_id`, com `limit(500)`.
- **Testes migrados:** Suites de `sync-workout` removidas, substituídas por `save-workout.test.ts`, `save-workout-load.test.ts`, `save-workout-security.test.ts` com mock server.
- **Produção:** `babel-plugin-transform-remove-console` remove todos os `console.*` em `NODE_ENV=production`.

### Removed
- **Paletas anteriores** (verde/roxo de v0.3, azul/laranja/rosa de v0.3.x): substituídas.
- **Tabs Explore e History:** Removidas do `TabNavigator` (MVP simplificado).
- **`syncEngine.ts` e `useSyncStore.ts`**: Descontinuados.
- **Testes de sync obsoletos**: `sync-load-and-dedup`, `sync-security`, `sync-workout` removidos.

---

## [0.3.0] - 2026-05-23
### Added
- **Auth completo:** `AuthScreen` com `react-hook-form` + `zod`. `ResetPasswordScreen` via deep link `type=recovery`. `authUtils.ts` com `parseAuthParams`. Guard `isInitialized` no `RootNavigator`.
- **`ProfileScreen` e `EditProfileScreen`:** Dados reais do usuário, logout e edição de nome (escrita dual: `auth.updateUser` + `profiles`).
- **Edge Function `save-workout`:** Gravação síncrona direta. JWT obrigatório. Substitui `sync-workout`.
- **Montar Treino:** `BuildWorkoutScreen`, `ChooseWorkoutScreen`, `EditWorkoutScreen`. Store `useCustomWorkoutsStore` com splits A/B/C e migração automática v0→v1.
- **Home Dashboard:** `WeeklyStats`, `MyWorkouts`, `WorkoutHistory`, `BuildWorkoutCard`, `FeaturedPlans` como componentes modulares.

### Changed
- Arquitetura de gravação: de sync offline com fila para gravação síncrona direta.

### Removed
- `sync-workout` Edge Function.
- Colunas `client_id` e `synced_at` do banco.
- Trigger de auto-confirmação de e-mail (produção).

---

## [0.2.0] - 2026-05-16
### Added
- Edge Functions: `user-progress` (PR + histórico), `weekly-summary` (agregação semanal).
- Biblioteca de 40+ exercícios reais com YouTube links.
- Modo Ativo: `FloatingYouTubePlayer`, `RestTimer` animado, `SetRow` com haptics, `ExerciseCard` com gradiente.

### Fixed
- BUG-002: risco de perda de dados no `syncEngine`.
- BUG-007: incompatibilidade de chaves no contrato de sincronização.
- BUG-009: contador estático de treinos na HomeScreen.
- BUG-011: estouro de tela com vídeo ativo no `ActiveWorkoutScreen`.

---

## [0.1.0] - 2026-05-09
### Added
- Setup inicial da estrutura de documentação `protrack-docs`.
- Templates de ADR, Changelog e Agent Handoff.
- README principal com visão geral do produto.
