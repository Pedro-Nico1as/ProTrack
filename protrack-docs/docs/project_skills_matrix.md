# Matriz de Competências e Habilidades (Skills Matrix) — ProTrack & Flow

Este documento serve como guia para novos membros da equipe e para o alinhamento estratégico sobre o que é necessário para dominar o projeto.

---

## 📱 1. Mobile Engineering (React Native & Expo)

### Hard Skills
- **React Native (Managed Workflow):** Entendimento de `app.json`, builds de desenvolvimento e Expo Go.
- **TypeScript:** Tipagem estrita de componentes, navegação e stores.
- **Navegação (React Navigation v6+):** Stack, Tabs e Modals com Tipagem de ParamList.
- **Gerenciamento de Estado (Zustand):** Uso de hooks para acesso a store e middleware `persist`.
- **Persistência Relacional (SQLite):** Escrita de queries SQL puras via `expo-sqlite` para logs offline.
- **Manipulação de Mídia:** Uso de `react-native-youtube-iframe` e `expo-av` para controle de áudio e vídeo.
- **Feedback Tátil e UI:** Uso de `expo-haptics` e animações leves.

### Conceitos Chave
- Ciclo de vida do App (AppState) para pausar/retomar vídeos.
- Layout Responsivo com `react-native-safe-area-context`.

---

## 🛠️ 2. Backend Engineering (Supabase & Infrastructure)

### Hard Skills
- **PostgreSQL:** Modelagem de dados, Foreign Keys e Unique Constraints (`client_id`).
- **Supabase Edge Functions:** Desenvolvimento em Deno e TypeScript.
- **Row Level Security (RLS):** Criação de políticas granulares baseadas em `auth.uid()`.
- **API REST (PostgREST):** Filtros complexos e expansão de relacionamentos via query params.
- **Auth:** Integração de JWT com o cliente mobile.

### Conceitos Chave
- Estratégias de **Deduplicação** (Upsert) baseadas em IDs gerados pelo cliente.
- Segurança de dados multi-tenant (Isolamento por usuário).

---

## 🔄 3. Arquitetura Offline-First

### Hard Skills
- **Sync Engines:** Lógica de enfileiramento (queue), detecção de status de rede (`NetInfo`) e retentativa (retry).
- **UID Generation:** Uso de UUIDs (v4) no cliente para evitar colisões de ID antes do sync.

### Conceitos Chave
- **Last-Write-Wins:** Entendimento de conflitos de sincronização.
- **Buffer de Persistência:** Diferença entre estado volátil (Store), estado persistente simples (AsyncStorage) e estado persistente complexo (SQLite).

---

## 🧪 4. Quality Assurance (QA)

### Hard Skills
- **Testes de Integração:** Jest + Supertest para validar Edge Functions.
- **E2E Testing:** Noções de Maestro ou Detox para testar fluxos completos.
- **Stress Testing:** Simulação de alta latência e payloads massivos para o Sync.

---

## ✍️ 5. Processo e Documentação

- **ADRs (Architecture Decision Records):** Compreensão do racional por trás das decisões (ex: por que usamos AsyncStorage em vez de MMKV).
- **Handoff Logs:** Disciplina para registrar progressos e bloqueios diários.
- **Git Flow:** Manutenção de branches limpas e mensagens de commit semânticas.

---

## 🏋️ 6. Domínio do Produto (Fitness Tech)

- **Lógica de Treino:** Entendimento de Séries, Repetições, Carga e Descanso.
- **Cálculo de Volume:** Fórmulas de volume semanal para analytics.
- **PR (Personal Record):** Lógica de detecção de recordes pessoais por exercício.
