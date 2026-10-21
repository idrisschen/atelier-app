// Bilan : le « Passport » du créateur. Une carte par thème, de très gros chiffres et une phrase qui les rend parlants.
// Chaque carte se partage en image : c'est une story prête à poster.
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Barre } from '@/components/barre';
import { CarteBilan, Libelle } from '@/components/carte-bilan';
import { Chip, IconButton, Num, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { bilan, JOURS_PAR_SEMAINE, PERIODES, pluriel, type Periode } from '@/lib/bilan';
import { today } from '@/lib/dates';
import { avancement, nombre } from '@/lib/objectif';
import { useStore } from '@/lib/store';
import { fois } from '@/lib/verdict';

const BLANC = '#FFFFFF';
const BLANC_DOUX = 'rgba(255,255,255,0.72)';
const ENCRE = '#1B1A3A';
const ENCRE_DOUCE = 'rgba(27,26,58,0.62)';

export default function Bilan() {
  const { state } = useStore();
  const [periode, setPeriode] = useState<Periode>('30');
  const jour = today();
  const b = bilan(state, periode, jour);
  const libellePeriode = PERIODES.find((p) => p.id === periode)!.label;
  const prenom = state.profile?.prenom ?? '';

  return (
    <Screen title="Bilan" right={<IconButton icon="profil" label="Profil et réglages" onPress={() => router.push('/reglages')} />}>
      <View style={styles.periodes}>
        {PERIODES.map((p) => (
          <Chip key={p.id} label={p.label} selected={periode === p.id} onPress={() => setPeriode(p.id)} />
        ))}
      </View>

      <CarteBilan de="#16124A" vers="#1D4AA8" nom="atelier-bilan" lien={{ label: 'Mes contenus', onPress: () => router.push('/contenus') }}>
        <View style={styles.entete}>
          <Text style={styles.titreCarte}>Bilan de créateur</Text>
          <Libelle color={BLANC_DOUX}>{[prenom, libellePeriode].filter(Boolean).join(' · ')}</Libelle>
        </View>
        <View style={styles.grille}>
          <Bloc label="Stories" valeur={nombre(b.missions)} detail={`${pluriel(b.joursActifs, 'jour')} actif${b.joursActifs > 1 ? 's' : ''} sur ${b.nbJours}`} grand />
          <Bloc label="Publiés" valeur={nombre(b.publies)} detail={`${b.parSemaine.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} par semaine · visé ${state.reglages.quotaSemaine}`} grand />
        </View>
        <View style={styles.grille}>
          <Bloc label="Sondages" valeur={nombre(b.sondages)} detail={b.missions ? `${Math.round((b.sondages / b.missions) * 100)} % des stories` : undefined} />
          <Bloc label="Sorties" valeur={nombre(b.sorties)} detail={b.sorties ? `${b.sortiesPourContenu} pour un contenu` : undefined} />
        </View>
      </CarteBilan>

      <CarteBilan de="#B23A1E" vers="#5A1410" nom="atelier-serie" lien={{ label: 'Stories du jour', onPress: () => router.navigate('/') }}>
        <Num size={84} color="text">{b.serie}</Num>
        <Text style={styles.phrase}>{b.serie > 1 ? 'semaines d’affilée tenues' : 'semaine d’affilée tenue'}</Text>
        <Text style={[styles.detail, { color: '#FFB4A2' }]}>
          Cette semaine : {Math.min(b.joursCetteSemaine, 7)}/{JOURS_PAR_SEMAINE} jours avec une story.{' '}
          {b.joursCetteSemaine >= JOURS_PAR_SEMAINE ? 'Semaine tenue : le reste, ce sont des jours off.' : 'Les autres jours sont des jours off, pas des ratés.'}
          {b.record > b.serie ? ` Ton record : ${pluriel(b.record, 'semaine')}.` : ''}
        </Text>
      </CarteBilan>

      <Objectif />

      <CarteBilan de="#F1EEFF" vers="#C9C3F2" encre={ENCRE} nom="atelier-meilleur" lien={{ label: 'Tous les verdicts', onPress: () => router.push('/contenus') }}>
        <Text style={[styles.phrase, { color: ENCRE, paddingRight: 48 }]}>Ton meilleur contenu</Text>
        {b.meilleur ? (
          <>
            <Text style={[styles.titreContenu, { color: ENCRE }]} numberOfLines={3}>{b.meilleur.titre}</Text>
            <Text style={[styles.detail, { color: ENCRE_DOUCE }]}>
              {fois(b.meilleur.verdict!.ratio!)} ta médiane · {pluriel(b.meilleur.stats!.vues, 'vue')} · {b.meilleur.plateforme}
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.titreContenu, { color: ENCRE_DOUCE }]}>Pas encore de verdict</Text>
            <Text style={[styles.detail, { color: ENCRE_DOUCE }]}>48 h après une publication, note ses chiffres : le meilleur s’affiche ici.</Text>
          </>
        )}
      </CarteBilan>
    </Screen>
  );
}

function Objectif() {
  const { state } = useStore();
  const o = state.objectif;
  if (!o) {
    return (
      <CarteBilan de="#7A4A08" vers="#3A2205" nom="atelier-objectif" lien={{ label: 'Fixer mon objectif', onPress: () => router.push('/objectif') }}>
        <Text style={[styles.phrase, { paddingRight: 48 }]}>Un seul chiffre à faire monter</Text>
        <Text style={[styles.detail, { color: '#F8D79B' }]}>Tes abonnés aujourd’hui, ta cible, une échéance : l’Atelier te dit le rythme à tenir.</Text>
      </CarteBilan>
    );
  }
  const a = avancement(o);
  return (
    <CarteBilan de="#8A5A0B" vers="#3A2205" nom="atelier-objectif" lien={{ label: 'Mon objectif', onPress: () => router.push('/objectif') }}>
      <Libelle color="#F8D79B">Objectif · {o.plateforme}</Libelle>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two, flexWrap: 'wrap' }}>
        <Num size={56}>{nombre(a.actuel)}</Num>
        <Num size={22} style={{ color: '#F8D79B' }}>/ {nombre(o.cible)}</Num>
      </View>
      <Barre pct={a.pct} couleur="golden" />
      <Text style={[styles.detail, { color: '#F8D79B' }]}>
        {a.atteint
          ? 'Objectif atteint. Fixe le suivant.'
          : `${Math.round(a.pct * 100)} % du chemin · +${nombre(a.parSemaine)} par semaine pour y être dans ${pluriel(a.joursRestants, 'jour')}`}
      </Text>
    </CarteBilan>
  );
}

function Bloc({ label, valeur, detail, grand }: { label: string; valeur: string; detail?: string; grand?: boolean }) {
  return (
    <View style={{ flex: 1, gap: 2 }} accessible accessibilityLabel={`${label} : ${valeur}${detail ? `, ${detail}` : ''}`}>
      <Libelle color={BLANC_DOUX}>{label}</Libelle>
      <Num size={grand ? 52 : 34} color="text">{valeur}</Num>
      {detail ? <Text style={[styles.detail, { color: BLANC_DOUX }]}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  periodes: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  entete: { gap: Spacing.one, paddingRight: 48 },
  titreCarte: { color: BLANC, fontSize: 24, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase' },
  grille: { flexDirection: 'row', gap: Spacing.three },
  phrase: { color: BLANC, fontSize: 22, lineHeight: 27, fontWeight: '700', letterSpacing: -0.3 },
  titreContenu: { fontSize: 30, lineHeight: 34, fontWeight: '700', letterSpacing: -0.8 },
  detail: { fontSize: 15, lineHeight: 20, fontWeight: '500' },
});
