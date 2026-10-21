// Sortir : ce qui fait la différence avec les coachs des plateformes, qui ne coachent que dans l'écran.
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { FriseLumiere } from '@/components/lumiere';
import { Icon } from '@/components/icon';
import { Button, Card, Check, IconButton, Num, Screen, Section, Status, Txt, succes, tap } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { IDEES_SORTIE } from '@/lib/options';
import { lumieresDuJour } from '@/lib/soleil';
import { today } from '@/lib/dates';
import { useStore } from '@/lib/store';
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
    <Screen title="Sortir" right={<IconButton icon="ajouter" label="Planifier une sortie" color="accent" onPress={() => router.push('/sortie/nouvelle')} />}>
      <Section titre="Lumière du jour" icon="golden">
        <FriseLumiere />
      </Section>

      <Section titre={`Sorties${faites ? ` · ${faites} faite${faites > 1 ? 's' : ''}` : ''}`} icon="lieu">
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
                  {lie ? (
                    <View style={styles.lien}>
                      <Icon name="brief" size="sm" color="accent" />
                      <Txt variant="small" color="accent" onPress={() => { tap(); router.push(`/contenu/${lie.id}`); }}>{lie.titre}</Txt>
                    </View>
                  ) : null}
                  {l ? <Status label={l.type === 'golden' ? 'Golden hour' : 'Heure bleue'} icon={l.type === 'golden' ? 'golden' : 'bleue'} color={l.type === 'golden' ? 'golden' : 'blue'} /> : null}
                  {passee ? <Status label="Date passée" icon="attention" color="danger" /> : null}
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
        {aVenir.length === 0 ? <Button kind="secondary" icon="ajouter" label="Planifier une sortie" onPress={() => router.push('/sortie/nouvelle')} /> : null}
      </Section>

      <Section titre="Idées de sortie" icon="idee">
        {IDEES_SORTIE.map((i) => (
          <Card key={i.titre} onPress={() => router.push({ pathname: '/sortie/nouvelle', params: { lieu: i.titre } })} label={`Planifier : ${i.titre}`}>
            <View style={styles.lien}>
              <Icon name="lieu" size="md" color="golden" />
              <Txt variant="heading" style={{ flex: 1 }}>{i.titre}</Txt>
              <Icon name="ajouter" size="sm" color="accent" />
            </View>
            <Txt variant="small" color="textSecondary">{i.pourquoi}</Txt>
          </Card>
        ))}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  lien: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
