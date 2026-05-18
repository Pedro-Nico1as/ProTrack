export const colors = {
  background: '#0A0A0C',
  surface: '#16161A',
  surfaceHighlight: '#1E1E24',
  surfaceElevated: '#252530',

  primary: '#00B37E',
  primaryDark: '#00875F',
  primaryGlow: 'rgba(0, 179, 126, 0.15)',

  accent: '#534AB7',
  accentGlow: 'rgba(83, 74, 183, 0.15)',
  accentLight: 'rgba(83, 74, 183, 0.25)',

  badgeGreen: '#04D361',
  badgeBlue: '#2563EB',

  text: '#E1E1E6',
  textSecondary: '#8D8D99',
  textMuted: '#505059',

  border: '#29292E',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',

  error: '#F75A68',
  success: '#04D361',
  warning: '#FBA94C',

  // Gradients (arrays for LinearGradient)
  gradients: {
    card: ['#1A1A22', '#12121A'],
    primaryBtn: ['#00B37E', '#00875F'],
    accentBtn: ['#7C3AED', '#5B21B6'],
    surface: ['rgba(30, 30, 36, 0.9)', 'rgba(22, 22, 26, 0.95)'],
    restTimer: ['#1E1E24', '#0F1F18'],
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
