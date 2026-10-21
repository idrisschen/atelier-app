// Surface en verre : liquid glass natif sur iOS 26+, flou d'arrière-plan ailleurs (iOS plus ancien, web).
// Le verre n'a de sens que s'il y a de la lumière derrière : voir ambient.tsx.
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';

const LIQUIDE = Platform.OS === 'ios' && isLiquidGlassAvailable();

export function Glass({
  children,
  style,
  radius = Radius.large,
  intensite = 40,
  teinte,
  interactif,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  intensite?: number;
  teinte?: string; // couleur qui colore le verre (ex. statut)
  interactif?: boolean;
}) {
  if (LIQUIDE) {
    return (
      <GlassView glassEffectStyle="regular" colorScheme="dark" tintColor={teinte} isInteractive={interactif} style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
        {children}
      </GlassView>
    );
  }
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      <BlurView intensity={intensite} tint="dark" style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.voile, teinte ? { backgroundColor: teinte } : null, { borderRadius: radius }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // Le liseré clair en haut et le voile blanc très léger font la « tranche » du verre.
  voile: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    borderTopColor: 'rgba(255,255,255,0.22)',
  },
});
