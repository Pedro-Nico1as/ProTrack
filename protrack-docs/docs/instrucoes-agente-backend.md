# Instruções para o Agente de Backend — ProTrack & Flow

> **Contexto:** Este documento detalha todos os ajustes necessários no backend (Supabase Edge Functions + banco de dados PostgreSQL) identificados na auditoria técnica completa do projeto. O app passou a ser **online-only** — toda a arquitetura de sync offline foi descontinuada. Execute as tarefas na ordem apresentada (prioridade decrescente de criticidade).

---

## 🚨 PRIORIDADE 1 — SEGURANÇA CRÍTICA (Executar antes de qualquer deploy em produção)

### 1.1 — Remover o bypass `mock-valid-token` de todas as Edge Functions

**Problema:** As três Edge Functions (`sync-workout`, `user-progress`, `weekly-summary`) aceitam o token literal `'mock-valid-token'` e, quando detectado, criam um cliente Supabase com a `SUPABASE_SERVICE_ROLE_KEY` e retornam um usuário falso hardcoded (`d290f1ee...`). Qualquer pessoa que conheça esse token tem acesso irrestrito a dados de qualquer usuário em produção.

**Arquivos afetados:**
- `supabase/functions/user-progress/index.ts` — Linhas 19–36
- `supabase/functions/weekly-summary/index.ts` — Linhas 18–35
- `supabase/functions/sync-workout/index.ts` — Linhas 46–68 _(esta função será removida — ver seção 2.1)_

**Ação em `user-progress/index.ts` e `weekly-summary/index.ts`:**

Substitua completamente o bloco de autenticação atual pelo padrão seguro abaixo. O padrão cria o cliente **sempre** com `SUPABASE_ANON_KEY` + token do usuário e valida o token via `auth.getUser()`.

```typescript
// REMOVER todo este bloco:
// const isMock = token === 'mock-valid-token'
// const supabase = createClient(
//   ...,
//   isMock ? (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ...) : ...,
//   isMock ? {} : { global: { ... } }
// )
// let user;
// if (isMock) {
//   user = { id: 'd290f1ee-...', email: 'test@protrack.com' }
// } else { ... }

// SUBSTITUIR pelo seguinte padrão seguro:
const authHeader = req.headers.get('Authorization')
if (!authHeader) {
  return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 401,
  })
}
const token = authHeader.replace('Bearer ', '')

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  { global: { headers: { Authorization: authHeader } } }
)

const { data: { user }, error: userError } = await supabase.auth.getUser(token)
if (userError || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 401,
  })
}
```

**Verificação:** Após o deploy, fazer uma requisição com o header `Authorization: Bearer mock-valid-token` deve retornar `401 Unauthorized`.

---

### 1.2 — Desativar a trigger `auto_confirm_users` em produção

**Problema:** A migration `20260523204500_auto_confirm_users.sql` cria uma trigger `BEFORE INSERT ON auth.users` que seta `email_confirmed_at = NOW()` para todo usuário novo. Isso significa que qualquer e-mail (incluindo e-mails falsos/inexistentes) é automaticamente validado, contornando o fluxo de confirmação de e-mail do Supabase.

**Ação — Criar nova migration de rollback:**

Crie o arquivo `supabase/migrations/<timestamp>_remove_auto_confirm_prod.sql`:

```sql
-- Migration: remove_auto_confirm_prod.sql
-- Descrição: Remove a trigger de auto-confirmação de e-mail que foi criada para
-- facilitar o desenvolvimento local. Em produção, o Supabase Auth deve gerenciar
-- o fluxo de confirmação de e-mail nativamente via dashboard.
--
-- ATENÇÃO: Execute esta migration SOMENTE no ambiente de produção.
-- O ambiente local pode manter a trigger para facilitar testes.

DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
DROP FUNCTION IF EXISTS public.auto_confirm_user();
```

**Configuração alternativa via Dashboard:** No Supabase Dashboard de produção:
- Vá em `Authentication > Settings`
- Em `Email Auth`, certifique-se de que "Enable email confirmations" está **ativado**
- Configure o template de e-mail de confirmação em `Email Templates`

**Verificação:** Após aplicar, um novo cadastro deve receber e-mail de confirmação e **não** conseguir fazer login até confirmar.

---

## 🗑️ PRIORIDADE 2 — REMOÇÃO DO SISTEMA OFFLINE (Sync Workout)

### 2.1 — Excluir a Edge Function `sync-workout`

**Problema:** A função `supabase/functions/sync-workout/index.ts` foi construída exclusivamente para processar filas offline (deduplicação por `client_id`, mapping de `log_client_id` para `log_id`, resolução de conflitos). Como o app passa a ser online-only, essa função não tem mais utilidade.

**Ação:**
1. Exclua o diretório completo: `supabase/functions/sync-workout/`
2. Execute `supabase functions delete sync-workout` no ambiente de produção para remover o deployment da função no Supabase

---

### 2.2 — Criar a nova Edge Function `save-workout` (online-only)

**Problema:** Com a remoção do `sync-workout`, o `ActiveWorkoutScreen` precisa de um endpoint simples que receba o treino finalizado e insira os dados diretamente.

**Ação — Criar `supabase/functions/save-workout/index.ts`:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Autenticação segura (sem mock-valid-token)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    const token = authHeader.replace('Bearer ', '')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Corpo da requisição
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      throw new Error('Invalid JSON body')
    }

    const { workout, sets } = body

    if (!workout || !workout.started_at || !workout.completed_at) {
      throw new Error('workout.started_at e workout.completed_at são obrigatórios')
    }

    // Inserir o log principal do treino
    const { data: logData, error: logError } = await supabase
      .from('user_workout_logs')
      .insert({
        user_id: user.id,
        session_id: workout.session_id ?? null,
        started_at: workout.started_at,
        completed_at: workout.completed_at,
        duration_seconds: workout.duration_seconds ?? null,
        notes: workout.notes ?? null,
      })
      .select('id')
      .single()

    if (logError) throw logError

    const logId = logData.id

    // Inserir as séries do treino
    if (Array.isArray(sets) && sets.length > 0) {
      const setsToInsert = sets.map((s: any, i: number) => ({
        log_id: logId,
        session_exercise_id: s.session_exercise_id ?? null,
        exercise_id: s.exercise_id ?? null,
        set_number: s.set_number ?? i + 1,
        weight_kg: s.weight_kg ?? null,
        reps_done: s.reps_done ?? null,
        completed_at: s.completed_at,
      }))

      const { error: setsError } = await supabase
        .from('user_set_logs')
        .insert(setsToInsert)

      if (setsError) throw setsError
    }

    return new Response(
      JSON.stringify({ log_id: logId, sets_saved: sets?.length ?? 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('[Save-Workout Error]', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

**Deploy:** `supabase functions deploy save-workout`

---

### 2.3 — Criar migration para remover colunas de sync offline do banco

**Problema:** As colunas `client_id` (em `user_workout_logs`) e `client_id` (em `user_set_logs`) foram criadas com `NOT NULL UNIQUE` especificamente para a deduplicação offline. Com o novo endpoint `save-workout`, o banco gera os IDs via `gen_random_uuid()` por padrão — essas colunas não têm mais função.

**Ação — Criar `supabase/migrations/<timestamp>_remove_offline_columns.sql`:**

```sql
-- Migration: remove_offline_columns.sql
-- Descrição: Remove as colunas client_id que foram criadas para deduplicação de
-- dados enviados offline. Com a arquitetura online-only, o banco gera os IDs
-- primários diretamente via gen_random_uuid().

-- Remove a coluna client_id de user_workout_logs
ALTER TABLE user_workout_logs
  DROP COLUMN IF EXISTS client_id,
  DROP COLUMN IF EXISTS synced_at;

-- Remove a coluna client_id de user_set_logs
ALTER TABLE user_set_logs
  DROP COLUMN IF EXISTS client_id;
```

> **Atenção:** Execute esta migration somente após confirmar que nenhum dado de produção está sendo inserido via `sync-workout`. Valide que a função `save-workout` está deployada e funcionando antes de aplicar.

---

### 2.4 — Otimização da query em `user-progress`

**Problema identificado na auditoria:** A Edge Function `user-progress` faz um `SELECT *` em `user_set_logs` sem filtro de data, baixando potencialmente anos de dados para calcular o PR de um único exercício. Isso escala mal conforme o usuário treina mais.

**Ação — Adicionar filtro de data e limitar colunas no `user-progress/index.ts`:**

```typescript
// ANTES (sem filtro de data — problema de performance):
const { data: sets, error: setsError } = await supabase
  .from('user_set_logs')
  .select(`weight_kg, completed_at, exercise_id, session_exercises(exercise_id)`)
  .order('completed_at', { ascending: false })

// DEPOIS (com limite de 2 anos e índice aproveitado):
const twoYearsAgo = new Date()
twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

const { data: sets, error: setsError } = await supabase
  .from('user_set_logs')
  .select(`weight_kg, completed_at, exercise_id, session_exercises(exercise_id)`)
  .gte('completed_at', twoYearsAgo.toISOString())
  .order('completed_at', { ascending: false })
  .limit(500) // Segurança adicional
```

Também considere criar um índice composto no banco para acelerar a query:

```sql
-- Adicionar em nova migration:
CREATE INDEX IF NOT EXISTS idx_user_set_logs_exercise_completed
  ON user_set_logs(exercise_id, completed_at DESC);
```

---

## 🔧 PRIORIDADE 3 — FLUXO DE AUTENTICAÇÃO

### 3.1 — Adicionar suporte a recuperação de senha via e-mail

**Problema:** Não existe endpoint ou lógica para envio de e-mail de recuperação de senha. O `AuthScreen` não possui link de "Esqueci minha senha".

**Ação no backend (Supabase Dashboard):**
1. Em `Authentication > Email Templates`, configure o template **"Reset Password"** com o link para o deep link do app: `protrack://reset-password?token={{ .Token }}`
2. Certifique-se que a opção de envio de e-mails está habilitada no projeto Supabase (SMTP configurado em `Project Settings > Auth`)

O mobile fará a chamada `supabase.auth.resetPasswordForEmail(email)` — o backend apenas precisa ter o e-mail de reset configurado.

---

## 📋 PRIORIDADE 4 — BOAS PRÁTICAS E QUALIDADE

### 4.1 — Padronizar a versão do Deno std e do supabase-js nas Edge Functions

**Problema:** As funções importam `https://deno.land/std@0.168.0/http/server.ts` e `https://esm.sh/@supabase/supabase-js@2.38.4`. Garantir que todas as funções usem exatamente as mesmas versões evita divergências de comportamento.

**Ação:** Criar um arquivo `supabase/functions/_shared/deps.ts` com as dependências centralizadas:

```typescript
// supabase/functions/_shared/deps.ts
export { serve } from "https://deno.land/std@0.168.0/http/server.ts"
export { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

Atualizar cada `index.ts` para importar de `../_shared/deps.ts` em vez de importar diretamente das URLs externas.

---

### 4.2 — Adicionar `.env.example` e garantir segredos fora do repositório

**Problema:** O arquivo `.env.local` do mobile tem variáveis de ambiente que não devem ser commitadas. Verificar que o `.gitignore` da raiz e do mobile cobre esses arquivos.

**Ação:**
1. Confirmar que `supabase/.env` e `protrack-mobile/.env*` estão no `.gitignore` da raiz
2. Criar `supabase/.env.example` e `protrack-mobile/.env.example` com as chaves necessárias mas sem valores reais:

```
# supabase/.env.example
SUPABASE_URL=https://<seu-projeto>.supabase.co
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Antes de marcar as tarefas como concluídas, valide:

- [ ] `GET /user-progress?exercise_id=<uuid>` com header `Authorization: Bearer mock-valid-token` retorna **401**
- [ ] `GET /weekly-summary` com `Authorization: Bearer mock-valid-token` retorna **401**
- [ ] `POST /save-workout` com JWT válido insere corretamente em `user_workout_logs` e `user_set_logs`
- [ ] `supabase functions delete sync-workout` executado em produção
- [ ] Migration `remove_offline_columns.sql` aplicada com sucesso (sem erros de FK)
- [ ] Migration `remove_auto_confirm_prod.sql` aplicada em produção
- [ ] Novo usuário recebe e-mail de confirmação ao se cadastrar em produção
- [ ] E-mail de recuperação de senha configurado e funcional no dashboard
