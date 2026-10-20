import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ObjectifResume } from '@/components/objectif-resume';
import { Button, Card, DemoBadge, ErrorNote, Field, Screen, Txt, tap } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { askAtelier } from '@/lib/ai';
import { STICKERS } from '@/lib/options';
import { today, useStore } from '@/lib/store';
import type { Mission, MissionsDuJour } from '@/lib/types';

const dateLongue = () => new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

export default function Aujourdhui() {
  const theme = useTheme();
  const { state, update } = useStore();
  const jour = today();
  const duJour = state.missions[jour];
  const [journee, setJournee] = useState(duJour?.journee ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [edition, setEdition] = useState(false);

  const generer = async () => {
    if (!state.profile) return;
    setLoading(true);
    setError(null);
    // Les 3 derniers jours, pour que l'IA propose les suites (résultat d'un sondage, etc.).
    const recent = Object.entries(state.missions)
      .filter(([d]) => d < jour)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 3)
      .map(([date, m]) => ({ date, missions: m.missions.map((x, i) => ({ titre: x.titre, sticker: x.sticker, faite: m.faites.includes(i) })) }));
    try {
      const { demo, result } = await askAtelier<{ missions: Mission[]; conseil: string }>('missions', state.profile, { date: jour, journee, recent });
      update((s) => ({ ...s, missions: { ...s.missions, [jour]: { ...result, faites: [], journee, demo } } }));
      setEdition(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const basculer = (i: number) => {
    tap();
    update((s) => {
      const m = s.missions[jour];
      const faites = m.faites.includes(i) ? m.faites.filter((x) => x !== i) : [...m.faites, i];
      return { ...s, missions: { ...s.missions, [jour]: { ...m, faites } } };
    });
  };

  return (
    <Screen
      title={`Salut ${state.profile?.prenom ?? ''}.`}
      kicker={dateLongue()}
      right={
        <Pressable accessibilityRole="button" accessibilityLabel="Réglages" hitSlop={12} onPress={() => router.push('/reglages')} style={[styles.icon, { borderColor: theme.border }]}>
          <SymbolView name={{ ios: 'person.crop.circle', android: 'person', web: 'person' }} tintColor={theme.text} size={22} />
        </Pressable>
      }>
      {!duJour || edition ? (
        <Card>
          <Txt variant="heading">Tes missions stories du jour</Txt>
          <Txt variant="small" color="textSecondary">
            Dis ce que tu fais aujourd&apos;hui : les missions collent à ta vraie journée.
          </Txt>
          <Field label="Aujourd'hui je…" value={journee} onChangeText={setJournee} placeholder="Je vais au marché de Saint-Pierre puis montage le soir" multiline />
          <Button label={duJour ? 'Refaire mes missions' : 'Mes missions du jour'} onPress={generer} loading={loading} />
          {duJour ? <Button kind="ghost" label="Annuler" onPress={() => setEdition(false)} /> : null}
          <ErrorNote message={error} />
        </Card>
      ) : (
        <Missions m={duJour} onToggle={basculer} onRefaire={() => setEdition(true)} />
      )}
      <ObjectifResume />
    </Screen>
  );
}

function Missions({ m, onToggle, onRefaire }: { m: MissionsDuJour; onToggle: (i: number) => void; onRefaire: () => void }) {
  const total = m.missions.length;
  const faites = m.faites.length;
  return (
    <View style={{ gap: Spacing.three }}>
      <View style={styles.row}>
        <Txt variant="heading" style={{ flex: 1 }}>
          {faites === total ? 'Tout est posté. Bien joué.' : `${faites} sur ${total} postée${faites > 1 ? 's' : ''}`}
        </Txt>
        {m.demo ? <DemoBadge /> : null}
      </View>
      {m.missions.map((mission, i) => (
        <MissionCard key={i} mission={mission} faite={m.faites.includes(i)} onToggle={() => onToggle(i)} />
      ))}
      {m.conseil ? (
        <Card>
          <Txt variant="overline">Conseil du jour</Txt>
          <Txt>{m.conseil}</Txt>
        </Card>
      ) : null}
      <Button kind="secondary" label="Refaire avec ma journée" onPress={onRefaire} />
    </View>
  );
}

function MissionCard({ mission, faite, onToggle }: { mission: Mission; faite: boolean; onToggle: () => void }) {
  const theme = useTheme();
  const s = mission.sticker;
  return (
    <Card style={faite ? { opacity: 0.55 } : undefined}>
      <Txt variant="overline" color="accent">{mission.moment}</Txt>
      <Txt variant="title">{mission.titre}</Txt>
      <Txt>{mission.quoi}</Txt>

      {mission.texte_ecran ? (
        <View style={[styles.ecran, { backgroundColor: theme.text }]}>
          <Txt variant="overline" style={{ color: theme.background, opacity: 0.6 }}>À l&apos;écran</Txt>
          <Txt selectable style={[styles.ecranTexte, { color: theme.background }]}>{mission.texte_ecran}</Txt>
        </View>
      ) : null}

      {s.type !== 'aucun' ? (
        <View style={[styles.sticker, { borderColor: theme.border, backgroundColor: theme.backgroundSelected }]}>
          <Txt variant="overline">{STICKERS[s.type] ?? s.type}</Txt>
          {s.question ? <Txt selectable style={{ fontWeight: '700' }}>{s.question}</Txt> : null}
          {s.reponses.length > 0 ? (
            <View style={styles.reponses}>
              {s.reponses.map((r, j) => (
                <View key={j} style={[styles.reponse, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                  <Txt variant="small" selectable style={{ fontWeight: '600' }}>{r}</Txt>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <Txt variant="small" color="textSecondary">
        <Txt variant="small" style={{ fontWeight: '700' }}>Pourquoi : </Txt>
        {mission.pourquoi}
      </Txt>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: faite }}
        onPress={onToggle}
        style={({ pressed }) => [styles.check, { borderColor: faite ? theme.success : theme.border, opacity: pressed ? 0.7 : 1 }]}>
        <View style={[styles.box, { borderColor: faite ? theme.success : theme.textSecondary, backgroundColor: faite ? theme.success : 'transparent' }]}>
          {faite ? <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor="#fff" size={14} /> : null}
        </View>
        <Txt style={{ fontWeight: '700' }}>{faite ? 'Posté' : "C'est posté"}</Txt>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  icon: { width: 44, height: 44, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  ecran: { borderRadius: Radius.medium, padding: Spacing.three, gap: Spacing.one, marginTop: Spacing.one },
  ecranTexte: { fontSize: 24, lineHeight: 26, fontWeight: '900', letterSpacing: -0.5, textTransform: 'uppercase' },
  sticker: { borderRadius: Radius.medium, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: Spacing.two },
  reponses: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  reponse: { borderRadius: Radius.pill, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  check: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: Spacing.three, minHeight: 48, marginTop: Spacing.one, alignSelf: 'flex-start' },
  box: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
