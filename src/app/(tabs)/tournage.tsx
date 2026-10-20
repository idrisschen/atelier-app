import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, DemoBadge, Divider, ErrorNote, Field, Screen, Txt, tap } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { askAtelier } from '@/lib/ai';
import { newId, today, useStore } from '@/lib/store';
import type { Brief, Tournage } from '@/lib/types';

export default function TournageScreen() {
  const { state, update } = useStore();
  const [sujet, setSujet] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ouvert, setOuvert] = useState<string | null>(state.tournages[0]?.id ?? null);

  const preparer = async () => {
    if (!state.profile) return;
    setLoading(true);
    setError(null);
    try {
      const { demo, result } = await askAtelier<Brief>('tournage', state.profile, { sujet, date: today() });
      const t: Tournage = { id: newId(), date: today(), sujet: sujet.trim(), brief: result, demo };
      update((s) => ({ ...s, tournages: [t, ...s.tournages] }));
      setOuvert(t.id);
      setSujet('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Tournage" kicker="Avant de partir filmer">
      <Card>
        <Field
          label="Tu vas filmer quoi ?"
          value={sujet}
          onChangeText={setSujet}
          placeholder="Festival de tatouage samedi, stand de flocage avec mes potes"
          multiline
        />
        <Button label="Préparer mon tournage" onPress={preparer} loading={loading} disabled={sujet.trim().length < 5} />
        <ErrorNote message={error} />
      </Card>

      {state.tournages.map((t) => (
        <TournageCard key={t.id} t={t} ouvert={ouvert === t.id} onPress={() => setOuvert(ouvert === t.id ? null : t.id)} />
      ))}
    </Screen>
  );
}

function TournageCard({ t, ouvert, onPress }: { t: Tournage; ouvert: boolean; onPress: () => void }) {
  const b = t.brief;
  return (
    <Card>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: ouvert }} onPress={() => { tap(); onPress(); }} style={{ gap: Spacing.one }}>
        <View style={styles.row}>
          <Txt variant="overline" style={{ flex: 1 }}>{new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</Txt>
          {t.demo ? <DemoBadge /> : null}
        </View>
        <Txt variant="heading" numberOfLines={ouvert ? undefined : 2}>{t.sujet}</Txt>
      </Pressable>
      {ouvert ? (
        <View style={{ gap: Spacing.three, marginTop: Spacing.two }}>
          <Txt color="textSecondary">{b.objectif}</Txt>
          <Divider />
          <Section titre="3 accroches prêtes à filmer">
            {b.accroches.map((a, i) => (
              <Accroche key={i} n={i + 1} a={a} />
            ))}
          </Section>
          <Section titre="Plans à ramener">
            {b.plans.map((p, i) => (
              <View key={i} style={styles.row}>
                <Txt style={{ flex: 1 }}>{p.plan}</Txt>
                <Txt variant="small" style={{ fontWeight: '700' }}>{p.combien}</Txt>
              </View>
            ))}
          </Section>
          <Section titre="Phrases à dire">
            {b.phrases.map((p, i) => (
              <Txt key={i} selectable>« {p} »</Txt>
            ))}
          </Section>
          <Section titre="À éviter">
            {b.a_eviter.map((p, i) => (
              <Txt key={i} color="textSecondary">— {p}</Txt>
            ))}
          </Section>
        </View>
      ) : null}
    </Card>
  );
}

function Accroche({ n, a }: { n: number; a: Brief['accroches'][number] }) {
  const theme = useTheme();
  return (
    <View style={[styles.accroche, { borderColor: theme.border }]}>
      <Txt variant="overline" color="accent">Accroche {n}</Txt>
      <Txt selectable style={{ fontWeight: '700', fontSize: 18, lineHeight: 23 }}>« {a.phrase} »</Txt>
      <Txt variant="small" color="textSecondary">Image : {a.image}</Txt>
      {a.texte_ecran ? <Txt variant="small" color="textSecondary">À l&apos;écran : {a.texte_ecran}</Txt> : null}
    </View>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: Spacing.two }}>
      <Txt variant="overline">{titre}</Txt>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  accroche: { borderLeftWidth: 3, paddingLeft: Spacing.three, gap: Spacing.one, borderRadius: Radius.small },
});
