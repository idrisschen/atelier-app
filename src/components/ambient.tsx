// Fond « cinéma » : un dégradé profond et un halo bleu qui dérive lentement derrière le verre.
// Il s'arrête si l'utilisateur a demandé moins d'animations.
import { useEffect, useId } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

function Halo({ couleur, taille, x, y, duree, amplitude }: { couleur: string; taille: number; x: number; y: number; duree: number; amplitude: number }) {
  const reduit = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduit) t.value = withRepeat(withTiming(1, { duration: duree, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [reduit, duree, t]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: t.value * amplitude }, { translateY: t.value * amplitude * 0.6 }] }));
  // Identifiant unique : plusieurs écrans restent montés (onglets) et un id SVG dupliqué casse le dégradé.
  const id = `h${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: x - taille / 2, top: y - taille / 2, width: taille, height: taille }, anim]}>
      <Svg width={taille} height={taille}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={couleur} stopOpacity={0.32} />
            <Stop offset="0.55" stopColor={couleur} stopOpacity={0.08} />
            <Stop offset="1" stopColor={couleur} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={taille} height={taille} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

export function Ambient({ accent }: { accent?: string }) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const fond = `f${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={fond} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0B0E14" />
            <Stop offset="1" stopColor={theme.background} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${fond})`} />
      </Svg>
      <Halo couleur={accent ?? theme.accent} taille={width * 1.3} x={width * 0.15} y={height * 0.08} duree={14000} amplitude={40} />
    </View>
  );
}
