# Test Plan — ProTrack & Flow

## 1. Overview
This document outlines the testing strategy, coverage, and quality metrics for the ProTrack & Flow application. As the QA Engineer, my goal is to ensure the reliability of the "Modo Ativo" and "Modo Offline" features.

## 2. Critical Flows Coverage
| Flow | Status | Coverage % | Last Tested |
| :--- | :--- | :--- | :--- |
| **Fluxo 1: Onboarding e autenticação** | ⊘ Pending | 0% | - |
| **Fluxo 2: Explorar e iniciar treino** | 🏗️ Implementation Started | 0% | - |
| **Fluxo 3: Modo Ativo (Crítico)** | 🏗️ Implementation Started | 0% | - |
| **Fluxo 4: Modo Offline (Crítico)** | 🛡️ Audit Complete (Bug Found) | 20% | 2024-05-09 |
| **Fluxo 5: Histórico e progresso** | 🛡️ Audit Complete (Edge Funcs ready) | 10% | 2024-05-09 |

## 3. Weekly Quality Metrics
- **Bugs Open by Severity:**
  - Critical: 0
  - High: 0
  - Medium: 0
  - Low: 0
- **Bugs Closed this Week:** 0
- **Avg. Resolution Time:** N/A

## 4. Test Strategy
- **Integration Tests:** Focused on API endpoints defined in `/docs/api.md`.
- **E2E Tests:** Focused on critical user flows using the mobile app.
- **Manual Validation:** Screenshots and recordings for visual/UX verification.
