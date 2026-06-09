# Gravação de Treinos

Documentação técnica de como o ProTrack & Flow persiste os dados de treino.

## Arquitetura Atual: Gravação Síncrona Direta

O app usa **gravação síncrona** via Edge Function. A arquitetura anterior de sync offline com fila em memória (`useSyncStore` + `syncEngine`) foi descontinuada em 2026-05-24.

### Fluxo de Gravação

```
Usuário finaliza treino
        │
        ▼
useActiveWorkoutStore (estado em memória + MMKV)
        │  coleta exercícios e séries registradas
        ▼
POST /functions/v1/save-workout
        │  insere em user_workout_logs e user_set_logs
        ▼
{ log_id, sets_saved }  ← retornado ao app
        │
        ▼
Estado ativo limpo (useActiveWorkoutStore.finishWorkout())
```

1. O usuário realiza o treino com o app aberto.
2. Séries são registradas em tempo real na `useActiveWorkoutStore` (Zustand + AsyncStorage).
3. Ao clicar em **"Finalizar Treino"**, o app envia os dados para `POST /functions/v1/save-workout`.
4. O backend insere o log e as séries no banco e retorna o `log_id`.
5. O estado ativo é limpo localmente.

## Persistência Local

### Treino Ativo (`useActiveWorkoutStore`)
- **Tecnologia**: Zustand + `persist` middleware + AsyncStorage
- **Dados**: timer atual, lista de exercícios e partições do treino, séries registradas
- **Objetivo**: garantir que o usuário não perca progresso se o app fechar acidentalmente durante o treino

### Treinos Customizados (`useCustomWorkoutsStore`)
- **Tecnologia**: Zustand + `persist` middleware + AsyncStorage
- **Dados**: templates de treinos criados pelo usuário (splits A/B/C), com migração automática v0→v1
- **Objetivo**: armazenar e gerenciar localmente os planos personalizados

## Limitações Atuais

- **Sem suporte offline completo:** Se o usuário perder conexão antes de finalizar, os dados ficam no AsyncStorage mas não são enviados automaticamente. A retentativa é manual (finalizar novamente quando houver conexão).
- **Append Only:** Logs de treino são sempre preservados cronologicamente. Não há edição retroativa.

## O que foi descontinuado

| Item | Motivo |
|------|--------|
| `syncEngine.ts` | Substituído por `save-workout` |
| `useSyncStore.ts` | Não mais necessário |
| Colunas `client_id` e `synced_at` | Removidas via migration `20260524141000` |
| Edge Function `sync-workout` | Substituída por `save-workout` |
