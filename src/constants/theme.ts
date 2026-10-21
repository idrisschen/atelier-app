/**
 * Atelier — inspiré de Flighty : fond sombre profond, très gros chiffres arrondis, couleurs réservées aux statuts.
 * Vert / ambre / rouge ne servent qu'à dire un état (jamais de décoration). L'accent sert aux actions.
 * Couleurs, espacements et rayons viennent d'ici, jamais de valeur en dur dans les écrans.
 */

import '@/global.css';

import { Platform } from 'react-native';

const palette = {
  text: '#F2F4F7',
  background: '#07090C',
  backgroundElement: '#12161C',
  backgroundSelected: '#1C222B',
  textSecondary: '#8B95A3',
  textTertiary: '#5A6370',
  border: '#232A34',
  accent: '#5B8CFF',
  accentText: '#FFFFFF',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  golden: '#F59E0B',
  blue: '#6366F1',
} as const;

// L'app est sombre dans les deux modes : c'est son identité (comme Flighty).
export const Colors = { light: palette, dark: palette } as const;

export type ThemeColor = keyof typeof palette;

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
  large: 22,
  pill: 999,
} as const;

// Cartes du Bilan : ce sont des images à poster en story, pas de l'interface. Un dégradé par thème :
// c'est la seule exception à la règle « couleurs réservées aux statuts ».
export const CartesBilan = {
  blanc: '#FFFFFF',
  blancDoux: 'rgba(255,255,255,0.72)',
  bilan: { de: '#16124A', vers: '#1D4AA8' },
  serie: { de: '#B23A1E', vers: '#5A1410', accent: '#FFB4A2' },
  objectif: { de: '#8A5A0B', vers: '#3A2205', accent: '#F8D79B' },
  objectifVide: { de: '#7A4A08', vers: '#3A2205' },
  meilleur: { de: '#F1EEFF', vers: '#C9C3F2', encre: '#1B1A3A', encreDouce: 'rgba(27,26,58,0.62)' },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80, web: 72 }) ?? 0;
export const MaxContentWidth = 640;
