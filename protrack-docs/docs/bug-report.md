# Relatório de Bugs — ProTrack & Flow

Este documento lista todos os bugs encontrados durante os ciclos de teste, seus status e resoluções.

> [!NOTE]
> Mantido pelo QA Engineer. Organizado pelo Technical Writer.

---

## BUG-002 — Risco de Perda de Dados no SyncEngine

**Severidade:** Crítica
**Componente:** Mobile (Sync)
**Status:** ✅ Resolvido

**Descrição:**
A função `store.clearSyncedData` era chamada para todos os IDs enviados no payload original assim que qualquer resposta de sucesso era retornada.

**Resolução:**
A lógica do `SyncEngine` foi alterada para filtrar a remoção de dados locais estritamente baseada na lista de `synced_ids` e `conflicts` retornada explicitamente pelo servidor. Isso garante que registros não processados permaneçam na fila local para tentativas futuras.

---

## BUG-003 — Inconsistência de PK no Modelo de Dados

**Severidade:** Média
**Componente:** Documentação / Backend
**Status:** ✅ Resolvido

**Descrição:**
Divergência na definição da Chave Primária (PK) entre o `data-model.md` e o SQL oficial.

**Resolução:**
O documento `data-model.md` foi atualizado em 2026-05-10 para refletir que a **Primary Key oficial é o `id`** (UUID gerado pelo banco), enquanto o `client_id` é o identificador único para deduplicação offline.
