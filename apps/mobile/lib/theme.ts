export const colors = {
  bg: '#0A0A1F',
  bgAlt: '#13132E',
  surface: '#1A1A38',
  surfaceAlt: '#22224A',
  border: '#2E2E55',
  primary: '#FF2E7E',
  primaryDark: '#C71960',
  primaryLight: '#FF6BA8',
  accent: '#FFD23F',
  accentDark: '#E0B020',
  secondary: '#7B2CBF',
  text: '#FFFFFF',
  textMuted: '#B4B4D0',
  textDim: '#7878A0',
  danger: '#FF5252',
  success: '#1DD1A1',
  overlay: 'rgba(10,10,31,0.85)',
};

export const gradients = {
  hero: ['#FF2E7E', '#7B2CBF'] as const,
  heroDark: ['#7B2CBF', '#0A0A1F'] as const,
  card: ['rgba(0,0,0,0)', 'rgba(10,10,31,0.95)'] as const,
  primary: ['#FF2E7E', '#FF6BA8'] as const,
  accent: ['#FFD23F', '#FF8C42'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 28,
  full: 999,
};

export const font = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 28,
  hero: 44,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  glow: {
    shadowColor: '#FF2E7E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
};
