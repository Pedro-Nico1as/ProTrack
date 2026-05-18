# ADR-002 — Supabase como Backend as a Service

**Data:** 2026-05-09
**Status:** Accepted
**Decidido por:** Equipe ProTrack & Flow

## Contexto
O projeto necessita de uma infraestrutura de backend escalável, segura e que suporte autenticação, banco de dados relacional e armazenamento de arquivos (imagens/vídeos) sem a necessidade de gerenciar servidores complexos.

## Opções consideradas
1. **Firebase** — Facilidade de uso, mas banco de dados NoSQL (Firestore) pode dificultar consultas complexas de performance fitness.
2. **Backend Customizado (Node.js/Go + AWS)** — Controle total, mas alto custo de tempo e manutenção inicial.
3. **Supabase** — Baseado em PostgreSQL, suporte nativo a RLS (Row Level Security), Auth e Storage, com interface amigável e open-source.

## Decisão
Escolhemos o **Supabase** devido ao poder do PostgreSQL para gerenciar dados relacionais complexos (treinos, séries, históricos) e a facilidade de implementação de segurança com RLS.

## Consequências
**Positivas:**
- Postgres nativo com suporte a JSONB.
- Autenticação integrada (Google, Apple, Email).
- Tempo real (Realtime) para sincronização de dados.

**Negativas / trade-offs:**
- Dependência de um provedor de BaaS.
- Curva de aprendizado para RLS (Row Level Security) avançado.

**Riscos a monitorar:**
- Limites da camada gratuita durante o crescimento da base de usuários.
