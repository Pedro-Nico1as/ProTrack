# Gravação de Treinos

Explicação técnica de como o ProTrack & Flow persiste os dados de treino.

> [!NOTE]
> **Mudança de Arquitetura (2026-05-24):** A estratégia de sincronização offline assíncrona com fila em memória (`useSyncStore` + `syncEngine`) foi descontinuada. O app agora utiliza **gravação síncrona direta** via Edge Function `save-workout`. As colunas `client_id` e `synced_at` foram removidas do banco de dados.

## Fluxo de Gravação
1. O usuário realiza o treino com o app aberto (conexão ativa).
2. As séries são registradas em tempo real na `useActiveWorkoutStore` (MMKV).
3. Ao clicar em "Finalizar Treino", o app envia os dados imediatamente para `POST /functions/v1/save-workout`.
4. O backend insere o log e as séries no banco de dados e retorna o `log_id` gerado.
5. O estado ativo é limpo localmente.

## Armazenamento Local e Persistência

O aplicativo utiliza uma camada de armazenamento local para estado de treino em andamento:

### Estado do Treino Ativo (MMKV com Adapter Customizado)
Para garantir que o usuário não perca o progresso se o aplicativo for fechado acidentalmente durante uma sessão de treino:
- **Tecnologia**: [Zustand](https://github.com/pmndrs/zustand) com middleware de persistência e [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) usando um adapter síncrono customizado (`mmkvStorage` resolvendo o contrato `StateStorage` do Zustand).
- **Dados**: Estado atual do timer, lista de exercícios/partições do treino selecionado e séries já registradas mas ainda não finalizadas.
- **Vantagem**: Hidratação de estado síncrona instantânea ao abrir o app e gravação em milissegundos de séries em tempo real. Solução definitiva contra o bug de prototype no Hermes Engine (veja [ADR-006](../decisions/ADR-006-mmkv-custom-adapter-state-persistence.md)).

## Limitações Atuais
- **Sem suporte offline completo:** Se o usuário perder a conexão antes de finalizar o treino, os dados ficam no MMKV mas não são enviados automaticamente ao backend. A retentativa precisa ser feita manualmente pelo usuário (finalizar novamente quando houver conexão).
- **Append Only**: Logs de treino são sempre preservados cronologicamente no banco de dados.
- **Last Write Wins (LWW)**: Aplicado a dados de perfil e configurações.

