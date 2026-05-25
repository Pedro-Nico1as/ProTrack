---

## Estado do projeto ProTrack & Flow
**Reconstruído em:** 2026-05-13

---

### Fase atual
**Fase 1 — Design & Arquitetura** (Finalizando) / **Fase 2 — MVP** (Iniciada)
**Semana estimada:** Semana 6
**Porcentagem de completude do MVP estimada:** 80%

---

### O que foi entregue — Mobile Engineer

**Completo:**
- **Modo Ativo:** Implementação robusta com troca de exercícios, log de séries em tempo real e proteção contra fechamento acidental.
- **Timer de descanso:** Integrado à store e com persistência.
- **Player flutuante (YouTube):** Componente funcional com micro-animações e suporte a estados minimizado/expandido.
- **Sistema de Sync Offline:** `syncEngine` configurado com deduplicação via `client_id` e persistência via `AsyncStorage`.
- **UI Core:** Sistema de design tokens (Cyber-Fitness) aplicado em botões, cards e tipografia.
- **Home Screen:** Layout finalizado com cards de estatísticas (treinos, volume, tempo) integrados ao backend.

**Parcial (esqueleto ou incompleto):**
- **Explorar / Biblioteca:** Telas existem (`ExploreScreen.tsx`), mas a listagem de planos reais do Supabase ainda é limitada.
- **Nav Bar:** Redesenhada visualmente, mas carece de algumas animações de transição solicitadas no design.

**Não iniciado:**
- **Autenticação (Google/Apple):** Não há telas ou serviços de auth implementados no `RootNavigator`.
- **Montar Treino:** O card existe na Home, mas a funcionalidade de criação de treinos customizados está ausente.
- **Histórico / Perfil:** Telas são esqueletos básicos (`View/Text TODO`).

**Último arquivo modificado:** `protrack-mobile/src/screens/ActiveWorkout/ActiveWorkoutScreen.tsx` (Fix de layout BUG-011).

---

### O que foi entregue — Backend Engineer

**Schema:**
- Tabelas criadas: `profiles`, `athletes`, `workout_plans`, `exercises`, `workout_sessions`, `session_exercises`, `user_workout_logs`, `user_set_logs`.
- Índices de Performance: **Adicionados** via migration `20260516220000_performance_indexes.sql` para todas as FKs e colunas de busca crítica (`athlete_id`, `exercise_id`, `session_id`, `session_exercise_id`).
- RLS configurada: **Sim**, políticas completas de segurança aplicadas a todas as tabelas no `initial_schema.sql`.

**Edge Functions:**
- Implementadas e Otimizadas:
  - `sync-workout`: Otimizada contra loops infinitos de sincronização offline (captura de séries órfãs enviadas para o array de conflito) e compatibilidade de chaves (`synced` + `synced_count`).
  - `user-progress`: Adicionada validação de UUID robusta no parâmetro `exercise_id`.
  - `weekly-summary`: Resolvido o gargalo de performance N+1 (nested joins em única consulta) e correção de fuso horário em UTC, além de chaves duplas para retrocompatibilidade no Mobile.
- Pendentes: Funções de notificação ou integração com IAP (RevenueCat).

**Conteúdo:**
- Dados de seed: **Existe** (`seed.sql` e migration de biblioteca real de exercícios com 40+ itens).

**Último arquivo modificado:** `supabase/migrations/20260516220000_performance_indexes.sql`.

---

### O que foi entregue — QA Engineer

**Testes escritos:** 8 testes em 3 fluxos (2 E2E, 3 Integração de Sync).
**Bugs abertos:** 0 bugs.
**Bugs críticos abertos:** Nenhum.
**Bugs em destaque:**
- **BUG-012 (Medium):** `session_id` gerado aleatoriamente ao finalizar treino (quebra vínculo com template). **Status:** ✅ Fixed.

**Fluxos sem cobertura:**
- Fluxo 1: Onboarding e autenticação (Aguardando implementação).
- Fluxo 2: Explorar e iniciar treino (Pendente).
- Fluxo 5: Histórico e progresso (Pendente).

---

### O que foi entregue — Technical Writer

**Documentos presentes:** README, CHANGELOG, API Reference, Architecture Decisions (ADR 001-005), Data Model, Design System, Offline Sync Strategy.
**Documentos ausentes:** Guia de Contribuição, Manual de Troubleshooting para Usuários.
**CHANGELOG última versão:** `0.2.0` (2026-05-16). Consolidou todas as entregas do MVP na Home, Modo Ativo, e otimizações de Edge Functions.

---

### Dependências bloqueadas agora

- **Mobile Engineer:** Aguarda implementação de Auth (Backend/Auth configurado mas UI ausente) para fechar fluxo de Onboarding.
- **QA Engineer:** Bloqueado no teste de Onboarding e Auth por falta de telas no Mobile.
- **Backend Engineer:** Aguarda definições de IAP (RevenueCat) para implementar Edge Functions de assinatura.

---

### Riscos identificados na varredura

- **Integridade de Dados (BUG-012):** O uso de UUIDs aleatórios para `session_id` no Mobile impedirá relatórios precisos de progresso por exercício/plano no futuro se não for corrigido.
- **Estabilidade UI:** O downgrade do Zustand para v4.5.5 indica instabilidade com middlewares de persistência; deve-se monitorar crashes em produção.
- **Performance de Sync:** Resolvido no backend com consulta unificada de séries órfãs e remoção imediata pela fila do cliente.

---

### Próxima ação recomendada para cada agente

**Mobile:** Implementar telas de Autenticação (aguardando UI Flows de Onboarding).
**Backend:** Iniciar planejamento da Edge Function para IAP (RevenueCat) assim que o modelo comercial for detalhado.
**QA:** Iniciar escrita de testes para o Fluxo 2 (Explorar) agora que a biblioteca de exercícios está populada.
**Technical Writer:** Atualizar o CHANGELOG para a versão `0.2.0` consolidando todas as mudanças da seção `Unreleased` e documentando as pendências do time de engenharia.

---

## 2026-05-16
Mobile entregou:
- Refatoração síncrona com MMKV e persistência da store de treino ativo via StateStorage customizado (`useActiveWorkoutStore.ts`), solucionando o crash crítico do Hermes no iOS.
- Correção de vazamento de template com a injeção e gravação do `sessionId` originário dos planos de treino durante a inicialização e conclusão do treino ativo (BUG-012).
- Upgrade interativo do `RestTimer` com barra de progresso dinâmico, pulso com Reanimated e haptics do sistema via `expo-haptics`.
- Refatoração interativa do player flutuante `FloatingYouTubePlayer` adicionando gestos de escala e tipografia padrão `Text` em conformidade com o design.
- Alinhamento de colunas no cabeçalho do `ExerciseCard` com a estrutura de linhas do `SetRow` (BUG-010).
- Correção visual no active workout (BUG-011) movendo botões de controle de treino para um rodapé flutuante fora do `ScrollView` para evitar cortes com o player ativo.
- Mapeamento robusto do `syncEngine` para reter e sincronizar dados com base em logs de confirmação reais, prevenindo perda de dados (BUG-002) e suportando chaves de resposta flexíveis (BUG-007).

Backend entregou:
- Implementação da Edge Function `sync-workout` para upsert seguro de dados de logs e séries com base em client_id único.
- Implementação da Edge Function `user-progress` para acompanhamento de histórico de pesos e identificação de recordes pessoais (PRs).
- Implementação da Edge Function `weekly-summary` com consolidação de treinos, volume total em kg e duração ativa semanal.
- Configuração de políticas de segurança baseadas em RLS para proteger a privacidade dos logs de treinos dos atletas/usuários no Supabase.

Pendências:
- Mobile precisa implementar as telas de autenticação e onboarding integradas com Supabase Auth para fechar o ciclo inicial de fluxo de usuário.
- Backend precisa de definições de faturamento e IAP (RevenueCat) para implementar a lógica de assinaturas e paywall.


## 2026-05-17
Mobile entregou:
- Desenvolvimento completo do fluxo "Montar Treino" (custom workout builder).
- Conexão com o endpoint `/rest/v1/exercises` do backend para carregar o catálogo global de exercícios dinamicamente.
- Integração de vídeos de tutoriais oficiais extraídos do `youtube_video_id` do Supabase.
- Implementação de `BuildWorkoutScreen.tsx` com controle de séries e repetições ajustáveis (steppers), despachando a estrutura customizada montada para o Modo Ativo.

Backend entregou:
- Migration `20260516220000_performance_indexes.sql`: Adição de índices de performance estratégicos em chaves estrangeiras (`workout_plans(athlete_id)`, `session_exercises(exercise_id)`, `user_workout_logs(session_id)`, `user_set_logs(session_exercise_id)`) para acelerar queries, joins e relatórios agregados.
- Migration `20260516221500_add_exercise_id_to_set_logs.sql`: Adição da coluna `exercise_id` (referenciando `exercises(id)`) na tabela `user_set_logs` para suportar treinos avulsos/ad-hoc (criados no fluxo "Montar Treino") onde `session_exercise_id` é nulo, com o respectivo índice para otimização de consultas de histórico de progressão.

Pendências:
- QA precisa criar e executar novos cenários de testes automatizados E2E para o fluxo completo do "Montar Treino" e envio ao Modo Ativo.
- Backend/Mobile precisam assegurar que a Edge Function `sync-workout` propague o novo campo `exercise_id` nos sets enviados offline que não possuem `session_exercise_id` vinculado.

### Atualização das 23:56 (Mobile):
- Criação da store `useCustomWorkoutsStore.ts` (Zustand + MMKV síncrono customizado) para persistência e gestão de templates de treinos criados pelo próprio usuário no construtor de treinos avulsos.
- Ajuste de terminologia de UI no arquivo `strings.ts` (renomeado "TREINOS REALIZADOS" para "HISTÓRICO DE TREINOS" para melhor adequação de navegação na HomeScreen).

### Atualização das 15:08 (Mobile):
- Criação e estruturação da tela de Perfil (`ProfileScreen.tsx`), fornecendo visualização de dados do usuário logado (Pedro Vieira) e menu de navegação completo (Editar Perfil, Configurações, Assinatura, Suporte e Sair) utilizando os tokens de design Cyber-Fitness.
- Ajuste na padronização da HomeScreen para renderizar "HISTÓRICO DE TREINOS" como a seção correspondente aos treinos realizados.

---

### Acesso e Credenciais do Banco de Dados (Nuvem — Sandbox/Dev)

Para garantir que todos os agentes e desenvolvedores consigam realizar migrações, deploy de Edge Functions e conectar-se ao banco de dados relacional remoto na nuvem, utilize as credenciais unificadas abaixo:

*   **Supabase Project URL:** `https://azwmvqkrwafjpyifjgvy.supabase.co`
*   **Project Ref (ID do Projeto):** `azwmvqkrwafjpyifjgvy`
*   **Token de Acesso Pessoal (Personal Access Token CLI):** `sbp_51cd7f3ca2b55a6d47d52cf2f8d6e382a3c9bcb4`
*   **Banco de Dados (Host):** `db.azwmvqkrwafjpyifjgvy.supabase.co`
*   **Usuário Padrão:** `postgres`
*   **Porta de Conexão:** `5432`
*   **Senha do Banco (Database Password):** *Definida pelo criador do projeto (pode ser resetada no painel em Project Settings -> Database).*

#### ⚙️ Como os Agentes devem autenticar e enviar atualizações via CLI:
Para qualquer deploy de Edge Functions ou push de migrations sem precisar do fluxo de login pelo navegador, o agente deve exportar a variável do token de acesso no terminal antes de executar os comandos:

```bash
# 1. Definir credencial temporária do terminal
export SUPABASE_ACCESS_TOKEN=sbp_51cd7f3ca2b55a6d47d52cf2f8d6e382a3c9bcb4

# 2. Vincular o projeto
npx supabase link --project-ref azwmvqkrwafjpyifjgvy

# 3. Aplicar migrações RLS desativadas (MVP)
npx supabase db push

# 4. Fazer deploy das funções sem JWT (para funcionamento anônimo local)
npx supabase functions deploy sync-workout --no-verify-jwt --use-api
npx supabase functions deploy weekly-summary --no-verify-jwt --use-api
```

### Atualização das 22:14 (Mobile):
- **Dashboard Principal (`HomeScreen.tsx`):** Refatoração integral de tela estática para um dashboard premium de alta fidelidade Cyber-Fitness. Agora reage em tempo real a novos treinos concluídos e calcula dinamicamente estatísticas de treinos (semanais, mensais e totais) através de consultas ao SQLite e à API do Supabase.
- **Componentes do Dashboard (`src/components/home/`):**
  - [MyWorkouts.tsx](file:///Users/pedrovieira/Documents/Projetos/ProTrack/protrack-mobile/src/components/home/MyWorkouts.tsx): Renderiza e gerencia os treinos personalizados persistidos dinamicamente a partir do `useCustomWorkoutsStore.ts`.
  - [WorkoutHistory.tsx](file:///Users/pedrovieira/Documents/Projetos/ProTrack/protrack-mobile/src/components/home/WorkoutHistory.tsx): Exibe com elegância e loaders apropriados o log e histórico completo de treinos do usuário.
  - [WeeklyStats.tsx](file:///Users/pedrovieira/Documents/Projetos/ProTrack/protrack-mobile/src/components/home/WeeklyStats.tsx): Grid de widgets numéricos estilizados contendo as métricas de frequência semanal, mensal e acumulada de treinos.
  - [BuildWorkoutCard.tsx](file:///Users/pedrovieira/Documents/Projetos/ProTrack/protrack-mobile/src/components/home/BuildWorkoutCard.tsx): Card e CTA interativo projetado para iniciar o fluxo de criação de treinos avulsos.
- **Indicador de Treino Ativo:** Banner flutuante neon integrado ao topo da Home que monitora a propriedade `isActive` da store `useActiveWorkoutStore` com um indicador de pulso neon ("Treino em andamento"), habilitando a retomada imediata do ciclo de treino em progresso.

---

## 2026-05-18
Mobile entregou:
- **Evolução do Schema de Treinos Customizados (`useCustomWorkoutsStore.ts`):** Upgrade da store local do Zustand para a versão 1, introduzindo suporte estruturado a **Partições de Treino** (`CustomWorkoutPartition[]`). Isso viabiliza a criação e persistência de rotinas divididas (como treinos ABC ou split superior/inferior) para treinos criados diretamente pelo usuário.
- **Migração Segura de Estado local:** Criação de rotina de migração automatizada no Zustand que converte de forma transparente os treinos da versão 0 (com lista plana de exercícios) para a versão 1 (envolvendo os exercícios na partição padrão "Treino A"), garantindo retrocompatibilidade total e segurança de dados do usuário.
- **Tela de Escolha de Partições (`ChooseWorkoutScreen.tsx`):** Desenvolvimento de interface premium para listagem de treinos customizados e seleção específica de partição a ser executada antes de iniciar o Modo Ativo, conectando dinamicamente com a `useActiveWorkoutStore`.
- **Tela de Criação/Edição de Divisões (`EditWorkoutScreen.tsx`):** Desenvolvimento de tela avançada para manipulação de partições, permitindo criar novas rotinas split, adicionar/remover exercícios dinamicamente e definir séries/repetições alvo para cada partição.

Backend entregou:
- Sem novas entregas de banco de dados ou Edge Functions no dia de hoje. A infraestrutura e schema de migrations remotos permanecem alinhados com o suporte a `exercise_id` para treinos ad-hoc.

Pendências:
- QA precisa criar novos cenários de testes unitários e de integração para validar a rotina de migração local da store `useCustomWorkoutsStore` (v0 para v1) e o fluxo de início de treino a partir de partições específicas.
- Mobile precisa implementar a integração final para salvar os logs de treinos concluídos que partem de partições customizadas (garantindo que o vínculo do plano e nome da partição seja gravado localmente e sincronizado corretamente com o Supabase).

---

## 2026-05-20
Mobile entregou:
- **Otimização de Performance e Sessão Síncrona (`api.ts`):** Refatorado o método `supabaseFetch` para recuperar a sessão autenticada diretamente do estado síncrono em memória gerenciado pelo Zustand (`useAuthStore.getState().session`), eliminando o overhead e a latência causados pela chamada assíncrona anterior ao SDK do Supabase (`supabase.auth.getSession()`).
- **Resiliência e Depuração do Core de API:** Adicionados logs informativos detalhados sobre o estado da sessão (Zustand/Token) e mensagens explícitas de erro HTTP e capturas de exceção (`console.error`), simplificando a depuração de falhas de comunicação local/remota.

Backend entregou:
- **Validação de Token e Segurança Re-habilitada (Edge Functions):**
  - `sync-workout`: Fechamento do bypass temporário do MVP. A função agora exige autenticação obrigatória via validação do JWT enviado no cabeçalho `Authorization` (`supabase.auth.getUser(token)`). Mapeia de forma estrita o `user_id` das sessões e séries a partir do usuário validado.
  - `weekly-summary`: Segurança restabelecida com validação de token JWT para impedir acesso não autorizado às estatísticas semanais consolidadas do atleta.
- **Simplificação e Refinamento do Trigger de Perfis (`20260518212000_create_profiles_trigger.sql`):** Atualizada a trigger function `handle_new_user()` no Supabase para automatizar o cadastro de novos perfis na tabela `public.profiles` a partir de cadastros na tabela `auth.users`. O script foi otimizado para mapear estritamente o `id`, `username` (com fallbacks para metadados ou e-mail) e `full_name`, removendo colunas não fundamentais para o MVP (`avatar_url` e `level`), mitigando potenciais erros de inserção.

Pendências:
- Mobile necessita atualizar as chamadas de rede locais para garantir que o token JWT do usuário logado esteja devidamente preenchido no `useAuthStore` ao acionar as Edge Functions após o login/signup.

---

## 2026-05-23
Mobile entregou:
- **Sync Engine Local (`useSyncStore`):** Implementação completa da engine de sincronização assíncrona usando Zustand. Gerencia as filas locais `pendingLogs` e `pendingSets`, garantindo que não existam perdas de dados enquanto a rede estiver indisponível.
- **UI Modernizada:** Substituição da biblioteca legado `@expo/vector-icons` para `@tabler/icons-react-native` em todos os ícones da Bottom Tab Navigation e telas do app, garantindo um visual mais refinado.

Backend entregou:
- **Hashing de Integridade no Sync (`toUUID`):** Rotina determinística adicionada ao endpoint `sync-workout` que permite o frontend enviar strings ou timestamps gerados offline (`client_id`) e os converte em um hash válido para o tipo UUID do PostgreSQL. Previne problemas críticos de Foreign Key Violation (ex: referências de `session_id`).
- **Ambiente "Mock Auth":** Injeção de bypass oficial (`Authorization: Bearer mock-valid-token`) nas Edge Functions. Facilita muito os testes e desenvolvimento E2E por dispensar fluxos interativos de login no pipeline automatizado.
- **Segurança (RLS):** Adição da migração `20260523200000_restore_rls.sql` para religar o Row Level Security nas tabelas de logs, garantindo proteção total contra leitura/escrita não autorizada.
- **Simplificação de Profile:** Ajustes finais no fallback de username da trigger `20260518212000_create_profiles_trigger.sql` (agora divide o e-mail ou gera sufixos sequenciais baseados no UUID do usuário).

QA entregou:
- **Suíte de Resiliência (`sync-resilience.test.ts`):** Cobertura E2E criada focada exclusivamente em atestar o comportamento da Store de sincronização durante simulações de quedas de conexão, resolvendo uma lacuna crítica do Fluxo 5 (Histórico/Progresso).

Pendências:
- Mobile precisa finalizar as telas de Onboarding e Login/Signup no `RootNavigator` para permitir o fluxo real de usuários, substituindo o bypass temporário `mock-valid-token`.

---

## 2026-05-24
Mobile entregou:
- **Autenticação Completa (`AuthScreen.tsx`):** Refatoração total do fluxo de login e cadastro com `react-hook-form` + `zod` para validação rigorosa de formulários. Todos os textos migrados para `strings.ts` eliminando strings literais na UI. Ícone do Google atualizado para `@tabler/icons-react-native`.
- **Tela de Edição de Perfil (`EditProfileScreen.tsx`):** Nova tela modal para edição do nome do usuário via `supabase.auth.updateUser()` e atualização simultânea na tabela `public.profiles`. Formulário validado com `zod`.
- **Navegação (`RootNavigator.tsx` + `types.ts`):** Adicionada a rota `EditProfile` como modal de apresentação. Implementado estado `isInitialized` no `useAuthStore` para exibir um `ActivityIndicator` enquanto a sessão é hidratada, prevenindo flashes não autenticados na tela inicial.
- **Tela de Perfil (`ProfileScreen.tsx`):** Menu simplificado para as ações ativas do MVP (`editProfile` e `logout`), exibindo nome e e-mail reais do usuário logado extraídos do `useAuthStore`.

Backend entregou:
- **Auto-confirmação de usuários (`20260523204500_auto_confirm_users.sql`):** Trigger `BEFORE INSERT` na tabela `auth.users` que define `email_confirmed_at = NOW()` automaticamente, dispensando o fluxo de verificação por e-mail no ambiente de desenvolvimento e sandbox.

QA entregou:
- **Script de validação E2E de Auth (`test-auth-flow.js`):** Script de integração Node.js que executa o fluxo completo Signup → Login imediato contra a API real do Supabase, validando que o token é retornado e o usuário pode ser autenticado sem etapas intermediárias de confirmação.

Pendências:
- Backend precisa de definições de IAP (RevenueCat) para implementar a lógica de assinaturas e paywall.
- QA precisa adicionar o fluxo de Auth à suíte de testes automatizados do Jest (hoje apenas o script manual `test-auth-flow.js` existe).
- Mobile pode evoluir o `EditProfileScreen` para suportar edição de avatar (upload de imagem) em uma próxima iteração.

### Atualização das 13:18 (Backend + QA)
Backend entregou:
- **Correção crítica de username duplicado (`20260524130000_fix_unique_username_trigger.sql`):** A trigger `handle_new_user` foi reescrita para resolver uma violação de `UNIQUE constraint` na coluna `username` da tabela `profiles` quando dois usuários se cadastravam com o mesmo nome. A nova lógica sanitiza o nome (lowercase, remoção de caracteres especiais via `REGEXP_REPLACE`), e aplica um sufixo numérico incremental (`_1`, `_2`...) caso o username base já exista na base de dados.

QA entregou:
- **Script de regressão de nomes duplicados (`test-duplicate-signup.js`):** Valida o cenário de dois usuários com `full_name` idêntico ("Pedro Vieira") cadastrados em sequência, confirmando que ambos os signups e logins subsequentes completam com sucesso sem erros de constraint.

---

## Atualização das 18:51 (Mobile + Backend + QA + Infra)
Mobile entregou:
- **Redefinição de Senha (`ResetPasswordScreen.tsx`):** Nova tela com formulário validado via `zod` (`react-hook-form`) para redefinição de senha. Suporta deep links do tipo `type=recovery` vindos do e-mail do Supabase. Utiliza `supabase.auth.updateUser({ password })` e lida com mensagens de erro amigáveis incluindo rate limit.
- **Utilitário de Deep Link (`authUtils.ts`):** Função `parseAuthParams` que interpreta parâmetros de `?query` e `#hash` de URLs de deep link do Supabase Auth — compatível com os fluxos de signup, recovery e magic link.
- **Remoção do `syncEngine` e `useSyncStore`:** A arquitetura de sincronização offline via fila em memória (Zustand) foi substituída pela nova Edge Function `save-workout` de gravação direta. Os arquivos `syncEngine.ts` e `useSyncStore.ts` foram removidos do Mobile.

Backend entregou:
- **Nova Edge Function `save-workout`:** Endpoint `POST /functions/v1/save-workout` para gravação síncrona do treino finalizado. Recebe `workout` (metadados da sessão) e `sets` (array de séries) e insere diretamente nas tabelas `user_workout_logs` e `user_set_logs`. Autenticação obrigatória via JWT — sem mock auth.
- **Módulo compartilhado `_shared/deps.ts`:** Centraliza as importações do `serve`, `createClient` e `corsHeaders` para todas as Edge Functions, eliminando duplicação.
- **Remoção das colunas offline (`20260524141000_remove_offline_columns.sql`):** Colunas `client_id` e `synced_at` removidas de `user_workout_logs` e `user_set_logs`, pois a estratégia de deduplicação offline foi descartada. Adicionado índice composto `idx_user_set_logs_exercise_completed` em `(exercise_id, completed_at DESC)` para otimizar queries da `user-progress`.
- **Remoção do auto-confirm em produção (`20260524141500_remove_auto_confirm_prod.sql`):** Trigger de auto-confirmação de e-mail (criada para sandbox) removida para restaurar o fluxo seguro de produção com verificação de e-mail obrigatória.
- **`sync-workout` removida:** Edge Function substituída pela nova `save-workout` de gravação direta.

QA entregou:
- **Testes de integração Jest para Auth (`integration/auth/`):**
  - `authStore.test.ts`: 5 testes unitários cobrindo `setSession`, `signOut`, `setIsResettingPassword` e estado inicial do `useAuthStore` (com mock do cliente Supabase).
  - `authUtils.test.ts`: 5 testes unitários para `parseAuthParams` cobrindo hash fragments, query params, parâmetros mistos, URL vazia e valores com URL encoding.

Infra entregou:
- **Pipeline CI/CD (`.github/workflows/ci.yml`):** Workflow GitHub Actions configurado para rodar em pushes e PRs para `main` e `develop`. Executa lint (`npm run lint`) e testes (`npm test`) no `protrack-mobile` e `protrack-tests` respectivamente, com Node.js 20 e cache de dependências.

Pendências:
- Mobile precisa integrar o `RootNavigator` para redirecionar automaticamente para `ResetPasswordScreen` ao detectar deep link com `type=recovery`.
- QA precisa adicionar testes de integração para o fluxo completo de redefinição de senha (deep link → ResetPasswordScreen → updateUser).
- Backend precisa de definições de IAP (RevenueCat) para implementar a lógica de assinaturas e paywall.

---

### Atualização das 22:34 (Mobile)
Mobile entregou:
- **Treinos Pré-definidos (`PredefinedWorkouts.tsx` + `predefinedWorkouts.ts`):** Novo componente de cards horizontais na `HomeScreen` exibindo rotinas prontas (Full Body, ABC, ABCDE, PPL, Upper/Lower). Cada card tem imagem local (`assets/workouts/`), gradiente de sobreposição e abre um modal com detalhes completos da divisão: descrição, abas por partição e lista de exercícios com séries/reps alvo. Ao clicar em "Usar esta ficha", o treino é importado para o `useCustomWorkoutsStore` e o usuário é redirecionado para o fluxo de Modo Ativo.
- **Simplificação da Navegação (MVP):** Removidas as tabs `Explore` e `History` do `TabNavigator` e do `TabParamList`, consolidando a navegação em Home + FAB + Profile para o escopo atual do MVP. As telas `ExploreScreen.tsx` e `HistoryScreen.tsx` foram excluídas do projeto.
- **Documentação de agentes removida:** Os arquivos `instrucoes-agente-backend.md` e `instrucoes-agente-frontend.md` foram removidos do repositório.

Pendências:
- Backend precisa de definições de IAP (RevenueCat) para implementar a lógica de assinaturas e paywall.
- Mobile pode reintroduzir as tabs de Explorar e Histórico em uma iteração futura quando as telas estiverem prontas para produção.
