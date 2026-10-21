// « Mes réseaux » : une carte par plateforme du profil (Instagram, TikTok, YouTube…), comme le « Mes abonnés »
// de l'accueil d'Erwin. Les abonnés se notent à la main ; le reste vient des contenus de l'Atelier.
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Card, Chip, IconButton, Num, Section, Txt, succes } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { dateCourte, today } from '@/lib/dates';
import { nombre } from '@/lib/objectif';
import { CODE_PLATEFORME, PLATEFORMES } from '@/lib/options';
import { noteAbonnes, reseau } from '@/lib/reseaux';
import { useStore } from '@/lib/store';
import { fois } from '@/lib/verdict';

export function MesReseaux() {
  const { state, update } = useStore();
  const plateformes = state.profile?.plateformes ?? [];
  const manquantes = PLATEFORMES.filter((p) => !plateformes.includes(p));
  const ajouter = (p: string) => update((s) => ({ ...s, profile: s.profile && { ...s.profile, plateformes: [...s.profile.plateformes, p] } }));

  return (
    <Section titre="Mes réseaux" icon="abonnes">
      {plateformes.map((p) => (
        <CarteReseau key={p} plateforme={p} />
      ))}
      {manquantes.length ? (
        <View style={styles.ajouts}>
          {manquantes.map((p) => (
            <Chip key={p} icon="ajouter" label={p} selected={false} onPress={() => ajouter(p)} />
          ))}
        </View>
      ) : null}
    </Section>
  );
}

function CarteReseau({ plateforme }: { plateforme: string }) {
  const theme = useTheme();
  const { state, update } = useStore();
  const jour = today();
  const r = reseau(state, plateforme, jour);
  const [valeur, setValeur] = useState('');

  const noter = () => {
    const n = parseInt(valeur.replace(/[^\d]/g, ''), 10);
    if (!Number.isFinite(n)) return;
    succes();
    update((s) => noteAbonnes(s, plateforme, n, jour));
    setValeur('');
  };

  const max = Math.max(...r.serie.map((x) => x.valeur), 1);
  const min = Math.min(...r.serie.map((x) => x.valeur));
  const v = r.dernierVerdict?.verdict;

  return (
    <Card>
      <View style={styles.entete}>
        <Num size={30}>{CODE_PLATEFORME[plateforme] ?? plateforme.slice(0, 2).toUpperCase()}</Num>
        <View style={{ flex: 1 }}>
          <Txt variant="heading">{plateforme}</Txt>
          <Txt variant="small" color="textSecondary">{r.releveLe ? `Relevé le ${dateCourte(r.releveLe)}` : 'Pas encore de relevé'}</Txt>
        </View>
      </View>

      <View style={styles.chiffres}>
        <View style={{ flex: 1 }}>
          <Txt variant="label">Abonnés</Txt>
          <Num size={40}>{r.abonnes === null ? '—' : nombre(r.abonnes)}</Num>
          <Txt variant="small" color={r.gain7 === null ? 'textSecondary' : r.gain7 >= 0 ? 'success' : 'danger'}>
            {r.gain7 === null ? 'Note-les 2 fois à 7 jours d’écart' : `${r.gain7 >= 0 ? '+' : ''}${nombre(r.gain7)} en 7 jours`}
          </Txt>
        </View>
        {r.serie.length > 1 ? (
          <View style={styles.courbe} accessibilityLabel={`Évolution sur ${r.serie.length} relevés`}>
            {r.serie.map((x) => (
              <View key={x.date} style={{ flex: 1, maxWidth: 10, borderRadius: 3, backgroundColor: x.date === jour ? theme.accent : theme.backgroundSelected, height: `${15 + (85 * (x.valeur - min)) / Math.max(1, max - min)}%` }} />
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.grille}>
        <Bloc label="Publiés" valeur={String(r.publiesSemaine)} detail="cette semaine" />
        <Bloc label="En préparation" valeur={String(r.enCours)} detail={r.enCours > 1 ? 'contenus' : 'contenu'} />
        <Bloc
          label="Verdict"
          valeur={v?.ratio ? fois(v.ratio) : r.dernierVerdict ? 'Repère' : '—'}
          detail={v?.ratio ? 'le dernier' : r.dernierVerdict ? 'premier repère' : 'aucun'}
          couleur={!v?.ratio ? 'textSecondary' : v.niveau === 'haut' ? 'success' : v.niveau === 'bas' ? 'danger' : 'text'}
        />
      </View>

      <View style={[styles.saisie, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
        <TextInput
          value={valeur}
          onChangeText={setValeur}
          onSubmitEditing={noter}
          keyboardType="number-pad"
          returnKeyType="done"
          placeholder={`Abonnés ${plateforme} aujourd’hui`}
          placeholderTextColor={theme.textTertiary}
          keyboardAppearance="dark"
          selectionColor={theme.accent}
          accessibilityLabel={`Abonnés ${plateforme} aujourd’hui`}
          style={[styles.champ, { color: theme.text }]}
        />
        <IconButton icon="ok" label={`Noter les abonnés ${plateforme}`} taille={36} color={valeur ? 'accent' : 'textSecondary'} onPress={noter} />
      </View>
    </Card>
  );
}

function Bloc({ label, valeur, detail, couleur = 'text' }: { label: string; valeur: string; detail: string; couleur?: 'text' | 'textSecondary' | 'success' | 'danger' }) {
  return (
    <View style={{ flex: 1, gap: 2 }} accessible accessibilityLabel={`${label} : ${valeur} ${detail}`}>
      <Txt variant="label" numberOfLines={1}>{label}</Txt>
      <Num size={24} color={couleur}>{valeur}</Num>
      <Txt variant="small" color="textSecondary" numberOfLines={1}>{detail}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  entete: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  chiffres: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.three },
  courbe: { width: 120, height: 56, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 4 },
  grille: { flexDirection: 'row', gap: Spacing.three },
  saisie: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderRadius: Radius.medium, paddingLeft: Spacing.three, paddingRight: 4, minHeight: 46 },
  champ: { flex: 1, fontSize: 16, paddingVertical: 10 },
  ajouts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
