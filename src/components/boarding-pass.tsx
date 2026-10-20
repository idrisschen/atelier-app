// La carte d'embarquement d'un contenu : d'où il part (plateforme), où il en est (étapes), et les infos clés en bas.
import { Pressable, StyleSheet, View } from 'react-native';

import { Num, Status, Txt, tap } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FORMATS } from '@/lib/brief';
import { CODE_PLATEFORME, ETAPES } from '@/lib/options';
import { dateCourte } from '@/lib/store';
import type { Contenu } from '@/lib/types';
import { fois } from '@/lib/verdict';

export function etape(c: Contenu) {
  return ETAPES.find((e) => e.id === c.statut)!;
}

export function couleurVerdict(c: Contenu): 'success' | 'warning' | 'danger' | 'text' {
  const n = c.verdict?.niveau;
  return n === 'haut' ? 'success' : n === 'moyen' ? 'warning' : n === 'bas' ? 'danger' : 'text';
}

export function BoardingPass({ c, onPress }: { c: Contenu; onPress?: () => void }) {
  const theme = useTheme();
  const e = etape(c);
  const rang = ETAPES.findIndex((x) => x.id === c.statut);

  const champs: { label: string; valeur: string }[] = [
    { label: 'Créé', valeur: dateCourte(c.cree) },
    { label: c.publie ? 'Publié' : 'Tournage', valeur: c.publie ? dateCourte(c.publie) : c.tournage ? dateCourte(c.tournage) : '—' },
  ];
  if (c.brief) champs.push({ label: 'Plans', valeur: `${c.plansFaits.length}/${c.brief.plans.length}` });

  const contenu = (
    <>
      <View style={styles.codes}>
        <View>
          <Num size={30}>{CODE_PLATEFORME[c.plateforme] ?? c.plateforme.slice(0, 2).toUpperCase()}</Num>
          <Txt variant="label">{c.plateforme}</Txt>
        </View>
        <View style={styles.trajet} accessibilityLabel={`Étape ${rang + 1} sur ${ETAPES.length} : ${e.label}`}>
          {ETAPES.map((x, i) => (
            <View key={x.id} style={[styles.segment, i === ETAPES.length - 1 && { flex: 0 }]}>
              <View style={[styles.dot, { backgroundColor: i <= rang ? theme[e.theme] : theme.backgroundSelected }]} />
              {i < ETAPES.length - 1 ? <View style={[styles.ligne, { backgroundColor: i < rang ? theme[e.theme] : theme.backgroundSelected }]} /> : null}
            </View>
          ))}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Num size={30} color={c.verdict?.ratio ? couleurVerdict(c) : 'text'}>
            {c.verdict?.ratio ? fois(c.verdict.ratio) : FORMATS[c.format].code}
          </Num>
          <Txt variant="label">{c.verdict?.ratio ? 'Médiane' : FORMATS[c.format].label}</Txt>
        </View>
      </View>

      <Txt variant="title" numberOfLines={2}>{c.titre}</Txt>

      <View style={styles.perfo}>
        <View style={[styles.encoche, { left: -Spacing.three - 9, backgroundColor: theme.background }]} />
        <View style={{ flex: 1, borderTopWidth: 1, borderStyle: 'dashed', borderColor: theme.border }} />
        <View style={[styles.encoche, { right: -Spacing.three - 9, backgroundColor: theme.background }]} />
      </View>

      <View style={styles.champs}>
        <View style={{ gap: 4 }}>
          <Txt variant="label">Statut</Txt>
          <Status label={e.label} color={c.statut === 'verdict' ? couleurVerdict(c) : e.theme} />
        </View>
        {champs.map((f) => (
          <View key={f.label} style={{ gap: 4 }}>
            <Txt variant="label">{f.label}</Txt>
            <Txt style={{ fontWeight: '600', fontVariant: ['tabular-nums'] }}>{f.valeur}</Txt>
          </View>
        ))}
      </View>
    </>
  );

  const base = [styles.pass, { backgroundColor: theme.backgroundElement, borderColor: theme.border }];
  if (!onPress) return <View style={base}>{contenu}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${c.titre}, ${e.label}`}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [...base, pressed && { backgroundColor: theme.backgroundSelected }]}>
      {contenu}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pass: { borderRadius: Radius.large, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: Spacing.three, overflow: 'hidden' },
  codes: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  trajet: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  segment: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  ligne: { flex: 1, height: 2, marginHorizontal: 2, borderRadius: 1 },
  perfo: { flexDirection: 'row', alignItems: 'center', height: 18 },
  encoche: { position: 'absolute', width: 18, height: 18, borderRadius: 9 },
  champs: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
});
