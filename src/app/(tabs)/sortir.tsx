// Sortir : ce qui fait la différence avec les coachs des plateformes, qui ne coachent que dans l'écran.
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { FriseLumiere } from '@/components/lumiere';
import { Button, Card, Check, Num, Screen, Section, Status, Txt, succes, tap } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { IDEES_SORTIE } from '@/lib/options';
import { lumieresDuJour } from '@/lib/soleil';
import { today, useStore } from '@/lib/store';
import type { Position, Sortie } from '@/lib/types';

const dateSortie = (s: Sortie) => {
  const [d, h] = s.quand.split('T');
  const [y, m, j] = d.split('-').map(Number);
  const [hh, mm] = h.split(':').map(Number);
  return new Date(y, m - 1, j, hh, mm);
};

// La sortie tombe-t-elle dans une golden hour ou une heure bleue ?
function lumiereSortie(s: Sortie, pos: Position | null) {
  if (!pos) return null;
  const t = dateSortie(s);
  return lumieresDuJour(t, pos.lat, pos.lon).find((l) => l.debut <= t && t < l.fin) ?? null;
}

export default function Sortir() {
  const { state, update } = useStore();
  const jour = today();
  const aVenir = state.sorties.filter((s) => !s.faite).sort((a, b) => a.quand.localeCompare(b.quand));
  const faites = state.sorties.filter((s) => s.faite).length;

  const basculer = (id: string) =>
    update((s) => ({ ...s, sorties: s.sorties.map((x) => (x.id === id ? { ...x, faite: !x.faite } : x)) }));

  return (
    <Screen title="Sortir" kicker="Créer dehors">
      <FriseLumiere />

      <Section titre={`Tes sorties${faites ? ` · ${faites} faite${faites > 1 ? 's' : ''}` : ''}`}>
        {aVenir.map((s) => {
          const t = dateSortie(s);
          const l = lumiereSortie(s, state.position);
          const lie = state.contenus.find((c) => c.id === s.contenuId);
          const passee = s.quand.slice(0, 10) < jour;
          return (
            <Card key={s.id}>
              <View style={styles.row}>
                <View style={{ alignItems: 'center', minWidth: 64 }}>
                  <Num size={28}>{t.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Num>
                  <Txt variant="label">{t.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}</Txt>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Txt variant="heading">{s.lieu}</Txt>
                  {s.note ? <Txt variant="small" color="textSecondary">{s.note}</Txt> : null}
                  {lie ? <Txt variant="small" color="accent" onPress={() => { tap(); router.push(`/contenu/${lie.id}`); }}>Brief · {lie.titre}</Txt> : null}
                  {l ? <Status label={l.type === 'golden' ? 'Golden hour' : 'Heure bleue'} color={l.type === 'golden' ? 'golden' : 'blue'} /> : null}
                  {passee ? <Status label="Date passée" color="danger" /> : null}
                </View>
              </View>
              <Check
                checked={false}
                label="J’y suis allé"
                onPress={() => {
                  succes();
                  basculer(s.id);
                }}
              />
            </Card>
          );
        })}
        <Button label="Planifier une sortie" onPress={() => router.push('/sortie/nouvelle')} />
      </Section>

      <Section titre="Idées de sortie">
        {IDEES_SORTIE.map((i) => (
          <Card key={i.titre} onPress={() => router.push({ pathname: '/sortie/nouvelle', params: { lieu: i.titre } })} label={`Planifier : ${i.titre}`}>
            <Txt variant="heading">{i.titre}</Txt>
            <Txt variant="small" color="textSecondary">{i.pourquoi}</Txt>
          </Card>
        ))}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
});
