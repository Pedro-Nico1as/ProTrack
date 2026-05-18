# ProTrack & Flow - Migrations Log

Este documento rastreia o impacto de cada alteração de schema no banco de dados.

## 20260509192527_initial_schema.sql
**Descrição**: Criação do esquema base do aplicativo.
**Impacto**:
- **Nova Feature**: Implementa a fundação de dados para usuários, atletas, biblioteca de treinos e diário de performance (logs).
- **Breaking Changes**: Nenhuma. É a primeira migração.
- **Índices Adicionados**: 
  - Focados em consultas comuns (filtros por planos publicados, grupos musculares).
  - Índices para Foreign Keys (`workout_sessions(plan_id)`, etc.) para garantir JOINs rápidos em relatórios e no RLS.
- **Segurança**: 
  - Políticas RLS estritas ativadas em todas as tabelas. 
  - Dados de log (`user_workout_logs`, `user_set_logs`) são acessíveis estritamente pelos respectivos criadores (identificados pelo `auth.uid()`).
  - Planos são publicamente visíveis caso `is_published = true`.

## 20260510221600_add_exercise_metadata.sql
**Descrição**: Adiciona campos visuais à tabela `exercises`.
**Impacto**:
- **Nova Feature**: Campos `thumbnail_url` (TEXT) e `description` (TEXT) para renderização de cards ricos na UI Mobile.
- **Breaking Changes**: Nenhuma. Apenas adição de colunas nullable.

## 20260512212600_real_exercise_library.sql
**Descrição**: Substitui seed de placeholder por biblioteca curada com dados reais.
**Impacto**:
- **Nova Feature**: 10 exercícios com IDs de YouTube verificados, thumbnails nativas (`img.youtube.com/vi/{id}/maxresdefault.jpg`), instruções passo a passo e descrições para a UI.
- **Breaking Changes**: Limpa exercícios anteriores (`DELETE FROM exercises`) antes de inserir os novos. Se o Mobile já tiver IDs em cache local, será necessário re-sincronizar.
- **Cobertura por Grupo Muscular**: Peito (1), Costas (2), Pernas (3), Ombros (2), Bíceps (1), Tríceps (1).
- **Rollback**: `DELETE FROM exercises WHERE name IN ('Supino Reto com Barra', 'Agachamento Livre', ...);`

## 20260516220000_performance_indexes.sql
**Descrição**: Criação de índices estratégicos em chaves estrangeiras.
**Impacto**:
- **Nova Feature**: Otimização profunda de performance em consultas de junção (joins) e relatórios complexos.
- **Breaking Changes**: Nenhuma.
- **Índices Adicionados**:
  - `idx_workout_plans_athlete_id` na tabela `workout_plans` (otimiza filtros de planos por atleta).
  - `idx_session_exercises_exercise_id` na tabela `session_exercises` (otimiza a busca de sessões vinculadas a um exercício).
  - `idx_user_workout_logs_session_id` na tabela `user_workout_logs` (agiliza joins de histórico de sessões com o plano executado).
  - `idx_user_set_logs_session_exercise_id` na tabela `user_set_logs` (essencial para rastreamento de progresso de séries).
- **Rollback**: `DROP INDEX IF EXISTS idx_workout_plans_athlete_id; DROP INDEX IF EXISTS idx_session_exercises_exercise_id; DROP INDEX IF EXISTS idx_user_workout_logs_session_id; DROP INDEX IF EXISTS idx_user_set_logs_session_exercise_id;`

## 20260516221500_add_exercise_id_to_set_logs.sql
**Descrição**: Adiciona a coluna `exercise_id` à tabela `user_set_logs` para suportar treinos avulsos (ad-hoc).
**Impacto**:
- **Nova Feature**: Permite que séries de logs de treinos avulsos (como os gerados na funcionalidade "Montar Treino") sejam registradas e associadas diretamente ao catálogo de exercícios, mesmo sem uma sessão estruturada pré-definida (`session_exercise_id` é nulo).
- **Breaking Changes**: Nenhuma. Nova coluna adicionada com suporte a `ON DELETE SET NULL`.
- **Índices Adicionados**:
  - `idx_user_set_logs_exercise_id` na tabela `user_set_logs` (otimiza consultas de progresso e histórico agregadas diretamente pelo ID do exercício).
- **Rollback**: `ALTER TABLE user_set_logs DROP COLUMN IF EXISTS exercise_id;`

