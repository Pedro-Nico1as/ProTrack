# ADR-001 — Uso de React Native com Expo

**Data:** 2026-05-09
**Status:** Accepted
**Decidido por:** Equipe ProTrack & Flow

## Contexto
O ProTrack & Flow precisa ser um aplicativo mobile performante para iOS e Android, com foco em uma experiência de usuário fluida no ambiente de academia. Precisamos de agilidade no desenvolvimento e facilidade de deploy/atualização.

## Opções consideradas
1. **React Native (CLI)** — Controle total sobre o código nativo, mas maior complexidade de setup e manutenção.
2. **Flutter** — Ótima performance, mas requer aprendizado de Dart e ecossistema diferente.
3. **React Native com Expo (Managed Workflow)** — Facilidade de setup, atualizações via OTA (Over-the-Air) e ecossistema de bibliotecas robusto.

## Decisão
Escolhemos o **React Native com Expo** (Managed Workflow) para maximizar a velocidade de desenvolvimento e facilitar o compartilhamento de builds durante a fase de prototipagem e MVP.

## Consequências
**Positivas:**
- Setup rápido do ambiente de desenvolvimento.
- Facilidade de testes via Expo Go.
- Suporte nativo a muitas funcionalidades comuns (Push Notifications, Camera, etc).

**Negativas / trade-offs:**
- Tamanho do binário levemente maior que o RN puro.
- Dependência do ecossistema Expo para algumas funcionalidades.

**Riscos a monitorar:**
- Necessidade de "ejectar" para Development Builds se bibliotecas nativas específicas não forem suportadas pelo Expo Go.
