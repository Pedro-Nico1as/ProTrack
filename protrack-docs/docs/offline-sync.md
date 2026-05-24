# Sincronização Offline

Explicação técnica de como o ProTrack & Flow gerencia dados sem conexão.

## Fluxo de Sincronização
1. O usuário realiza o treino offline.
2. Os dados são salvos localmente no **SQLite**.
3. O app monitora a conexão (`NetInfo`).
4. Ao recuperar a internet, o app envia os logs pendentes para o endpoint `/sync-workout`.
5. O backend processa e retorna confirmação.
6. O app remove os logs locais processados.

## Armazenamento Local e Persistência

O aplicativo utiliza duas camadas de armazenamento local para diferentes propósitos:

### 1. Estado do Treino Ativo (MMKV com Adapter Customizado)
Para garantir que o usuário não perca o progresso se o aplicativo for fechado acidentalmente durante uma sessão de treino:
- **Tecnologia**: [Zustand](https://github.com/pmndrs/zustand) com middleware de persistência e [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) usando um adapter síncrono customizado (`mmkvStorage` resolvendo o contrato `StateStorage` do Zustand).
- **Dados**: Estado atual do timer, lista de exercícios/partições do treino selecionado e séries já registradas mas ainda não finalizadas.
- **Vantagem**: Hidratação de estado síncrona instantânea ao abrir o app e gravação em milissegundos de séries em tempo real. Solução definitiva contra o bug de prototype no Hermes Engine (veja [ADR-006](../decisions/ADR-006-mmkv-custom-adapter-state-persistence.md)).

### 2. Fila de Sincronização e Logs (Zustand)
Uma vez que o usuário clica em "Finalizar Treino", os dados precisam ser transmitidos ao backend de forma confiável:
- **Tecnologia**: Zustand Store (`useSyncStore`) configurada com filas.
- **Processo**: Os logs de sessões completas e as séries executadas entram nas filas locais `pendingLogs` e `pendingSets`.
- **Sincronização**: O serviço `SyncEngine` lê diretamente do `useSyncStore` e dispara um envio em massa (batch) para o backend. Se não houver internet, os dados são preservados.
- **Resolução de Fila**: A remoção e limpeza dos logs na memória local do cliente só ocorre mediante a confirmação explícita do servidor (`synced_ids`) ou pela classificação de conflitos de relacionamento estrutural (`conflicts`).

## Estratégia de Conflitos e Deduplicação
- **Deduplicação via `client_id`**: Cada log e série gerada offline recebe um UUID v4 no cliente. O backend ignora registros com IDs já existentes para evitar duplicatas em caso de múltiplas tentativas de sync.
- **Last Write Wins (LWW)**: Aplicado a dados de perfil e configurações.
- **Append Only**: Logs de treino são sempre preservados cronologicamente.
