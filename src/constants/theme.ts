/**
 * Atelier — carnet de créateur : papier chaud, encre, un seul accent vermillon.
 * Couleurs, espacements et rayons viennent d'ici, jamais de valeur en dur dans les écrans.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#161412',
    background: '#F4F1EA',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E9E4D8',
    textSecondary: '#6B655C',
    border: '#DDD6C8',
    accent: '#E0462B',
    accentText: '#FFFFFF',
    success: '#2F7D4F',
  },
  dark: {
    text: '#F4F1EA',
    background: '#121110',
    backgroundElement: '#1C1A18',
    backgroundSelected: '#2A2724',
    textSecondary: '#A39C90',
    border: '#2F2B27',
    accent: '#F05A3E',
    accentText: '#FFFFFF',
    success: '#5DBB83',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 10,
  medium: 16,
  large: 24,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80, web: 72 }) ?? 0;
export const MaxContentWidth = 640;
