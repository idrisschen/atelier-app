// Un contenu, du brief au verdict. Chaque étape débloque la suivante, comme un vol : on sait toujours où on en est.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { BoardingPass, couleurVerdict } from '@/components/boarding-pass';
import { Button, Card, Check, Divider, ErrorNote, Field, Num, Screen, Section, Txt, succes, tap } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { askAtelier } from '@/lib/ai';
import { briefLocal, FORMATS } from '@/lib/brief';
import { ecartJours, today, useStore } from '@/lib/store';
import type { Brief, Contenu, Stats } from '@/lib/types';
import { calculeVerdict, fois } from '@/lib/verdict';

export default function ContenuScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, update } = useStore();
  const c = state.contenus.find((x) => x.id === id);

  if (!c) {
    return (
      <Screen back title="Introuvable">
        <Txt color="textSecondary">Ce contenu a été supprimé.</Txt>
        <Button kind="secondary" label="Retour" onPress={() => router.back()} />
      </Screen>
    );
  }

  const modifie = (patch: Partial<Contenu>) => update((s) => ({ ...s, contenus: s.contenus.map((x) => (x.id === c.id ? { ...x, ...patch } : x)) }));

  const supprimer = () => {
    const go = () => {
      update((s) => ({ ...s, contenus: s.contenus.filter((x) => x.id !== c.id) }));
      router.back();
    };
    if (Platform.OS === 'web') return go();
    Alert.alert('Supprimer ce contenu ?', 'Son brief et son verdict seront effacés.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: go },
    ]);
  };

  return (
    <Screen back title={FORMATS[c.format].label} kicker={c.plateforme}>
      <BoardingPass c={c} />
      {c.statut === 'idee' ? <PreparerBrief c={c} modifie={modifie} /> : null}
      {c.statut === 'verdict' && c.verdict ? <VerdictCard c={c} onModifier={() => modifie({ statut: 'publie' })} /> : null}
      {c.statut === 'publie' ? <SaisieStats c={c} modifie={modifie} /> : null}
      {c.brief && (c.statut === 'brief' || c.statut === 'tournage') ? (
        <>
          <PlansCard c={c} modifie={modifie} />
          <Button
            label="C’est publié"
            onPress={() => {
              succes();
              modifie({ statut: 'publie', publie: today() });
            }}
          />
          <BriefDetail brief={c.brief} />
        </>
      ) : null}
      {c.brief && (c.statut === 'publie' || c.statut === 'verdict') ? <BriefDetail brief={c.brief} replie /> : null}
      <Button kind="danger" label="Supprimer" onPress={supprimer} />
    </Screen>
  );
}

// ---------- idée → brief ----------

function PreparerBrief({ c, modifie }: { c: Contenu; modifie: (p: Partial<Contenu>) => void }) {
  const { state } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preparer = async () => {
    if (!state.profile) return;
    let brief: Brief;
    if (state.reglages.ia) {
      setLoading(true);
      setError(null);
      try {
        brief = (await askAtelier<Brief>('tournage', state.profile, { sujet: `${FORMATS[c.format].label} : ${c.titre}`, date: today() })).result;
      } catch (e) {
        return setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    } else {
      brief = briefLocal(c.format, state.profile);
    }
    modifie({ brief, statut: 'brief' });
  };
  return (
    <Card>
      <Txt variant="heading">Prépare le tournage</Txt>
      <Txt variant="small" color="textSecondary">Accroches à filmer, plans à ramener, phrases à dire, ce qu’il faut éviter.</Txt>
      <Button label="Préparer le brief" onPress={preparer} loading={loading} />
      <ErrorNote message={error} />
    </Card>
  );
}

// ---------- tournage : les plans à ramener, cochés sur place ----------

function PlansCard({ c, modifie }: { c: Contenu; modifie: (p: Partial<Contenu>) => void }) {
  const plans = c.brief!.plans;
  const basculer = (i: number) => {
    tap();
    const faits = c.plansFaits.includes(i) ? c.plansFaits.filter((x) => x !== i) : [...c.plansFaits, i];
    modifie({ plansFaits: faits, statut: faits.length > 0 ? 'tournage' : 'brief' });
  };
  return (
    <Section titre={`Plans à ramener · ${c.plansFaits.length}/${plans.length}`}>
      <Card>
        {plans.map((p, i) => (
          <Check key={i} checked={c.plansFaits.includes(i)} label={`${p.plan} — ${p.combien}`} onPress={() => basculer(i)} />
        ))}
      </Card>
    </Section>
  );
}

function BriefDetail({ brief, replie }: { brief: Brief; replie?: boolean }) {
  const theme = useTheme();
  const [ouvert, setOuvert] = useState(!replie);
  if (!ouvert) return <Button kind="secondary" label="Revoir le brief" onPress={() => setOuvert(true)} />;
  return (
    <>
      <Section titre="Objectif">
        <Txt>{brief.objectif}</Txt>
      </Section>
      <Section titre="3 accroches à filmer">
        {brief.accroches.map((a, i) => (
          <Card key={i}>
            <Txt variant="label" color="accent">Accroche {i + 1}</Txt>
            <Txt selectable variant="heading">« {a.phrase} »</Txt>
            <Txt variant="small" color="textSecondary">Image · {a.image}</Txt>
            {a.texte_ecran ? (
              <View style={[styles.ecran, { backgroundColor: theme.background }]}>
                <Txt selectable style={{ fontWeight: '900', letterSpacing: -0.3 }}>{a.texte_ecran}</Txt>
              </View>
            ) : null}
          </Card>
        ))}
      </Section>
      <Section titre="Phrases à dire">
        <Card>
          {brief.phrases.map((p, i) => (
            <Txt key={i} selectable>« {p} »</Txt>
          ))}
        </Card>
      </Section>
      <Section titre="À éviter">
        <Card>
          {brief.a_eviter.map((p, i) => (
            <Txt key={i} color="textSecondary">✕  {p}</Txt>
          ))}
        </Card>
      </Section>
    </>
  );
}

// ---------- publié → verdict ----------

const CHAMPS: { cle: keyof Stats; label: string; requis?: boolean }[] = [
  { cle: 'vues', label: 'Vues', requis: true },
  { cle: 'likes', label: 'J’aime' },
  { cle: 'commentaires', label: 'Commentaires' },
  { cle: 'partages', label: 'Partages' },
  { cle: 'enregistrements', label: 'Enregistrements' },
  { cle: 'abonnes', label: 'Abonnés gagnés' },
  { cle: 'zap', label: 'Zap à 3 s (%)' },
];

const nombre = (s: string) => {
  const n = parseFloat(s.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : NaN;
};

function SaisieStats({ c, modifie }: { c: Contenu; modifie: (p: Partial<Contenu>) => void }) {
  const { state } = useStore();
  const age = c.publie ? ecartJours(c.publie, today()) : 0;
  const [vals, setVals] = useState<Record<string, string>>(() =>
    Object.fromEntries(CHAMPS.map((f) => [f.cle, c.stats?.[f.cle] !== undefined ? String(c.stats[f.cle]) : ''])),
  );
  const [error, setError] = useState<string | null>(null);

  const rendre = () => {
    const stats = {} as Stats;
    for (const f of CHAMPS) {
      const brut = vals[f.cle].trim();
      if (!brut) {
        if (f.requis) return setError(`${f.label} : obligatoire.`);
        if (f.cle !== 'zap') stats[f.cle] = 0;
        continue;
      }
      const n = nombre(brut);
      if (Number.isNaN(n)) return setError(`${f.label} : entre un nombre.`);
      if (f.cle === 'zap' && n > 100) return setError('Le zap est un pourcentage, entre 0 et 100.');
      stats[f.cle] = n;
    }
    // Comparaison au créateur lui-même : ses contenus précédents sur la même plateforme.
    const precedents = state.contenus.filter((x) => x.id !== c.id && x.plateforme === c.plateforme && x.stats);
    succes();
    modifie({ stats, verdict: calculeVerdict(stats, precedents), statut: 'verdict' });
  };

  return (
    <Card>
      <Txt variant="heading">{age >= 2 ? 'L’heure du verdict' : `Verdict dans ${2 - age} jour${2 - age > 1 ? 's' : ''}`}</Txt>
      <Txt variant="small" color="textSecondary">
        {age >= 2
          ? 'Recopie les chiffres de l’app (statistiques du post). Le verdict compare ce contenu à ta médiane.'
          : 'Les chiffres se stabilisent à 48 h. Tu peux noter les premiers dès maintenant.'}
      </Txt>
      <View style={styles.grille}>
        {CHAMPS.map((f) => (
          <View key={f.cle} style={styles.cellule}>
            <Field label={f.label} value={vals[f.cle]} onChangeText={(v) => setVals((x) => ({ ...x, [f.cle]: v }))} keyboardType="decimal-pad" placeholder={f.requis ? '0' : '—'} />
          </View>
        ))}
      </View>
      <Button label="Rendre le verdict" onPress={rendre} disabled={!vals.vues.trim()} />
      <ErrorNote message={error} />
    </Card>
  );
}

function VerdictCard({ c, onModifier }: { c: Contenu; onModifier: () => void }) {
  const v = c.verdict!;
  const couleur = couleurVerdict(c);
  return (
    <Card>
      <Txt variant="label" color={couleur}>Verdict</Txt>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two }}>
        <Num size={56} color={couleur}>{v.ratio ? fois(v.ratio) : c.stats!.vues.toLocaleString('fr-FR')}</Num>
        <Txt color="textSecondary">{v.ratio ? 'ta médiane' : 'vues'}</Txt>
      </View>
      <Txt variant="heading">{v.titre}</Txt>
      <Divider />
      <Txt variant="label">Le défaut principal</Txt>
      <Txt>{v.defaut}</Txt>
      <Txt variant="label" style={{ marginTop: Spacing.two }}>Pour le prochain</Txt>
      {v.actions.map((a, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: Spacing.two }}>
          <Num size={16} color="accent">{i + 1}</Num>
          <Txt style={{ flex: 1 }}>{a}</Txt>
        </View>
      ))}
      <Button kind="ghost" label="Corriger les chiffres" onPress={onModifier} />
    </Card>
  );
}

const styles = StyleSheet.create({
  ecran: { borderRadius: Radius.small, padding: Spacing.two, alignSelf: 'flex-start' },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  cellule: { width: '46%', flexGrow: 1 },
});
