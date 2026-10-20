import { StyleSheet, View } from 'react-native';

import { Radius, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Barre({ pct, couleur = 'accent' }: { pct: number; couleur?: ThemeColor }) {
  const theme = useTheme();
  const v = Math.min(1, Math.max(0, pct));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}
      style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.fill, { width: `${Math.max(2, v * 100)}%`, backgroundColor: theme[couleur] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
});
