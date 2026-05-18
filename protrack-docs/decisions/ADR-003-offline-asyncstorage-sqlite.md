# ADR-003 — Estratégia de Offline com AsyncStorage e SQLite

**Data:** 2026-05-09 (Atualizado em 2026-05-10 devido a conflitos com Hermes)
**Status:** Accepted (Modificado)
**Decidido por:** Equipe ProTrack & Flow

## Contexto
Atletas costumam treinar em locais com conexão instável (porões de academias, áreas rurais). O aplicativo deve permitir o registro de treinos sem internet e sincronizar os dados assim que a conexão for restabelecida.

Inicialmente planejamos usar o MMKV, mas encontramos conflitos persistentes no motor Hermes (`TypeError: Cannot read property 'prototype' of undefined`) ao tentar integrá-lo com a middleware `persist` do Zustand v5.

## Opções consideradas
1. **AsyncStorage** — Simples, robusto e perfeitamente compatível com Zustand e Hermes.
2. **MMKV** — Extremamente rápido, mas gerou crashes irrecuperáveis na engine JS (Hermes) durante o carregamento inicial do bundle no iOS.
3. **SQLite** — Robusto para dados relacionais grandes, mas mais complexo de configurar.

## Decisão
Decidimos abandonar o MMKV para evitar bloqueios críticos no runtime do React Native. Utilizaremos uma abordagem híbrida: **AsyncStorage** para persistência do estado das stores do Zustand (ex: `useActiveWorkoutStore`), e **SQLite** (via Expo SQLite) para armazenar o log de treinos offline que precisa ser sincronizado posteriormente com o Supabase.

## Consequências
**Positivas:**
- Estabilidade garantida no ambiente iOS/Hermes sem conflitos de `prototype`.
- Integridade referencial para dados complexos offline (SQLite).

**Negativas / trade-offs:**
- Complexidade adicional para gerenciar dois mecanismos de storage.
- Necessidade de uma camada de sincronização (Sync Engine) customizada.
- Leve degradação de performance do estado local em relação ao MMKV, embora o impacto prático no UX seja mínimo.

**Riscos a monitorar:**
- Conflitos de merge durante a sincronização se o usuário editar dados em múltiplos dispositivos offline.
