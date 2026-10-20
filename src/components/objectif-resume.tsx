import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Txt } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { avancement, nombre } from '@/lib/objectif';
import { useStore } from '@/lib/store';

export function Barre({ pct }: { pct: number }) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.fill, { width: `${Math.max(2, pct * 100)}%`, backgroundColor: theme.accent }]} />
    </View>
  );
}

// Rappel de l'objectif sur « Aujourd'hui » : un chiffre, une barre, le rythme à tenir.
export function ObjectifResume() {
  const { state } = useStore();
  const o = state.objectif;
  return (
    <Pressable accessibilityRole="button" onPress={() => router.navigate('/objectif')} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      <Card>
        <Txt variant="overline">Objectif</Txt>
        {o ? (
          <Contenu />
        ) : (
          <Txt>Fixe un chiffre à faire monter : l&apos;atelier te dit le rythme à tenir chaque semaine.</Txt>
        )}
      </Card>
    </Pressable>
  );

  function Contenu() {
    const a = avancement(o!);
    return (
      <View style={{ gap: Spacing.two }}>
        <Txt variant="heading">
          {nombre(a.actuel)} / {nombre(o!.cible)} sur {o!.plateforme}
        </Txt>
        <Barre pct={a.pct} />
        <Txt variant="small" color="textSecondary">
          {a.atteint ? 'Objectif atteint.' : `+${nombre(a.parSemaine)} par semaine pour y arriver à temps`}
        </Txt>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
});
