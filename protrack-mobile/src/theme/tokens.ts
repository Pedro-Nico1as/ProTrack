export const colors = {
  background: '#000000',
  surface: '#1A1A1A',
  surfaceHighlight: '#262626',
  surfaceElevated: '#333333',

  primary: '#E43232',
  primaryDark: '#B71C1C',
  primaryGlow: 'rgba(228, 50, 50, 0.15)',

  accent: '#FF4D4D',
  accentGlow: 'rgba(255, 77, 77, 0.15)',
  accentLight: 'rgba(255, 77, 77, 0.25)',

  pinkAccent: '#FF66F4',
  pinkAccentGlow: 'rgba(255, 102, 244, 0.15)',

  badgeGreen: '#04D361',
  badgeBlue: '#E43232',

  text: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textMuted: '#737373',

  border: '#262626',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',

  error: '#FF3344',
  success: '#00E676',
  warning: '#FFB300',

  // Gradients (arrays for LinearGradient)
  gradients: {
    card: ['#1A1A1A', '#000000'],
    primaryBtn: ['#E43232', '#C62828'],
    accentBtn: ['#FF4D4D', '#E43232'],
    surface: ['rgba(26, 26, 26, 0.85)', 'rgba(0, 0, 0, 0.95)'],
    restTimer: ['#1A1A1A', '#000000'],
    brand: ['#E43232', '#FF4D4D'],
  },
};

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 28,
    hero: 36,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1.2,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const sizing = {
  touchableMinHeight: 44,
  buttonHeight: 52,
  fabSize: 56,
  cardRadius: 16,
  videoRadius: 16,
};

export const animation = {
  pressScale: 0.97,
  duration: {
    fast: 120,
    normal: 200,
    slow: 350,
  },
};
