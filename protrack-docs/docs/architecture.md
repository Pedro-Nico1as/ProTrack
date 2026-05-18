# Arquitetura do Projeto

Visão geral das decisões de arquitetura e design do sistema ProTrack & Flow.

## Visão Geral
O ProTrack & Flow utiliza uma arquitetura moderna e escalável, focada na experiência do usuário mobile e na integridade dos dados de performance.

## Pilares Arquiteturais
1. **Offline-First**: O app deve funcionar sem internet. Veja [Offline Sync](./offline-sync.md).
2. **Backend as a Service (BaaS)**: Uso intensivo do Supabase para reduzir overhead de infraestrutura.
3. **Segurança**: RLS (Row Level Security) aplicado a todas as tabelas.

## Decisões Técnicas (ADRs)
Acompanhe o histórico de decisões na pasta [/decisions/](../decisions/):
- [ADR-001: React Native & Expo](../decisions/ADR-001-react-native-expo.md)
- [ADR-002: Supabase](../decisions/ADR-002-supabase-backend.md)
- [ADR-003: Offline Storage (AsyncStorage + SQLite)](../decisions/ADR-003-offline-asyncstorage-sqlite.md)
- [ADR-004: Video Strategy](../decisions/ADR-004-youtube-embed-only.md)
- [ADR-005: RevenueCat IAP](../decisions/ADR-005-revenuecat-iap.md)
- [ADR-006: MMKV com Adapter Customizado](../decisions/ADR-006-mmkv-custom-adapter-state-persistence.md)

