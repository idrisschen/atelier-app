// Objectif : un chiffre à faire monter, le rythme qu'il faut tenir, et le quota de publications de la semaine.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Barre } from '@/components/barre';
import { Button, Card, Chip, ErrorNote, Field, Groupe, Num, Screen, Section, Txt } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { avancement, nombre } from '@/lib/objectif';
import { debutSemaine, jourIso, today, useStore } from '@/lib/store';

const DUREES = [
  { label: '1 mois', mois: 1 },
  { label: '3 mois', mois: 3 },
  { label: '6 mois', mois: 6 },
  { label: '1 an', mois: 12 },
];

const entier = (s: string) => {
  const n = parseInt(s.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : NaN;
};

export default function ObjectifScreen() {
  const { state } = useStore();
  const [edition, setEdition] = useState(false);
  return (
    <Screen title="Objectif" kicker="Ton cap">
      {!state.objectif || edition ? <Formulaire onDone={() => setEdition(false)} /> : <Suivi onChanger={() => setEdition(true)} />}
      <Rythme />
    </Screen>
  );
}

function Rythme() {
  const { state, update } = useStore();
  const lundi = debutSemaine(today());
  const publies = state.contenus.filter((c) => c.publie && c.publie >= lundi).length;
  const quota = state.reglages.quotaSemaine;
  return (
    <Section titre="Rythme de publication">
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two }}>
          <Num size={40} color={publies >= quota ? 'success' : 'text'}>{publies}</Num>
          <Txt color="textSecondary">sur {quota} cette semaine</Txt>
        </View>
        <Barre pct={publies / quota} couleur={publies >= quota ? 'success' : 'accent'} />
        <Groupe titre="Publications visées par semaine">
          {[1, 2, 3, 4, 5, 7].map((n) => (
            <Chip key={n} label={String(n)} selected={quota === n} onPress={() => update((s) => ({ ...s, reglages: { ...s.reglages, quotaSemaine: n } }))} />
          ))}
        </Groupe>
      </Card>
    </Section>
  );
}

function Formulaire({ onDone }: { onDone: () => void }) {
  const { state, update } = useStore();
  const plateformes = state.profile?.plateformes ?? [];
  const [plateforme, setPlateforme] = useState(state.objectif?.plateforme ?? plateformes[0] ?? '');
  const [actuel, setActuel] = useState('');
  const [cible, setCible] = useState(state.objectif ? String(state.objectif.cible) : '');
  const [mois, setMois] = useState(3);
  const [error, setError] = useState<string | null>(null);

  const valider = () => {
    const a = entier(actuel);
    const c = entier(cible);
    if (!Number.isFinite(a) || !Number.isFinite(c)) return setError('Entre des nombres.');
    if (c <= a) return setError('La cible doit dépasser ton nombre actuel.');
    const fin = new Date();
    fin.setMonth(fin.getMonth() + mois);
    update((s) => ({ ...s, objectif: { plateforme, cible: c, echeance: jourIso(fin), releves: [{ date: today(), valeur: a }] } }));
    onDone();
  };

  return (
    <Card>
      <Txt variant="heading">Un seul chiffre à faire monter.</Txt>
      <Groupe titre="Plateforme">
        {plateformes.map((p) => (
          <Chip key={p} label={p} selected={plateforme === p} onPress={() => setPlateforme(p)} />
        ))}
      </Groupe>
      <Field label="Abonnés aujourd'hui" value={actuel} onChangeText={setActuel} keyboardType="number-pad" placeholder="1 240" />
      <Field label="Objectif" value={cible} onChangeText={setCible} keyboardType="number-pad" placeholder="5 000" />
      <Groupe titre="En combien de temps">
        {DUREES.map((d) => (
          <Chip key={d.mois} label={d.label} selected={mois === d.mois} onPress={() => setMois(d.mois)} />
        ))}
      </Groupe>
      <Button label="Fixer mon objectif" onPress={valider} disabled={!actuel || !cible || !plateforme} />
      {state.objectif ? <Button kind="ghost" label="Annuler" onPress={onDone} /> : null}
      <ErrorNote message={error} />
    </Card>
  );
}

function Suivi({ onChanger }: { onChanger: () => void }) {
  const { state, update } = useStore();
  const theme = useTheme();
  const o = state.objectif!;
  const a = avancement(o);
  const [valeur, setValeur] = useState('');
  const [error, setError] = useState<string | null>(null);

  const noter = () => {
    const v = entier(valeur);
    if (!Number.isFinite(v)) return setError('Entre un nombre.');
    setError(null);
    const jour = today();
    update((s) => ({
      ...s,
      objectif: s.objectif && { ...s.objectif, releves: [...s.objectif.releves.filter((r) => r.date !== jour), { date: jour, valeur: v }] },
    }));
    setValeur('');
  };

  const derniers = a.releves.slice(-14);
  const max = Math.max(...derniers.map((r) => r.valeur), 1);
  const min = Math.min(...derniers.map((r) => r.valeur));
  const enAvance = a.rythme !== null && a.rythme >= a.parSemaine;

  return (
    <>
      <Card>
        <Txt variant="label">{o.plateforme} · abonnés</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two, flexWrap: 'wrap' }}>
          <Num size={56}>{nombre(a.actuel)}</Num>
          <Num size={22} color="textSecondary">/ {nombre(o.cible)}</Num>
        </View>
        <Barre pct={a.pct} couleur="golden" />
        <Txt variant="small" color="textSecondary">
          {a.atteint ? 'Objectif atteint. Fixe le suivant.' : `${nombre(a.restant)} à gagner · ${a.joursRestants} jours restants`}
        </Txt>
      </Card>

      {!a.atteint ? (
        <View style={styles.duo}>
          <Card style={{ flex: 1 }}>
            <Txt variant="label">Il te faut</Txt>
            <Num size={30}>+{nombre(a.parSemaine)}</Num>
            <Txt variant="small" color="textSecondary">par semaine</Txt>
          </Card>
          <Card style={{ flex: 1 }}>
            <Txt variant="label">Ton rythme</Txt>
            <Num size={30} color={a.rythme === null ? 'textSecondary' : enAvance ? 'success' : 'danger'}>
              {a.rythme === null ? '—' : `${a.rythme >= 0 ? '+' : ''}${nombre(a.rythme)}`}
            </Num>
            <Txt variant="small" color="textSecondary">{a.rythme === null ? 'après 7 jours de relevés' : enAvance ? 'en avance' : 'en retard'}</Txt>
          </Card>
        </View>
      ) : null}

      <Card>
        <Field label="Abonnés aujourd'hui" value={valeur} onChangeText={setValeur} keyboardType="number-pad" placeholder={String(a.actuel)} returnKeyType="done" onSubmitEditing={noter} />
        <Button label="Noter" kind="secondary" onPress={noter} disabled={!valeur} />
        <ErrorNote message={error} />
        {derniers.length > 1 ? (
          <View style={styles.chart} accessibilityLabel={`Évolution sur ${derniers.length} relevés`}>
            {derniers.map((r) => (
              <View
                key={r.date}
                style={{ flex: 1, borderRadius: Radius.small / 2, backgroundColor: r.date === today() ? theme.golden : theme.backgroundSelected, height: `${15 + (85 * (r.valeur - min)) / Math.max(1, max - min)}%` }}
              />
            ))}
          </View>
        ) : null}
      </Card>

      <Button kind="ghost" label="Changer d'objectif" onPress={onChanger} />
    </>
  );
}

const styles = StyleSheet.create({
  duo: { flexDirection: 'row', gap: Spacing.three },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 72, marginTop: Spacing.two },
});
