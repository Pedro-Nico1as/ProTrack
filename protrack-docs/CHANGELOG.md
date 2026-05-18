# Changelog

Siga o formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Unreleased]
### Added
- **Mobile Custom Workout Builder:**
  - Desenvolvimento completo da tela e fluxo "Montar Treino" (`BuildWorkoutScreen.tsx`) integrado com busca e listagem dinâmica de exercícios a partir do backend.
  - Seletores interativos de séries e repetições (steppers) com despacho dinâmico dos dados estruturados para execução imediata no Modo Ativo.
  - Criação da store `useCustomWorkoutsStore.ts` (Zustand + MMKV síncrono customizado) para persistência e gerenciamento local de templates de treinos criados sob demanda.
  - **Upgrade para Partições de Treino (Versão 1):** Evolução da store de treinos customizados para suportar rotinas divididas (splits como A/B/C) através do schema `CustomWorkoutPartition[]`.
  - **Migração Automatizada:** Rotina transparente no Zustand que converte planos v0 (lista plana de exercícios) para v1 (partições estruturadas) protegendo os dados locais dos usuários.
  - **Novos Fluxos de Splits:** Telas de Escolha de Partição (`ChooseWorkoutScreen.tsx`) e Edição de Divisões (`EditWorkoutScreen.tsx`) integrando totalmente o planejamento e início do Modo Ativo.
  - Ajustes de localização em `strings.ts` refinando os cabeçalhos de histórico de treinos na HomeScreen.


- **Mobile Profile & Settings Screen:**
  - Criação da tela de Perfil (`ProfileScreen.tsx`) com interface baseada em tokens Cyber-Fitness e menu completo de gerenciamento de conta (Editar Perfil, Configurações, Assinatura, Ajuda/Suporte e Logout).

- **Mobile Dynamic Home Dashboard:**
  - Refatoração completa da `HomeScreen.tsx` estática para uma central de controle ativa Cyber-Fitness com recálculos de estatísticas de treinos (semana, mês, total) em tempo real.
  - Implementação de sub-componentes modulares de controle: `BuildWorkoutCard.tsx` (CTA de treino avulso), `WeeklyStats.tsx` (estatísticas), `MyWorkouts.tsx` (listagem de treinos criados localmente), e `WorkoutHistory.tsx` (histórico de logs assíncrono).
  - Adição do banner ativo neon no topo da home para restauração imediata do treino ativo em andamento (`isActive` listener).

- **Backend Database Optimization & Flexibility:**


  - Migration `20260516220000_performance_indexes.sql` adicionando índices de performance em chaves estrangeiras (`workout_plans`, `session_exercises`, `user_workout_logs`, `user_set_logs`) para acelerar queries e relatórios complexos.
  - Migration `20260516221500_add_exercise_id_to_set_logs.sql` estendendo a tabela `user_set_logs` com a coluna `exercise_id` e índice correspondente, permitindo rastrear o progresso de exercícios mesmo em treinos avulsos/ad-hoc gerados sob demanda.


## [0.2.0] - 2026-05-16
### Added
- **Backend Infrastructure (Supabase):**
  - Implementação completa da Edge Function `sync-workout` com suporte a upsert e deduplicação via `client_id` (Deno).
  - Implementação da Edge Function `user-progress` para cálculo de Personal Records (PRs) e histórico de cargas de exercícios.
  - Implementação da Edge Function `weekly-summary` para agregação semanal de treinos, volume total e tempo investido.
  - Criação do banco de dados base (tabelas `profiles`, `athletes`, `workout_plans`, `exercises`, `workout_sessions`, `session_exercises`, `user_workout_logs`, `user_set_logs`) com Row Level Security (RLS) configurado.
  - População da biblioteca de exercícios real com 40+ itens categorizados por grupo muscular e com links do YouTube.
- **Mobile Active Workout & UI Core (Cyber-Fitness):**
  - Refatoração premium do `FloatingYouTubePlayer` usando `react-native-reanimated` com escala ao tocar, micro-animações, suporte ao estado minimizado/expandido e integração tipográfica.
  - Upgrade do `RestTimer` adicionando barra visual de progresso dinâmico, animação pulsante (`reanimated`) e feedback físico via `expo-haptics`.
  - Refatoração do `SetRow` com inputs de kg/reps elegantes, botão de finalização com animação de bounce no checkmark, haptics e visual estilizado de item completado.
  - Polimento do `ExerciseCard` com gradiente premium, borda neon, badge de resumo de séries/reps e cabeçalho perfeitamente alinhado com as colunas do `SetRow` (BUG-010).
  - Proteção contra cancelamento acidental no `ActiveWorkoutScreen` com diálogo nativo de confirmação de saída (`beforeRemove` navigation listener).

### Fixed
- **Mobile Engine & Bug Fixes:**
  - **BUG-002 (Critical):** Correção do risco de perda de dados no `syncEngine.ts` que limpava a fila local no sucesso de rede independente dos IDs processados; agora a remoção baseia-se estritamente na confirmação de IDs do backend (`synced_ids` ou `conflicts`).
  - **BUG-007 (High):** Correção de incompatibilidade de chaves no contrato de sincronização (`synced` vs `synced_count`) resolvido com tratamento flexível via nullish coalescing.
  - **BUG-009 (Medium):** Correção do contador estático de treinos finalizados na `HomeScreen` que agora lê dinamicamente do SQLite local via `useFocusEffect` e da Edge Function de estatísticas semanais.
  - **BUG-010 (Medium):** Correção do desalinhamento de colunas no cabeçalho de séries/carga/reps igualando as larguras e proporções exatas de `ExerciseCard` e `SetRow`.
  - **BUG-011 (High):** Correção do estouro de tela com vídeo ativo movendo os botões de controle ("Próximo Exercício", "Finalizar Treino" e navegação) para um footer fixo abaixo da área de rolagem.
  - **BUG-012 (Medium):** Correção de perda de vínculo do template ao finalizar treinos; agora o `sessionId` original do plano de treino do atleta é propagado corretamente no store do Zustand e salvo no SQLite.

### Changed
- **Zustand Persistence & MMKV:**
  - Retorno ao **MMKV** (`react-native-mmkv`) para persistência síncrona do estado ativo de treino na `useActiveWorkoutStore` (ADR-006).
  - Resolução do crash crítico do Hermes no iOS (`prototype undefined` no Zustand) através da criação de um `StateStorage` adapter customizado (`mmkvStorage`), dispensando a herança direta e garantindo estabilidade absoluta.

## [0.1.0] - 2026-05-09
### Added
- Setup inicial da estrutura de documentação `protrack-docs`.
- Definição dos templates de ADR, Changelog e Agent Handoff.
- Configuração do README principal com visão geral do produto.
