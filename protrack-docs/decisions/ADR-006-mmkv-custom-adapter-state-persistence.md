# ADR-006 — Retorno ao MMKV com Adapter Customizado para Persistência de Estado

**Data:** 2026-05-16
**Status:** Accepted
**Decidido por:** Equipe ProTrack & Flow

## Contexto
Conforme documentado no [ADR-003](./ADR-003-offline-asyncstorage-sqlite.md), a equipe havia migrado a persistência de estado do Zustand (`useActiveWorkoutStore`) para o `AsyncStorage` devido a erros de runtime no motor Hermes no iOS (`TypeError: Cannot read property 'prototype' of undefined`). 

No entanto, o `AsyncStorage` opera de forma assíncrona, o que introduz um atraso perceptível na hidratação do estado ativo de treino ao iniciar o aplicativo, além de menor eficiência operacional em comparação ao MMKV. O objetivo era restaurar o uso do MMKV sem provocar falhas de compatibilidade.

## Opções consideradas
1. **Manter AsyncStorage** — Seguro, mas assíncrono e com performance limitada para cenários de escrita em alta frequência (como tracking em tempo real).
2. **Utilizar MMKV com Adapter Customizado** — Implementar um objeto que assine o contrato `StateStorage` do Zustand, encapsulando as chamadas síncronas para uma instância do MMKV inicializada por `createMMKV()`, evitando o uso direto de referências de prototype que quebravam no Hermes.

## Decisão
Decidimos utilizar o **MMKV com um StateStorage Adapter Customizado** (`mmkvStorage`) para gerenciar a persistência da `useActiveWorkoutStore`.

Implementamos a seguinte estrutura no código:
```typescript
import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

const storage = createMMKV();

const mmkvStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};
```

Esta abordagem elimina a chamada direta a instâncias que dependiam de heranças complexas de protótipo que a Hermes Engine não conseguia resolver na versão anterior da biblioteca, mantendo 100% de estabilidade e o acesso síncrono e ultrarrápido aos dados.

## Trade-offs

### Prós:
- **Hidratação Síncrona:** O estado ativo do treino é hidratado instantaneamente ao abrir o aplicativo, sem "flashes" de carregamento causados pelo ciclo assíncrono do `AsyncStorage`.
- **Performance Superior:** Escritas em milissegundos para salvar o progresso de cada série em tempo real.
- **Estabilidade:** Resolução definitiva do bug do Hermes sem comprometer os objetivos de arquitetura.

### Contras / Custos:
- **Código Customizado:** Necessidade de manter o boilerplate do adapter `mmkvStorage` na definição de cada store persistente.

## Riscos a monitorar
- Mudanças futuras na tipagem do `StateStorage` do Zustand ou na API pública do `react-native-mmkv` que exijam refatoração do adapter.
