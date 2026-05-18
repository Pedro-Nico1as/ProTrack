# Plano de Testes — ProTrack & Flow

> [!NOTE]
> Mantido pelo QA Engineer. Formatado e organizado pelo Technical Writer.

## 1. Visão Geral
Este documento descreve a estratégia de testes, cobertura e métricas de qualidade para o ProTrack & Flow. O foco principal é garantir a confiabilidade dos recursos "Modo Ativo" e "Sincronização Offline".

## 2. Cobertura de Fluxos Críticos
| Fluxo | Status | Cobertura % | Último Teste |
| :--- | :--- | :--- | :--- |
| **Onboarding e Autenticação** | 🏗️ Em Implementação | 10% | 2026-05-12 |
| **Explorar e Iniciar Treino** | 🏗️ Em Implementação | 30% | 2026-05-12 |
| **Modo Ativo (Crítico)** | ✅ Funcional | 90% | 2026-05-13 |
| **Modo Offline (Crítico)** | 🛡️ Testes de Integração | 65% | 2026-05-13 |
| **Histórico e Progresso** | 🛡️ Auditoria Completa | 10% | 2026-05-12 |

## 3. Métricas de Qualidade
- **Bugs Abertos por Severidade:**
  - Crítico: 0
  - Alto: 0
  - Médio: 0
  - Baixo: 0
- **Bugs Fechados (Semana):** 0
- **Tempo Médio de Resolução:** N/A

## 4. Estratégia de Teste
- **Testes de Integração:** Focados nos endpoints de API e Edge Functions (Supabase).
- **Testes E2E:** Validação de fluxos reais no app mobile.
- **Validação Manual:** Capturas de tela e gravações para verificação de UX/UI.
