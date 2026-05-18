# ADR-004 — Conteúdo de Vídeo apenas via YouTube Embed

**Data:** 2026-05-09
**Status:** Accepted
**Decidido por:** Equipe ProTrack & Flow

## Contexto
O aplicativo exibirá vídeos demonstrativos de exercícios. Armazenar e servir vídeos diretamente do Supabase Storage pode gerar altos custos de largura de banda e complexidade de transcodificação.

## Opções consideradas
1. **Self-hosting (Supabase Storage)** — Controle total, mas caro e complexo (requer player customizado e transcodificação).
2. **Vimeo** — Ótima qualidade, mas requer assinatura paga.
3. **YouTube Embed** — Gratuito, infraestrutura robusta e familiar aos criadores de conteúdo (atletas).

## Decisão
Utilizaremos apenas **YouTube Embed** para exibição de vídeos de demonstração de exercícios. Os atletas parceiros fornecerão o ID do vídeo do YouTube em seus planos.

## Consequências
**Positivas:**
- Custo zero de armazenamento e streaming de vídeo.
- Menor consumo de recursos do servidor próprio.
- Facilidade para os atletas que já possuem canal no YouTube.

**Negativas / trade-offs:**
- Dependência das políticas do YouTube.
- Exibição eventual de anúncios ou interface do YouTube (embed).

**Riscos a monitorar:**
- Vídeos sendo removidos do YouTube pelos autores, causando links quebrados no app.
