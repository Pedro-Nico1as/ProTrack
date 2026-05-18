# Biblioteca de Conteúdo (Semente)

Este documento lista a biblioteca inicial de exercícios e conteúdos disponíveis no ProTrack & Flow.

## 🏋️ Exercícios Base
Estes exercícios são inseridos automaticamente via `seed.sql` em ambientes de desenvolvimento.

| Exercício | Grupo Muscular | Equipamentos | ID Vídeo (YouTube) |
| :--- | :--- | :--- | :--- |
| Supino Reto com Barra | Peito | Barra, Banco | `rT7DgCr-3pg` |
| Agachamento Livre | Pernas | Barra, Gaiola | `gcNh17Ckjgg` |
| Levantamento Terra | Costas | Barra | `op9kVnSso6Q` |
| Puxada Alta na Polia | Costas | Polia | `O94yVzXz3pY` |
| Desenvolvimento com Halteres | Ombros | Halteres, Banco | `qEwKCR5JCog` |
| Cadeira Extensora | Pernas | Máquina | `YyvSfVjQeL0` |
| Cadeira Flexora | Pernas | Máquina | `1Tq3Qd_8XQI` |
| Rosca Direta com Barra | Bíceps | Barra | `kwG2ipFRgfo` |
| Tríceps Corda | Tríceps | Polia, Corda | `vB5OHsJ3EME` |
| Elevação Lateral | Ombros | Halteres | `3VcKaXpzqRo` |

## 📐 Padronização de Dados
Para garantir a consistência dos dados inseridos por atletas parceiros, seguimos as seguintes convenções:

1. **Nomenclatura**: Capital Case (Ex: "Supino Inclinado com Halteres").
2. **Grupos Musculares**: Peito, Costas, Pernas, Ombros, Bíceps, Tríceps, Core, Cardio.
3. **Equipamentos**: Devem ser selecionados a partir de uma lista pré-definida no schema (`text[]`).
4. **Vídeos**: Apenas o ID do vídeo do YouTube (Ex: `rT7DgCr-3pg`), nunca a URL completa.

## 🔄 Fluxo de Atualização
Novos exercícios podem ser sugeridos por atletas, mas devem passar pelo processo de curadoria detalhado no [Guia de Curadoria](../guides/content-curation.md) antes de serem disponibilizados globalmente.
