export const colors = {
  background: '#080D18',
  surface: '#0F1626',
  surfaceHighlight: '#172237',
  surfaceElevated: '#1E2C4A',

  primary: '#4B73FF',
  primaryDark: '#2E53E0',
  primaryGlow: 'rgba(75, 115, 255, 0.15)',

  accent: '#FE7B02',
  accentGlow: 'rgba(254, 123, 2, 0.15)',
  accentLight: 'rgba(254, 123, 2, 0.25)',

  pinkAccent: '#FF66F4',
  pinkAccentGlow: 'rgba(255, 102, 244, 0.15)',

  badgeGreen: '#04D361',
  badgeBlue: '#4B73FF',

  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  border: '#1E2C4A',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',

  error: '#F75A68',
  success: '#04D361',
  warning: '#FBA94C',

  // Gradients (arrays for LinearGradient)
  gradients: {
    card: ['#0F1626', '#080D18'],
    primaryBtn: ['#FE7B02', '#FF66F4', '#4B73FF'],
    accentBtn: ['#FF66F4', '#4B73FF'],
    surface: ['rgba(15, 22, 38, 0.9)', 'rgba(8, 13, 24, 0.95)'],
    restTimer: ['#172237', '#080D18'],
    brand: ['#FE7B02', '#FF66F4', '#4B73FF'],
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
