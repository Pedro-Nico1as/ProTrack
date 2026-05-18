# Bug Reports — ProTrack & Flow

Este documento lista todos os bugs encontrados durante os ciclos de teste.

---

## BUG-001 — Handoff Log Desatualizado
... (mantido)

## BUG-002 — Risco de Perda de Dados no SyncEngine

**Severidade:** Critical
**Componente:** Mobile (Sync)
**Status:** ✅ Fixed

**Para reproduzir:**
1. Analisar `protrack-mobile/src/services/syncEngine.ts`, linha 31.
2. Observar que `store.clearSyncedData` é chamado para todos os IDs enviados no payload original assim que `response.data` é retornado.
3. Se o servidor processar apenas parte dos dados (ex: erro parcial ou limite de rate), o cliente descartará o restante da fila local permanentemente.

**Resultado esperado:** Apenas os IDs confirmados pelo servidor (ex: via lista de IDs sincronizados no response) devem ser removidos da fila local.
**Resultado atual:** Limpeza total da fila local após qualquer resposta de sucesso, independente do conteúdo.

**Evidências:** N/A (Análise de código)
**Encontrado em:** 2024-05-09 por Agente QA

## BUG-003 — Inconsistência de PK no Modelo de Dados

**Severidade:** Medium
**Componente:** Documentation / Backend
**Status:** ✅ Fixed

**Para reproduzir:**
1. Comparar `protrack-docs/docs/data-model.md` com `supabase/migrations/20260509192527_initial_schema.sql`.
2. O MD indica `client_id` como Primary Key. O SQL usa um `id` serial/uuid como PK e `client_id` como Unique.

**Resultado esperado:** Documentação e Schema devem estar sincronizados sobre qual campo é a Chave Primária para evitar erros em mapeamentos de ORM/SDK.
**Resultado atual:** Divergência na definição da Chave Primária.

**Encontrado em:** 2024-05-09 por Agente QA

---

## BUG-009 — Contador de Treinos Estático na HomeScreen

**Severidade:** Medium
**Componente:** Mobile (UI / HomeScreen)
**Status:** ✅ Fixed — HomeScreen agora lê contadores do SQLite via `useFocusEffect`.

**Para reproduzir:**
1. Finalizar um treino no Modo Ativo.
2. Retornar para a HomeScreen.
3. Observar o campo "TREINOS" no card de estatísticas.

**Resultado esperado:** O número de treinos concluídos deve atualizar para refletir o treino recém-finalizado.
**Resultado atual:** O contador está hardcoded como `0` em `HomeScreen.tsx` (Linha 33). A HomeScreen não lê do `StorageService` nem escuta eventos de conclusão de treino.

**Causa-raiz:** `<Text variant="subheading" color={colors.primary}>0</Text>` — valor estático, sem nenhuma lógica reativa.
**Arquivo:** `protrack-mobile/src/screens/Home/HomeScreen.tsx:33`
**Encontrado em:** 2026-05-12 por Agente QA

---

## BUG-010 — Desalinhamento das Colunas SÉRIE / CARGA / REPS

**Severidade:** Medium
**Componente:** Mobile (UI / ExerciseCard + SetRow)
**Status:** ✅ Fixed — Header usa exatamente as mesmas larguras do SetRow (width:30 / flex:1 / width:44).

**Para reproduzir:**
1. Abrir o Modo Ativo.
2. Observar o cabeçalho "SÉRIE · CARGA · REPS" versus as colunas de inputs do `SetRow`.

**Resultado esperado:** Os títulos SÉRIE, CARGA e REPS devem estar perfeitamente alinhados com seus respectivos campos de input abaixo.
**Resultado atual:** Desalinhamento visual porque o cabeçalho usa `flex: 1` uniforme (3 colunas iguais + espaço vazio), mas o `SetRow` usa `width: 30` fixo para SÉRIE e `flex: 1` para as entradas — as larguras não batem.

**Causa-raiz:**
- `ExerciseCard.tsx:41` — `<View style={{ width: 52 }} />` (placeholder do botão no header)
- `ExerciseCard.tsx:108` — `headerText: { flex: 1 }` — SÉRIE recebe `flex: 1`
- `SetRow.tsx:95` — `setNumberWrap: { width: 30 }` — SÉRIE recebe `width: 30` fixo
- A coluna do número de série tem largura diferente no header (`flex:1`) vs na linha de dados (`width:30`).

**Arquivos:** `ExerciseCard.tsx:38-42`, `SetRow.tsx:40-46`
**Encontrado em:** 2026-05-12 por Agente QA

---

## BUG-011 — Botões de Navegação Saem da Tela com Vídeo Expandido

**Severidade:** High
**Componente:** Mobile (UI / ActiveWorkoutScreen + FloatingYouTubePlayer)
**Status:** ✅ Fixed — Botões movidos para footer fixo fora do ScrollView.

**Para reproduzir:**
1. Abrir o Modo Ativo com um exercício que possua vídeo.
2. **Não minimizar** o player de vídeo (manter expandido, altura 200px).
3. Observar os botões "Próximo Exercício" / "Finalizar Treino" e o botão "←" de navegação.

**Resultado esperado:** Os botões de controle do treino devem sempre estar visíveis e acessíveis, independentemente do estado do player de vídeo.
**Resultado atual:** O player ocupar 200px + header do player + cabeçalho da tela + card de exercícios empurra os botões de controle para fora da área visível da tela. O usuário precisa fazer scroll para encontrá-los, o que é inaceitável durante o treino.

**Causa-raiz:** Os botões `controls` estão dentro do `ScrollView` (linha 193), mas o conteúdo total (header + ExerciseCard + FloatingYouTubePlayer com 200px) excede a altura da tela. A solução é mover os botões de navegação para **fora do ScrollView**, fixos na parte inferior da tela como um footer.

**Arquivo:** `protrack-mobile/src/screens/ActiveWorkout/ActiveWorkoutScreen.tsx:185-219`
**Encontrado em:** 2026-05-12 por Agente QA

---

## BUG-012 — `session_id` Gerado Aleatoriamente ao Finalizar Treino

**Severidade:** Medium
**Componente:** Mobile (ActiveWorkoutScreen / StorageService)
**Status:** ✅ Fixed — O `sessionId` da sessão do plano agora é propagado corretamente no estado da store `useActiveWorkoutStore` (iniciando o treino ativo via parâmetros de rota opcionais) e persistido no SQLite local.

**Para reproduzir:**
1. Iniciar um treino a partir de um plano de atleta.
2. Finalizar o treino.
3. Verificar no banco de dados local o campo `session_id` salvo.

**Resultado esperado:** O `session_id` deve ser o ID real da sessão do plano de treino executado (para fins de histórico e progresso vinculado ao template).
**Resultado atual:** Resolvido. O `session_id` do template agora é preservado no store e gravado no log do SQLite.

**Arquivo:** `protrack-mobile/src/screens/ActiveWorkout/ActiveWorkoutScreen.tsx:90`
**Encontrado em:** 2026-05-12 por Agente QA

---

## BUG-007 — Mismatch de Nomenclatura no Contrato de Sync (Backend ↔ Mobile)

**Severidade:** High
**Componente:** Backend (Edge Function) / Mobile (SyncEngine)
**Status:** ✅ Fixed — SyncEngine aceita tanto `synced` quanto `synced_count` via nullish coalescing.

**Para reproduzir:**
1. Verificar `supabase/functions/sync-workout/index.ts` linha 82: retorna `synced_count`.
2. Verificar `protrack-mobile/src/services/syncEngine.ts` linha 28: espera `synced`.

**Resultado esperado:** O campo de contagem de itens sincronizados deve ter o mesmo nome em ambos os lados do contrato.
**Resultado atual:** Backend envia `{ synced_count }`, Mobile lê `{ synced }` — o campo fica `undefined` no Mobile.

**Encontrado em:** 2026-05-10 por Agente QA
