import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Barre } from '@/components/objectif-resume';
import { Button, Card, Chip, ErrorNote, Field, Screen, Txt } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { avancement, nombre } from '@/lib/objectif';
import { today, useStore } from '@/lib/store';

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
    <Screen title="Objectif" kicker="Ton fil rouge">
      {!state.objectif || edition ? <Formulaire onDone={() => setEdition(false)} /> : <Suivi onChanger={() => setEdition(true)} />}
    </Screen>
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
      update((s) => ({
        ...s,
        objectif: { plateforme, cible: c, echeance: fin.toISOString().slice(0, 10), releves: [{ date: today(), valeur: a }] },
      }));
      onDone();
    };

    return (
      <Card>
        <Txt variant="heading">Un seul chiffre à faire monter.</Txt>
        <View style={styles.wrap}>
          {plateformes.map((p) => (
            <Chip key={p} label={p} selected={plateforme === p} onPress={() => setPlateforme(p)} />
          ))}
        </View>
        <Field label="Abonnés aujourd'hui" value={actuel} onChangeText={setActuel} keyboardType="number-pad" placeholder="1 240" />
        <Field label="Objectif" value={cible} onChangeText={setCible} keyboardType="number-pad" placeholder="5 000" />
        <Txt variant="overline">En combien de temps</Txt>
        <View style={styles.wrap}>
          {DUREES.map((d) => (
            <Chip key={d.mois} label={d.label} selected={mois === d.mois} onPress={() => setMois(d.mois)} />
          ))}
        </View>
        <Button label="Fixer mon objectif" onPress={valider} disabled={!actuel || !cible || !plateforme} />
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

    return (
      <>
        <Card>
          <Txt variant="overline">{o.plateforme}</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two, flexWrap: 'wrap' }}>
            <Txt style={styles.big}>{nombre(a.actuel)}</Txt>
            <Txt variant="heading" color="textSecondary">/ {nombre(o.cible)}</Txt>
          </View>
          <Barre pct={a.pct} />
          <Txt variant="small" color="textSecondary">
            {a.atteint ? 'Objectif atteint. Fixe le suivant.' : `${nombre(a.restant)} à gagner · ${a.joursRestants} jours restants`}
          </Txt>
        </Card>

        {!a.atteint ? (
          <View style={styles.duo}>
            <Card style={{ flex: 1 }}>
              <Txt variant="overline">Il te faut</Txt>
              <Txt variant="title">+{nombre(a.parSemaine)}</Txt>
              <Txt variant="small" color="textSecondary">par semaine</Txt>
            </Card>
            <Card style={{ flex: 1 }}>
              <Txt variant="overline">Ton rythme</Txt>
              <Txt variant="title" color={a.rythme === null ? 'textSecondary' : a.rythme >= a.parSemaine ? 'success' : 'accent'}>
                {a.rythme === null ? '—' : `${a.rythme >= 0 ? '+' : ''}${nombre(a.rythme)}`}
              </Txt>
              <Txt variant="small" color="textSecondary">{a.rythme === null ? '7 jours de relevés' : 'sur 7 jours'}</Txt>
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
                  style={{ flex: 1, borderRadius: Radius.small, backgroundColor: r.date === today() ? theme.accent : theme.backgroundSelected, height: `${15 + (85 * (r.valeur - min)) / Math.max(1, max - min)}%` }}
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
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  big: { fontSize: 48, lineHeight: 52, fontWeight: '900', letterSpacing: -2 },
  duo: { flexDirection: 'row', gap: Spacing.three },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 72, marginTop: Spacing.two },
});
