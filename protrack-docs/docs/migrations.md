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

## 20260517125500_add_workout_partitions.sql
**Descrição**: Introdução do conceito de partições/divisões de treino (ex: Treino A, B, C) e associação com a tabela `session_exercises`.
**Impacto**:
- **Nova Feature**: Permite dividir planos de treino em múltiplos sub-treinos (partições), dando flexibilidade para o atleta executar divisões específicas de sua rotina.
- **Breaking Changes**: A coluna `session_id` foi excluída da tabela `session_exercises` (via `DROP COLUMN session_id CASCADE`), sendo substituída por `partition_id` associada à tabela `workout_partitions`.
- **Segurança**: Habilitadas políticas RLS na tabela `workout_partitions` para leitura por qualquer usuário se o plano de treino principal estiver marcado como publicado.
- **Rollback**: Reversão da tabela de partições e reinserção da coluna `session_id` na tabela `session_exercises`.

## 20260517210000_bypass_rls_for_mvp.sql
**Descrição**: Desativação temporária do Row Level Security para as tabelas de logs.
**Impacto**:
- **Nova Feature**: Facilidade de testes locais e simulação rápida sem a necessidade de autenticação obrigatória do usuário.
- **Breaking Changes**: Nenhuma. É uma mudança puramente de permissões.
- **Segurança**: Desativa temporariamente o RLS em `user_workout_logs` e `user_set_logs`. *Nota: Essa bypass foi fechada nas Edge Functions na data de 2026-05-20.*
- **Rollback**: `ALTER TABLE user_workout_logs ENABLE ROW LEVEL SECURITY; ALTER TABLE user_set_logs ENABLE ROW LEVEL SECURITY;`

## 20260518212000_create_profiles_trigger.sql
**Descrição**: Trigger nativa para criação automática de perfis de usuário pós-cadastro.
**Impacto**:
- **Nova Feature**: Garante a criação automatizada de registros correspondentes na tabela `public.profiles` sempre que um usuário se cadastrar com sucesso através do Supabase Auth. *(Atualizada em 2026-05-23 para melhorar os fallbacks do campo username, utilizando e-mails e UUIDs para evitar conflitos).*
- **Breaking Changes**: Nenhuma.
- **Segurança**: Função executada com privilégios `SECURITY DEFINER` para permitir inserções no schema público sem necessidade de tokens adicionais.
- **Rollback**: `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; DROP FUNCTION IF EXISTS public.handle_new_user();`

## 20260523200000_restore_rls.sql
**Descrição**: Reabilita o Row Level Security (RLS) para as tabelas de logs.
**Impacto**:
- **Nova Feature**: Reverte a desativação temporária focada no MVP inicial.
- **Breaking Changes**: Chamadas de rede do Mobile agora obrigatoriamente precisam enviar um JWT de sessão autêntica via cabeçalho `Authorization` para interagir com os logs do respectivo usuário, a menos que usem o "Mock Auth" das Edge Functions.
- **Segurança**: Habilita o RLS estrito nas tabelas `user_workout_logs` e `user_set_logs`.
- **Rollback**: `ALTER TABLE public.user_workout_logs DISABLE ROW LEVEL SECURITY; ALTER TABLE public.user_set_logs DISABLE ROW LEVEL SECURITY;`

## 20260523204500_auto_confirm_users.sql
**Descrição**: Trigger `BEFORE INSERT` em `auth.users` que define `email_confirmed_at = NOW()` automaticamente no momento do cadastro, eliminando a necessidade de confirmação por e-mail no ambiente de desenvolvimento e sandbox.
**Impacto**:
- **Nova Feature**: Permite o fluxo Signup → Login imediato sem etapa intermediária de verificação por e-mail.
- **Breaking Changes**: Nenhuma. Aplicável apenas ao ambiente de sandbox; não deve ser promovida para produção.
- **Segurança**: Reduz a segurança em ambiente de produção se aplicada indevidamente. Usar apenas em `dev`/`sandbox`.
- **Rollback**: `DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users; DROP FUNCTION IF EXISTS public.auto_confirm_user();`

## 20260524130000_fix_unique_username_trigger.sql
**Descrição**: Reescrita da trigger `handle_new_user` para garantir unicidade do campo `username` em `public.profiles`.
**Impacto**:
- **Bug Fix Crítico**: A versão anterior usava `full_name` diretamente como `username`, causando falha de `UNIQUE constraint` quando dois usuários se cadastravam com o mesmo nome completo.
- **Breaking Changes**: Nenhuma. Comportamento retrocompatível; usuários existentes não são afetados.
- **Nova Lógica**: Sanitiza o nome base (lowercase, `REGEXP_REPLACE` para caracteres especiais), remove underscores consecutivos e adiciona sufixo numérico incremental (`_1`, `_2`...) até encontrar um username disponível.
- **Rollback**: Reverter para a versão anterior da função conforme descrito nos comentários da própria migration.

## 20260524141000_remove_offline_columns.sql
**Descrição**: Remove as colunas de deduplicação offline (`client_id`, `synced_at`) das tabelas de logs e adiciona índice composto de performance.
**Impacto**:
- **Breaking Change**: As colunas `client_id` (UNIQUE) e `synced_at` foram removidas de `user_workout_logs`. A coluna `client_id` foi removida de `user_set_logs`. A estratégia de sincronização offline via fila com deduplicação por `client_id` foi descartada em favor de gravação síncrona direta via `save-workout`.
- **Performance**: Adicionado índice composto `idx_user_set_logs_exercise_completed` em `(exercise_id, completed_at DESC)` para otimizar as queries de histórico e PR na Edge Function `user-progress`.
- **Rollback**: `ALTER TABLE user_workout_logs ADD COLUMN IF NOT EXISTS client_id UUID UNIQUE; ALTER TABLE user_workout_logs ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ; ALTER TABLE user_set_logs ADD COLUMN IF NOT EXISTS client_id UUID UNIQUE; DROP INDEX IF EXISTS idx_user_set_logs_exercise_completed;`

## 20260524141500_remove_auto_confirm_prod.sql
**Descrição**: Remove a trigger de auto-confirmação de e-mail criada para ambiente de desenvolvimento.
**Impacto**:
- **Segurança**: Restaura o fluxo de verificação obrigatória por e-mail no Supabase Auth para ambiente de produção.
- **Breaking Changes**: Nenhuma para produção. Usuários que se cadastrarem agora precisarão confirmar o e-mail antes de fazer login (comportamento correto e esperado).
- **Rollback**: Re-executar a migration `20260523204500_auto_confirm_users.sql`.

## 20260531201500_allow_user_insert_exercises.sql
**Descrição**: Cria política RLS que permite a usuários autenticados inserir novos exercícios na tabela `public.exercises`.
**Impacto**:
- **Nova Feature**: Usuários logados podem agora criar exercícios customizados via `POST /rest/v1/exercises`. Isso habilita o fluxo de criação de exercícios personalizados no `BuildWorkoutScreen`.
- **Segurança**: A política usa `auth.role() = 'authenticated'` como guarda. Qualquer usuário autenticado pode inserir exercícios (exercícios públicos, não privados por usuário). Política de leitura (`SELECT`) existente não é alterada.
- **Breaking Changes**: Nenhuma.
- **Rollback**: `DROP POLICY "Users can insert exercises" ON public.exercises;`

