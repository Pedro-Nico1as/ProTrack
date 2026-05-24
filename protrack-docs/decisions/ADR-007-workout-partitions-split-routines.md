# ADR-007 — Introdução de Partições de Treino para Divisão de Rotinas (Splits)

**Data:** 2026-05-17  
**Status:** Accepted  
**Decidido por:** Equipe ProTrack & Flow  

## Contexto
No design original do ProTrack & Flow, um plano de treino (`workout_plans`) era dividido diretamente em sessões simples (`workout_sessions`), e estas continham os exercícios da sessão (`session_exercises`). 

Essa abordagem limitava o modelo a uma sequência linear de dias de treino (ex: Dia 1, Dia 2). Na prática esportiva e na musculação, os planos são frequentemente estruturados em divisões clássicas de rotina (ex: Treino ABC, superior/inferior, empurra/puxa/pernas), chamados de *splits*. O usuário final precisa escolher qual partição de treino específica deseja executar no dia atual, e não necessariamente seguir uma ordem sequencial estrita. Além disso, a funcionalidade de "Montar Treino" customizado pelo usuário exige o suporte a essa flexibilidade.

## Opções consideradas
1. **Manter o modelo linear (`workout_sessions`)** — Simples de consultar, mas forçaria o usuário a criar múltiplos planos de treino inteiros para simular divisões clássicas de treino, ou exigiria lógica complexa no app para pular/reordenar dias de treino.
2. **Introduzir a camada de Partições de Treino (`workout_partitions`)** — Adicionar uma tabela intermediária que agrupa exercícios por divisões nominadas (ex: "Treino A", "Treino B") associadas a um plano, permitindo que o atleta selecione a partição desejada no momento da execução.

## Decisão
Decidimos utilizar a **Opção 2: Introduzir a camada de Partições de Treino (`workout_partitions`)**.

A tabela `workout_partitions` foi criada contendo:
- `id` (UUID, PK)
- `plan_id` (UUID, FK para `workout_plans`)
- `name` (TEXT, ex: "Treino A - Peitoral e Tríceps")
- `order_index` (INT)

O relacionamento na tabela `session_exercises` foi alterado: a coluna `session_id` (vinculada a `workout_sessions`) foi removida e substituída por `partition_id` (vinculada a `workout_partitions`). 

No aplicativo móvel, o construtor de treinos avulsos e a store local do Zustand (`useCustomWorkoutsStore`) foram evoluídos para a versão 1 para suportar coleções de partições (`CustomWorkoutPartition[]`), e criamos uma tela de seleção específica (`ChooseWorkoutScreen.tsx`) e edição (`EditWorkoutScreen.tsx`) de partições.

## Trade-offs

### Prós:
- **Flexibilidade:** Suporte nativo a qualquer tipo de divisão de treino clássica ou personalizada (ex: ABC, ABCDE, push/pull/legs).
- **Usabilidade:** O usuário pode escolher dinamicamente qual partição treinar no dia, sem alterar o progresso geral do plano.
- **Consistência:** Alinhamento estrutural entre treinos padrão fornecidos por atletas profissionais e treinos customizados construídos localmente.

### Contras / Custos:
- **Complexidade do Schema:** Adiciona uma tabela e um JOIN extra nas consultas de planos de treino completos (`workout_plans` -> `workout_partitions` -> `session_exercises` -> `exercises`).
- **Breaking Change:** Exigiu a exclusão da coluna `session_id` em `session_exercises` e a reestruturação das queries na API e sincronização offline.

## Riscos a monitorar
- Impacto na performance de sincronização offline para treinos avulsos ad-hoc (onde as séries são salvas sem vínculo de partição/sessão, usando o relacionamento direto por `exercise_id`).
