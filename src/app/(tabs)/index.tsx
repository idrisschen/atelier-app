// Aujourd'hui : le tableau des départs. Une information par carte, le détail au toucher.
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BoardingPass } from '@/components/boarding-pass';
import { ProchaineLumiere } from '@/components/lumiere';
import { Rings } from '@/components/rings';
import { Button, Card, Check, ErrorNote, Field, Num, Screen, Section, Status, Txt, succes, tap } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { askAtelier } from '@/lib/ai';
import { missionsLocales } from '@/lib/missions';
import { avancement } from '@/lib/objectif';
import { STICKERS } from '@/lib/options';
import { ajouteJours, debutSemaine, ecartJours, today, useStore } from '@/lib/store';
import type { AppState, Mission } from '@/lib/types';

const dateLongue = () => new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

export default function Aujourdhui() {
  const theme = useTheme();
  const { state } = useStore();
  const jour = today();

  const aRendre = state.contenus.filter((c) => c.statut === 'publie' && c.publie && ecartJours(c.publie, jour) >= 2);
  const prochain = state.contenus
    .filter((c) => c.statut === 'brief' || c.statut === 'tournage' || c.statut === 'idee')
    .sort((a, b) => (a.tournage ?? '9999').localeCompare(b.tournage ?? '9999'))[0];

  return (
    <Screen
      title={`Bonjour ${state.profile?.prenom ?? ''}`}
      kicker={dateLongue()}
      right={
        <Pressable accessibilityRole="button" accessibilityLabel="Réglages" hitSlop={12} onPress={() => router.push('/reglages')} style={[styles.icon, { backgroundColor: theme.backgroundElement }]}>
          <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} tintColor={theme.textSecondary} size={18} />
        </Pressable>
      }>
      <Semaine state={state} jour={jour} />

      {aRendre.map((c) => (
        <Card key={c.id} onPress={() => router.push(`/contenu/${c.id}`)} label={`Verdict à rendre : ${c.titre}`}>
          <Status label="Verdict à rendre" color="warning" />
          <Txt variant="heading">{c.titre}</Txt>
          <Txt variant="small" color="textSecondary">Publié il y a {ecartJours(c.publie!, jour)} jours. Note ses chiffres, l’Atelier te dit la vérité.</Txt>
        </Card>
      ))}

      <ProchaineLumiere />

      <Missions />

      <Section titre="Prochain départ" action={<Lien label="Tout voir" onPress={() => router.navigate('/creer')} />}>
        {prochain ? (
          <BoardingPass c={prochain} onPress={() => router.push(`/contenu/${prochain.id}`)} />
        ) : (
          <Card onPress={() => router.push('/contenu/nouveau')} label="Nouvelle idée">
            <Txt variant="heading">Aucun contenu en préparation</Txt>
            <Txt variant="small" color="textSecondary">Note une idée : l’Atelier prépare le brief de tournage.</Txt>
          </Card>
        )}
      </Section>
    </Screen>
  );
}

function Lien({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" hitSlop={10} onPress={() => { tap(); onPress(); }}>
      <Txt variant="small" color="accent" style={{ fontWeight: '600' }}>{label}</Txt>
    </Pressable>
  );
}

// ---------- la semaine en anneaux ----------

function Semaine({ state, jour }: { state: AppState; jour: string }) {
  const theme = useTheme();
  const lundi = debutSemaine(jour);
  const publies = state.contenus.filter((c) => c.publie && c.publie >= lundi).length;
  const quota = state.reglages.quotaSemaine;
  const m = state.missions[jour];
  const obj = state.objectif ? avancement(state.objectif) : null;

  const lignes = [
    { label: 'Publications', valeur: `${publies}/${quota}`, couleur: theme.success, v: publies / quota },
    { label: 'Stories du jour', valeur: m ? `${m.faites.length}/${m.missions.length}` : '—', couleur: theme.accent, v: m ? m.faites.length / Math.max(1, m.missions.length) : 0 },
    { label: 'Objectif', valeur: obj ? `${Math.round(obj.pct * 100)} %` : '—', couleur: theme.golden, v: obj?.pct ?? 0 },
  ];

  return (
    <Card onPress={() => router.navigate('/objectif')} label="Ta semaine" style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.four }}>
      <Rings anneaux={lignes.map((l) => ({ valeur: l.v, couleur: l.couleur }))} />
      <View style={{ flex: 1, gap: Spacing.two }}>
        {lignes.map((l) => (
          <View key={l.label}>
            <Txt variant="label" style={{ color: l.couleur }}>{l.label}</Txt>
            <Num size={24}>{l.valeur}</Num>
          </View>
        ))}
      </View>
    </Card>
  );
}

// ---------- missions stories ----------

function Missions() {
  const { state, update } = useStore();
  const jour = today();
  const duJour = state.missions[jour];
  const [journee, setJournee] = useState(duJour?.journee ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [edition, setEdition] = useState(false);
  const [ouverte, setOuverte] = useState<number | null>(null);

  const generer = async () => {
    if (!state.profile) return;
    setError(null);
    if (!state.reglages.ia) {
      const m = missionsLocales(state, jour, journee.trim());
      update((s) => ({ ...s, missions: { ...s.missions, [jour]: m } }));
      setEdition(false);
      return;
    }
    setLoading(true);
    const recent = [1, 2, 3]
      .map((n) => ajouteJours(jour, -n))
      .filter((d) => state.missions[d])
      .map((date) => ({ date, missions: state.missions[date].missions.map((x, i) => ({ titre: x.titre, sticker: x.sticker, faite: state.missions[date].faites.includes(i) })) }));
    try {
      const { demo, result } = await askAtelier<{ missions: Mission[]; conseil: string }>('missions', state.profile, { date: jour, journee, recent });
      update((s) => ({ ...s, missions: { ...s.missions, [jour]: { ...result, faites: [], journee, source: 'ia', demo } } }));
      setEdition(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const basculer = (i: number) => {
    const faite = duJour.faites.includes(i);
    if (faite) tap();
    else succes();
    update((s) => {
      const m = s.missions[jour];
      return { ...s, missions: { ...s.missions, [jour]: { ...m, faites: faite ? m.faites.filter((x) => x !== i) : [...m.faites, i] } } };
    });
  };

  if (!duJour || edition) {
    return (
      <Section titre="Stories du jour">
        <Card>
          <Txt variant="heading">2 ou 3 stories qui font réagir</Txt>
          <Field label="Aujourd'hui je… (facultatif)" value={journee} onChangeText={setJournee} placeholder="Marché le matin, montage le soir" />
          <Button label={duJour ? 'Refaire mes stories' : 'Mes stories du jour'} onPress={generer} loading={loading} />
          {duJour ? <Button kind="ghost" label="Annuler" onPress={() => setEdition(false)} /> : null}
          <ErrorNote message={error} />
        </Card>
      </Section>
    );
  }

  return (
    <Section titre={`Stories du jour · ${duJour.faites.length}/${duJour.missions.length}`} action={<Lien label="Refaire" onPress={() => setEdition(true)} />}>
      {duJour.missions.map((m, i) => (
        <MissionCard key={i} m={m} faite={duJour.faites.includes(i)} ouverte={ouverte === i} onOpen={() => setOuverte(ouverte === i ? null : i)} onToggle={() => basculer(i)} />
      ))}
      {duJour.conseil ? <Txt variant="small" color="textSecondary">{duJour.conseil}</Txt> : null}
    </Section>
  );
}

function MissionCard({ m, faite, ouverte, onOpen, onToggle }: { m: Mission; faite: boolean; ouverte: boolean; onOpen: () => void; onToggle: () => void }) {
  const theme = useTheme();
  const s = m.sticker;
  return (
    <Card onPress={onOpen} label={`${m.titre}, ${m.moment}`} style={faite ? { opacity: 0.6 } : undefined}>
      <View style={styles.row}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="label" color={faite ? 'success' : 'accent'}>{faite ? 'Postée' : m.moment}</Txt>
          <Txt variant="heading">{m.titre}</Txt>
        </View>
        <Txt variant="small" color="textSecondary">{STICKERS[s.type] ?? s.type}</Txt>
      </View>
      {ouverte ? (
        <View style={{ gap: Spacing.three, marginTop: Spacing.one }}>
          <Txt color="textSecondary">{m.quoi}</Txt>
          <View style={[styles.story, { backgroundColor: theme.background, borderColor: theme.border }]}>
            {m.texte_ecran ? <Txt selectable style={styles.ecran}>{m.texte_ecran}</Txt> : null}
            {s.type !== 'aucun' ? (
              <View style={[styles.sticker, { backgroundColor: theme.text }]}>
                {s.question ? <Txt selectable style={{ color: theme.background, fontWeight: '700', textAlign: 'center' }}>{s.question}</Txt> : null}
                {s.reponses.map((r, j) => (
                  <View key={j} style={[styles.reponse, { backgroundColor: theme.backgroundSelected }]}>
                    <Txt selectable variant="small" style={{ fontWeight: '600', textAlign: 'center' }}>{r}</Txt>
                  </View>
                ))}
                {s.type === 'curseur' ? <Txt style={{ fontSize: 22, textAlign: 'center' }}>🔥━━━━━━━</Txt> : null}
              </View>
            ) : null}
          </View>
          <Txt variant="small" color="textSecondary">
            <Txt variant="small" style={{ fontWeight: '700' }}>Pourquoi · </Txt>
            {m.pourquoi}
          </Txt>
          <Check checked={faite} label={faite ? 'Postée' : 'C’est posté'} onPress={onToggle} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  story: { borderRadius: Radius.medium, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: Spacing.three, alignItems: 'center', minHeight: 160, justifyContent: 'center' },
  ecran: { fontSize: 24, lineHeight: 26, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
  sticker: { borderRadius: Radius.small, padding: Spacing.two, gap: Spacing.one, minWidth: 200 },
  reponse: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: Spacing.three },
});
