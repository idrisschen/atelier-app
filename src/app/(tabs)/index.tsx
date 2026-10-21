// Aujourd'hui : le tableau des départs. Une information par carte, le détail au toucher.
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BoardingPass } from '@/components/boarding-pass';
import { Glass } from '@/components/glass';
import { Icon, type NomIcone } from '@/components/icon';
import { ProchaineLumiere } from '@/components/lumiere';
import { Rings } from '@/components/rings';
import { Button, Card, Check, ErrorNote, Field, IconButton, Num, Screen, Section, Status, Txt, succes, tap } from '@/components/ui';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { askAtelier } from '@/lib/ai';
import { ajouteJours, debutSemaine, ecartJours, today } from '@/lib/dates';
import { missionsLocales } from '@/lib/missions';
import { avancement } from '@/lib/objectif';
import { STICKERS } from '@/lib/options';
import { useStore } from '@/lib/store';
import type { AppState, Mission } from '@/lib/types';

const dateLongue = () => new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const MOMENT_ICONE: NomIcone[] = ['matin', 'midi', 'soir'];

export default function Aujourdhui() {
  const { state } = useStore();
  const jour = today();

  const aRendre = state.contenus.filter((c) => c.statut === 'publie' && c.publie && ecartJours(c.publie, jour) >= 2);
  const prochain = state.contenus
    .filter((c) => c.statut === 'brief' || c.statut === 'tournage' || c.statut === 'idee')
    .sort((a, b) => (a.tournage ?? '9999').localeCompare(b.tournage ?? '9999'))[0];

  return (
    <Screen title={state.profile?.prenom ?? 'Aujourd’hui'} right={<IconButton icon="profil" label="Profil et réglages" onPress={() => router.push('/reglages')} />}>
      <Txt variant="label" style={{ marginTop: -Spacing.three, textTransform: 'capitalize' }}>{dateLongue()}</Txt>

      <Semaine state={state} jour={jour} />

      {aRendre.map((c) => (
        <Card key={c.id} onPress={() => router.push(`/contenu/${c.id}`)} label={`Verdict à rendre : ${c.titre}`} teinte="rgba(251,191,36,0.08)">
          <View style={styles.row}>
            <Status label="Verdict à rendre" icon="verdict" color="warning" />
            <View style={{ flex: 1 }} />
            <Icon name="suite" size="sm" color="textSecondary" />
          </View>
          <Txt variant="heading">{c.titre}</Txt>
          <View style={styles.row}>
            <Icon name="publie" size="sm" color="textSecondary" />
            <Txt variant="small" color="textSecondary">il y a {ecartJours(c.publie!, jour)} jours</Txt>
          </View>
        </Card>
      ))}

      <ProchaineLumiere />

      <Missions />

      <Section titre="Prochain départ" icon="tournage" action={<IconButton icon="ajouter" label="Nouvelle idée" taille={36} onPress={() => router.push('/contenu/nouveau')} />}>
        {prochain ? (
          <BoardingPass c={prochain} onPress={() => router.push(`/contenu/${prochain.id}`)} />
        ) : (
          <Card onPress={() => router.push('/contenu/nouveau')} label="Nouvelle idée">
            <View style={styles.row}>
              <Icon name="idee" size="lg" color="warning" />
              <Txt variant="heading" style={{ flex: 1 }}>Une idée à tourner ?</Txt>
              <Icon name="ajouter" size="md" color="accent" />
            </View>
          </Card>
        )}
      </Section>
    </Screen>
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

  const lignes: { label: string; icon: NomIcone; couleur: ThemeColor; valeur: string; v: number }[] = [
    { label: 'Publications de la semaine', icon: 'publie', couleur: 'success', valeur: `${publies}/${quota}`, v: publies / quota },
    { label: 'Stories du jour', icon: 'questions', couleur: 'accent', valeur: m ? `${m.faites.length}/${m.missions.length}` : '–', v: m ? m.faites.length / Math.max(1, m.missions.length) : 0 },
    { label: 'Objectif', icon: 'objectif', couleur: 'golden', valeur: obj ? `${Math.round(obj.pct * 100)}%` : '–', v: obj?.pct ?? 0 },
  ];

  return (
    <Card onPress={() => router.navigate('/objectif')} label="Ta semaine" style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.four }}>
      <Rings anneaux={lignes.map((l) => ({ valeur: l.v, couleur: theme[l.couleur] }))} taille={124} epaisseur={13} />
      <View style={{ flex: 1, gap: Spacing.three }}>
        {lignes.map((l) => (
          <View key={l.label} style={styles.row} accessibilityLabel={`${l.label} : ${l.valeur}`}>
            <Icon name={l.icon} size="md" color={l.couleur} />
            <Num size={26}>{l.valeur}</Num>
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
      update((s) => ({ ...s, missions: { ...s.missions, [jour]: missionsLocales(s, jour, journee.trim()) } }));
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
      <Section titre="Stories du jour" icon="questions">
        <Card>
          <Field label="Aujourd'hui je…" icon="date" value={journee} onChangeText={setJournee} placeholder="Marché le matin, montage le soir" />
          <Button icon={state.reglages.ia ? 'ia' : 'curseur'} label={duJour ? 'Refaire' : 'Mes stories du jour'} onPress={generer} loading={loading} />
          {duJour ? <Button kind="ghost" icon="fermer" label="Annuler" onPress={() => setEdition(false)} /> : null}
          <ErrorNote message={error} />
        </Card>
      </Section>
    );
  }

  return (
    <Section
      titre={`Stories · ${duJour.faites.length}/${duJour.missions.length}`}
      icon="questions"
      action={<IconButton icon="refaire" label="Refaire mes stories" taille={36} onPress={() => setEdition(true)} />}>
      {duJour.missions.map((m, i) => (
        <MissionCard key={i} m={m} rang={i} faite={duJour.faites.includes(i)} ouverte={ouverte === i} onOpen={() => setOuverte(ouverte === i ? null : i)} onToggle={() => basculer(i)} />
      ))}
    </Section>
  );
}

function MissionCard({ m, rang, faite, ouverte, onOpen, onToggle }: { m: Mission; rang: number; faite: boolean; ouverte: boolean; onOpen: () => void; onToggle: () => void }) {
  const theme = useTheme();
  const s = m.sticker;
  const stickerIcone = (s.type in STICKERS ? s.type : 'aucun') as NomIcone;
  return (
    <Card onPress={onOpen} label={`${m.titre}, ${m.moment}, ${STICKERS[s.type] ?? ''}`}>
      <View style={styles.row}>
        <View style={[styles.rond, { backgroundColor: faite ? `${theme.success}26` : 'rgba(255,255,255,0.06)' }]}>
          <Icon name={faite ? 'ok' : MOMENT_ICONE[rang] ?? 'midi'} size="md" color={faite ? 'success' : 'golden'} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="heading" style={faite ? { color: theme.textSecondary, textDecorationLine: 'line-through' } : null}>{m.titre}</Txt>
          <Txt variant="small" color="textSecondary">{m.moment}</Txt>
        </View>
        <View style={[styles.rond, { backgroundColor: 'rgba(91,140,255,0.14)' }]} accessibilityLabel={STICKERS[s.type]}>
          <Icon name={stickerIcone} size="md" color="accent" />
        </View>
      </View>
      {ouverte ? (
        <View style={{ gap: Spacing.three, marginTop: Spacing.two }}>
          <Txt color="textSecondary">{m.quoi}</Txt>
          <Glass radius={Radius.medium} style={styles.story}>
            {m.texte_ecran ? <Txt selectable style={styles.ecran}>{m.texte_ecran}</Txt> : null}
            {s.type !== 'aucun' ? (
              <View style={[styles.sticker, { backgroundColor: theme.text }]}>
                {s.question ? <Txt selectable style={{ color: theme.background, fontWeight: '700', textAlign: 'center' }}>{s.question}</Txt> : null}
                {s.reponses.map((r, j) => (
                  <View key={j} style={[styles.reponse, { backgroundColor: theme.backgroundSelected }]}>
                    <Txt selectable variant="small" style={{ fontWeight: '600', textAlign: 'center' }}>{r}</Txt>
                  </View>
                ))}
                {s.type === 'curseur' ? (
                  <View style={[styles.row, { justifyContent: 'center' }]}>
                    <Icon name="curseur" size="lg" color="danger" />
                    <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: theme.backgroundSelected }} />
                  </View>
                ) : null}
              </View>
            ) : null}
          </Glass>
          <View style={[styles.row, { alignItems: 'flex-start' }]}>
            <Icon name="cible" size="sm" color="accent" />
            <Txt variant="small" color="textSecondary" style={{ flex: 1 }}>{m.pourquoi}</Txt>
          </View>
          <Check checked={faite} label={faite ? 'Postée' : 'C’est posté'} onPress={onToggle} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  rond: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  story: { padding: Spacing.three, gap: Spacing.three, alignItems: 'center', minHeight: 170, justifyContent: 'center' },
  ecran: { fontSize: 24, lineHeight: 26, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
  sticker: { borderRadius: Radius.small, padding: Spacing.two, gap: Spacing.one, minWidth: 210 },
  reponse: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: Spacing.three },
});
