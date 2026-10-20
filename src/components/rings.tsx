// Anneaux de progression, façon Activité Apple / Flighty : chaque anneau = un engagement de la semaine.
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

export type Anneau = { valeur: number; couleur: string }; // valeur entre 0 et 1 (plafonnée)

export function Rings({ anneaux, taille = 112, epaisseur = 11 }: { anneaux: Anneau[]; taille?: number; epaisseur?: number }) {
  const theme = useTheme();
  const c = taille / 2;
  return (
    <View style={{ width: taille, height: taille }} accessible={false}>
      <Svg width={taille} height={taille}>
        {anneaux.map((a, i) => {
          const r = c - epaisseur / 2 - i * (epaisseur + 3);
          const perimetre = 2 * Math.PI * r;
          const v = Math.min(1, Math.max(0, a.valeur));
          return (
            <G key={i}>
              <Circle cx={c} cy={c} r={r} stroke={theme.backgroundSelected} strokeWidth={epaisseur} fill="none" />
              <Circle
                cx={c}
                cy={c}
                r={r}
                stroke={a.couleur}
                strokeWidth={epaisseur}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${perimetre} ${perimetre}`}
                strokeDashoffset={perimetre * (1 - Math.max(v, 0.001))}
                transform={`rotate(-90 ${c} ${c})`}
              />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
