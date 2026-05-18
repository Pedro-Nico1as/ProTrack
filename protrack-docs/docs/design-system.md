# Design System — ProTrack & Flow

> [!NOTE]
> Este documento reflete o sistema de design atualizado da Fase 1, focado em uma estética "Cyber-Fitness" premium com suporte a micro-animações e gradientes.

## 1. Princípios de Design
- **Foco na Performance**: Interface minimalista com alto contraste para uso sob luz solar ou ambientes de academia.
- **Clareza sob Esforço**: Elementos interativos amplos e feedback tátil/visual imediato.
- **Estética Premium**: Uso de gradientes sutis, glassmorphism e micro-interações animadas (Reanimated).

## 2. Cores (Cyber-Dark)

### Brand & Accents
| Cor | Hex / RGBA | Uso |
| :--- | :--- | :--- |
| **Primary** | `#00B37E` | Destaque principal, CTAs de sucesso. |
| **Primary Glow**| `rgba(0, 179, 126, 0.15)` | Efeito de brilho em botões e seleções. |
| **Accent** | `#534AB7` | Navegação, progresso e elementos secundários. |
| **Accent Glow** | `rgba(83, 74, 183, 0.15)` | Efeito de brilho para botões de navegação. |
| **Accent Light** | `rgba(83, 74, 183, 0.25)` | Contornos e estados secundários leves. |

### Semantic
- **Success**: `#04D361` (Registro completo)
- **Error**: `#F75A68` (Alertas críticos)
- **Warning**: `#FBA94C` (Atenção/Descanso)

### Neutral (Foundation)
- **Background**: `#0A0A0C` (Preto profundo)
- **Surface**: `#16161A` (Cards e superfícies)
- **Surface Elevated**: `#252530` (Modais e popovers)
- **Text Primary**: `#E1E1E6`
- **Text Secondary**: `#8D8D99`
- **Border Subtle**: `rgba(255, 255, 255, 0.06)`

---

## 3. Tipografia
Usamos **Inter** com suporte a pesos variados.

| Token | Size | Weight | Uso |
| :--- | :--- | :--- | :--- |
| **Hero** | 36pt | Heavy (800) | KPIs e números de performance. |
| **Title** | 28pt | Bold (700) | Cabeçalhos de tela. |
| **XXL** | 24pt | Semibold (600) | Títulos de seção. |
| **MD** | 16pt | Regular (400) | Corpo de texto padrão. |
| **XS** | 11pt | Regular (400) | Micro-copy e legendas. |

---

## 4. Espaçamento e Sizing
Baseado na grade de **8pt**.

- **Gutter Padrão**: `lg (24pt)` nas laterais da tela.
- **Radius**: `cardRadius (16pt)` e `videoRadius (16pt)`.
- **Botão**: Altura padrão de `52pt`.

---

## 5. Animações e Micro-interações
- **Press State**: Redução de escala para `0.97` (`animation.pressScale`).
- **Duração**:
  - `Fast`: 120ms (Feedback de toque)
  - `Normal`: 200ms (Transições de tela)
  - `Slow`: 350ms (Gradients e layouts complexos)

---

## 6. Componentes Premium (Amostras)

### FloatingYouTubePlayer
Componente expansível para demonstração de exercícios.
- **Estado Minimizado**: Barra sutil com ícone de play e efeito "glow" primário.
- **Estado Expandido**: Player embed com bordas arredondadas (16pt) e overlay de controles customizado.

### ActiveWorkout Controls
Interface de navegação entre exercícios.
- **Progress Dots**: Feedback visual do progresso na sessão (cor Accent).
- **Navigation Buttons**: Botões com efeito glassmorphism (`accentGlow`) e bordas leves (`accentLight`).
