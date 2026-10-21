// La carte d'embarquement d'un contenu : d'où il part (plateforme), le trajet de ses étapes, et l'essentiel en icônes.
import { Pressable, StyleSheet, View } from 'react-native';

import { Glass } from '@/components/glass';
import { Icon, type NomIcone } from '@/components/icon';
import { Num, Status, Txt, tap } from '@/components/ui';
import { Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FORMATS } from '@/lib/brief';
import { dateCourte } from '@/lib/dates';
import { CODE_PLATEFORME, ETAPES } from '@/lib/options';
import type { Contenu } from '@/lib/types';
import { fois } from '@/lib/verdict';

export function etape(c: Contenu) {
  return ETAPES.find((e) => e.id === c.statut)!;
}

export function couleurVerdict(c: Contenu): 'success' | 'warning' | 'danger' | 'text' {
  const n = c.verdict?.niveau;
  return n === 'haut' ? 'success' : n === 'moyen' ? 'warning' : n === 'bas' ? 'danger' : 'text';
}

export function iconeVerdict(c: Contenu): NomIcone {
  const n = c.verdict?.niveau;
  return n === 'haut' ? 'hausse' : n === 'bas' ? 'baisse' : n === 'moyen' ? 'stable' : 'verdict';
}

// Le trajet : une escale par étape, l'icône de l'étape en cours mise en avant.
function Trajet({ c }: { c: Contenu }) {
  const theme = useTheme();
  const rang = ETAPES.findIndex((x) => x.id === c.statut);
  const couleur: ThemeColor = c.statut === 'verdict' ? couleurVerdict(c) : etape(c).theme;
  return (
    <View style={styles.trajet} accessibilityLabel={`Étape ${rang + 1} sur ${ETAPES.length} : ${etape(c).label}`}>
      {ETAPES.map((x, i) => {
        const faite = i < rang;
        const actuelle = i === rang;
        return (
          <View key={x.id} style={[styles.segment, i === ETAPES.length - 1 && styles.terminus]}>
            <View
              style={[
                styles.escale,
                actuelle
                  ? { backgroundColor: theme[couleur], width: 26, height: 26, borderRadius: 13 }
                  : { backgroundColor: faite ? `${theme[couleur]}33` : 'rgba(255,255,255,0.06)' },
              ]}>
              <Icon name={x.id} size={actuelle ? 14 : 10} color={actuelle ? 'background' : faite ? couleur : 'textTertiary'} />
            </View>
            {i < ETAPES.length - 1 ? <View style={[styles.ligne, { backgroundColor: faite ? theme[couleur] : 'rgba(255,255,255,0.1)' }]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

function Champ({ icon, valeur, label }: { icon: NomIcone; valeur: string; label: string }) {
  return (
    <View style={styles.champ} accessibilityLabel={`${label} : ${valeur}`}>
      <Icon name={icon} size="sm" color="textSecondary" />
      <Txt style={{ fontWeight: '600', fontVariant: ['tabular-nums'] }}>{valeur}</Txt>
    </View>
  );
}

export function BoardingPass({ c, onPress }: { c: Contenu; onPress?: () => void }) {
  const e = etape(c);
  const vCouleur = couleurVerdict(c);

  const contenu = (
    <View style={styles.pass}>
      <View style={styles.codes}>
        <View style={styles.code}>
          <Num size={28}>{CODE_PLATEFORME[c.plateforme] ?? c.plateforme.slice(0, 2).toUpperCase()}</Num>
          <Txt variant="label">{c.plateforme}</Txt>
        </View>
        <Trajet c={c} />
        <View style={[styles.code, { alignItems: 'flex-end' }]}>
          <Num size={28}>{FORMATS[c.format].code}</Num>
          <Txt variant="label">{FORMATS[c.format].label}</Txt>
        </View>
      </View>

      <Txt variant="title" numberOfLines={2}>{c.titre}</Txt>

      <View style={styles.perfo}>
        <View style={[styles.encoche, { left: -Spacing.three - 10 }]} />
        <View style={{ flex: 1, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.14)' }} />
        <View style={[styles.encoche, { right: -Spacing.three - 10 }]} />
      </View>

      <View style={styles.champs}>
        <Status label={e.label} icon={c.statut === 'verdict' ? iconeVerdict(c) : e.id} color={c.statut === 'verdict' ? vCouleur : e.theme} />
        <View style={{ flexDirection: 'row', gap: Spacing.three, alignItems: 'center' }}>
          {c.verdict?.ratio ? (
            <Num size={20} color={vCouleur} accessibilityLabel={`${fois(c.verdict.ratio)} ta médiane`}>
              {fois(c.verdict.ratio)}
            </Num>
          ) : null}
          {c.publie ? (
            <Champ icon="publie" label="Publié" valeur={dateCourte(c.publie)} />
          ) : c.tournage ? (
            <Champ icon="tournage" label="Tournage" valeur={dateCourte(c.tournage)} />
          ) : (
            <Champ icon="date" label="Créé" valeur={dateCourte(c.cree)} />
          )}
          {c.brief ? <Champ icon="plans" label="Plans" valeur={`${c.plansFaits.length}/${c.brief.plans.length}`} /> : null}
        </View>
      </View>
    </View>
  );

  if (!onPress) return <Glass>{contenu}</Glass>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${c.titre}, ${e.label}`}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => (pressed ? { transform: [{ scale: 0.97 }] } : null)}>
      <Glass interactif>{contenu}</Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pass: { padding: Spacing.three, gap: Spacing.three },
  codes: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  code: { flexShrink: 0, minWidth: 52 },
  trajet: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 2 },
  segment: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  // La dernière escale garde sa taille naturelle (sans ligne après elle).
  terminus: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' },
  escale: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  ligne: { flex: 1, height: 2, minWidth: 4, marginHorizontal: 2, borderRadius: 1 },
  perfo: { flexDirection: 'row', alignItems: 'center', height: 20 },
  // Les encoches « percent » la carte : de la couleur du fond profond.
  encoche: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: '#07090C' },
  champs: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  champ: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
