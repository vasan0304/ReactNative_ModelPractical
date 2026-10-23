export const COLORS = {
  // FreshCart Brand Colors
  primary: '#2E7D32',         // Deep forest green (brand)
  primaryMid: '#388E3C',      // Standard green
  primaryLight: '#43A047',    // Lighter green
  primaryPale: '#E8F5E9',     // Very light green bg tint
  primaryBg: '#F1F8F1',       // Section backgrounds

  accent: '#F57F17',          // Warm amber/orange accent
  accentLight: '#FFF8E1',     // Light amber tint

  deal: '#D32F2F',            // Red sale badge
  dealLight: '#FFEBEE',       // Light red bg

  seasonal: '#558B2F',        // Earthy seasonal green

  topBar: '#2E7D32',          // Top announcement bar bg
  navBg: '#FFFFFF',           // Header/nav background
  background: '#F7F9F7',      // Page background
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#EEEEEE',

  text: '#1B2E1F',            // Deep forest text
  textSec: '#4A6741',         // Secondary muted green-gray
  textMuted: '#8D9E8A',       // Muted label color
  textLight: '#B0BEC5',

  border: '#E0E8E0',
  divider: '#ECEFF1',

  star: '#FFC107',
  badge: '#D32F2F',
  badgeText: '#FFFFFF',

  success: '#2E7D32',
  warning: '#F57F17',
  danger: '#D32F2F',
  info: '#0288D1',

  categoryIconBg: '#F1F8F1',
};

export const FONTS = {
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semiBold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
  extraBold: { fontWeight: '800' },
  black: { fontWeight: '900' },
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 100,
};

export const SHADOWS = {
  tiny: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  small: {
    shadowColor: '#1B2E1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1B2E1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 4,
  },
  large: {
    shadowColor: '#1B2E1F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Responsive utilities
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const isSmall = SCREEN_W < 360;
export const isMedium = SCREEN_W >= 360 && SCREEN_W < 414;
export const isLarge = SCREEN_W >= 414;
export const isTablet = SCREEN_W >= 768;

export const wp = (percent) => (SCREEN_W * percent) / 100;
export const hp = (percent) => (SCREEN_H * percent) / 100;
export const sp = (size) => {
  const scale = SCREEN_W / 375;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const SCREEN = { width: SCREEN_W, height: SCREEN_H };

export const CARD_WIDTH = isTablet ? (SCREEN_W - 80) / 4 : (SCREEN_W - 52) / 2;
export const PRODUCT_CARD_W = isTablet
  ? (SCREEN_W - 80) / 4
  : isLarge
  ? (SCREEN_W - 48) / 2.3
  : (SCREEN_W - 44) / 2.2;
