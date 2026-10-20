// « Golden hour dans 40 min » : prévenir avant qu'on en ait besoin, comme Flighty prévient d'un changement de porte.
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, ErrorNote, Num, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { lirePosition } from '@/lib/position';
import { duree, heure, lumieresDuJour, prochaineLumiere } from '@/lib/soleil';
import { useStore } from '@/lib/store';

function useMaintenant() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export function ActiverPosition() {
  const { update } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activer = async () => {
    setLoading(true);
    setError(null);
    try {
      const position = await lirePosition();
      update((s) => ({ ...s, position }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <Txt variant="label">Lumière</Txt>
      <Txt>Active ta position pour savoir quand la lumière est belle là où tu es. Elle ne quitte pas ton téléphone.</Txt>
      <Button kind="secondary" label="Activer" onPress={activer} loading={loading} />
      <ErrorNote message={error} />
    </Card>
  );
}

// Carte compacte : le prochain créneau et le temps qu'il reste.
export function ProchaineLumiere() {
  const { state } = useStore();
  const theme = useTheme();
  const t = useMaintenant();
  if (!state.position) return <ActiverPosition />;
  const l = prochaineLumiere(t, state.position.lat, state.position.lon);
  if (!l) return null;
  const couleur = l.type === 'golden' ? 'golden' : 'blue';
  return (
    <Card>
      <View style={styles.row}>
        <View style={[styles.pastille, { backgroundColor: theme[couleur] }]} />
        <Txt variant="label" style={{ flex: 1 }}>{l.nom}{state.position.ville ? ` · ${state.position.ville}` : ''}</Txt>
      </View>
      <View style={[styles.row, { alignItems: 'baseline' }]}>
        <Num size={40} color={couleur}>{l.enCours ? 'Maintenant' : duree(l.minutes)}</Num>
      </View>
      <Txt color="textSecondary">
        {l.enCours ? `Encore ${duree(l.minutes)}, jusqu’à ${heure(l.fin)}.` : `Commence dans ${duree(l.minutes)} · de ${heure(l.debut)} à ${heure(l.fin)}.`}
      </Txt>
    </Card>
  );
}

// Frise de la journée : les 4 créneaux, le prochain mis en avant.
export function FriseLumiere() {
  const { state } = useStore();
  const theme = useTheme();
  const t = useMaintenant();
  if (!state.position) return <ActiverPosition />;
  const creneaux = lumieresDuJour(t, state.position.lat, state.position.lon);
  const prochain = creneaux.find((c) => c.fin > t);
  return (
    <Card>
      <Txt variant="label">Lumière aujourd&apos;hui{state.position.ville ? ` · ${state.position.ville}` : ''}</Txt>
      {creneaux.map((c) => {
        const passe = c.fin <= t;
        const actif = c === prochain;
        return (
          <View key={c.nom} style={[styles.creneau, { opacity: passe ? 0.4 : 1 }]}>
            <View style={[styles.barre, { backgroundColor: theme[c.type === 'golden' ? 'golden' : 'blue'] }]} />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontWeight: actif ? '700' : '400' }}>{c.nom}</Txt>
              {actif ? <Txt variant="small" color="textSecondary">{c.debut <= t ? 'En cours' : `Dans ${duree(Math.round((c.debut.getTime() - t.getTime()) / 60_000))}`}</Txt> : null}
            </View>
            <Num size={18} color={passe ? 'textSecondary' : 'text'}>{heure(c.debut)}–{heure(c.fin)}</Num>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pastille: { width: 8, height: 8, borderRadius: 4 },
  creneau: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.one },
  barre: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
});
