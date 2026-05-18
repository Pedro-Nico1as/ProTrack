# ADR-005 — RevenueCat para Compras In-App (IAP)

**Data:** 2026-05-09
**Status:** Accepted
**Decidido por:** Equipe ProTrack & Flow

## Contexto
O ProTrack & Flow terá um modelo de assinatura Premium e venda de planos avulsos. Gerenciar as APIs nativas de IAP da Apple (App Store) e Google (Play Store) diretamente é complexo e sujeito a erros.

## Opções consideradas
1. **Implementação Nativa** — Sem custos de terceiros, mas extremamente difícil de manter e testar.
2. **Stripe** — Ótimo para web, mas requer cuidados extras para cumprir regras de produtos digitais em apps mobile.
3. **RevenueCat** — SDK unificado que simplifica a implementação, gestão e análise de assinaturas cross-platform.

## Decisão
Escolhemos o **RevenueCat** para gerenciar todas as compras in-app e assinaturas, garantindo uma implementação robusta e dashboards prontos para análise de receita.

## Consequências
**Positivas:**
- SDK único para iOS e Android.
- Gestão centralizada de recibos e webhooks.
- Facilidade para implementar testes A/B de paywall.

**Negativas / trade-offs:**
- Taxa percentual adicional sobre a receita (acima do limite gratuito).

**Riscos a monitorar:**
- Sincronização entre o status de assinatura no RevenueCat e o perfil do usuário no Supabase.
