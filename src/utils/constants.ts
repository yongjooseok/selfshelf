export const COLORS = {
  bg: '#0F0F14',
  surface: '#1A1A24',
  surfaceLight: '#242432',
  accent: '#7C6AFF',
  accentLight: '#9B8AFF',

  // 카드 색상
  red: '#FF4D6A',
  redBg: 'rgba(255,77,106,0.12)',
  yellow: '#FFB830',
  yellowBg: 'rgba(255,184,48,0.12)',
  green: '#34D399',
  greenBg: 'rgba(52,211,153,0.12)',

  text: '#F0F0F5',
  textSub: '#8888A0',
  border: '#2A2A3A',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const SEVERITY_COLORS = {
  red: { main: COLORS.red, bg: COLORS.redBg },
  yellow: { main: COLORS.yellow, bg: COLORS.yellowBg },
  green: { main: COLORS.green, bg: COLORS.greenBg },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const FREE_HISTORY_LIMIT = 10;
