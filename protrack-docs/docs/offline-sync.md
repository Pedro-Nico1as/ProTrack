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

### 1. Estado do Treino Ativo (AsyncStorage)
Para garantir que o usuário não perca o progresso se o aplicativo for fechado acidentalmente durante uma sessão de treino:
- **Tecnologia**: [Zustand](https://github.com/pmndrs/zustand) com middleware de persistência e [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage).
- **Dados**: Estado atual do timer, lista de exercícios da sessão e séries já registradas mas ainda não finalizadas.
- **Vantagem**: Estabilidade e compatibilidade garantida com a engine Hermes no iOS.

### 2. Logs de Treino Finalizados (SQLite)
Uma vez que o usuário clica em "Finalizar Treino":
- **Tecnologia**: SQLite (via Expo SQLite).
- **Processo**: Os dados saem do estado ativo (AsyncStorage) e são persistidos no banco de dados relacional local como um registro pronto para sincronização.
- **Sincronização**: O `SyncEngine` lê do SQLite para enviar ao Supabase.

## Estratégia de Conflitos e Deduplicação
- **Deduplicação via `client_id`**: Cada log e série gerada offline recebe um UUID v4 no cliente. O backend ignora registros com IDs já existentes para evitar duplicatas em caso de múltiplas tentativas de sync.
- **Last Write Wins (LWW)**: Aplicado a dados de perfil e configurações.
- **Append Only**: Logs de treino são sempre preservados cronologicamente.
