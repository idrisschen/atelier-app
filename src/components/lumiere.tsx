// « Golden hour dans 40 min » : prévenir avant qu'on en ait besoin, comme Flighty prévient d'un changement de porte.
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Button, Card, ErrorNote, Num, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { couverture, lireCiel, motCiel } from '@/lib/meteo';
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
      <View style={styles.row}>
        <Icon name="golden" size="xl" color="golden" />
        <Txt style={{ flex: 1 }}>Quand la lumière est belle, là où tu es.</Txt>
      </View>
      <Button kind="secondary" icon="lieu" label="Activer ma position" onPress={activer} loading={loading} />
      <ErrorNote message={error} />
    </Card>
  );
}

// Carte compacte : le prochain créneau et le temps qu'il reste.
export function ProchaineLumiere() {
  const { state } = useStore();
  const t = useMaintenant();
  // Sans position, rien sur l'accueil : la demande se fait dans Sortir (FriseLumiere).
  if (!state.position) return null;
  const l = prochaineLumiere(t, state.position.lat, state.position.lon);
  if (!l) return null;
  const couleur = l.type === 'golden' ? 'golden' : 'blue';
  return (
    <Card teinte={l.type === 'golden' ? 'rgba(245,158,11,0.07)' : 'rgba(99,102,241,0.08)'} label={`${l.nom} ${l.enCours ? 'en cours' : `dans ${duree(l.minutes)}`}`}>
      <View style={styles.row}>
        <Icon name={l.type === 'golden' ? 'golden' : 'bleue'} size="md" color={couleur} />
        <Txt variant="label" style={{ flex: 1 }}>{l.nom}{state.position.ville ? ` · ${state.position.ville}` : ''}</Txt>
      </View>
      <Num size={52} color={couleur}>{l.enCours ? 'Maintenant' : duree(l.minutes)}</Num>
      <View style={styles.row}>
        <Icon name="heure" size="sm" color="textSecondary" />
        <Num size={17} color="textSecondary">{heure(l.debut)} → {heure(l.fin)}</Num>
      </View>
    </Card>
  );
}

// Le ciel prévu, si le créateur a activé la météo. undefined tant qu'on ne sait pas.
function useCiel() {
  const { state } = useStore();
  const [ciel, setCiel] = useState<Record<string, number> | undefined>();
  const pos = state.reglages.meteo ? state.position : null;
  useEffect(() => {
    if (pos) lireCiel(pos).then(setCiel).catch((e) => console.error('météo', e));
  }, [pos]);
  // Météo coupée : on oublie le ciel déjà lu sans repasser par l'effet.
  return pos ? ciel : undefined;
}

// Frise de la journée : les 4 créneaux, le prochain mis en avant.
export function FriseLumiere() {
  const { state, update } = useStore();
  const theme = useTheme();
  const t = useMaintenant();
  const ciel = useCiel();
  if (!state.position) return <ActiverPosition />;
  const creneaux = lumieresDuJour(t, state.position.lat, state.position.lon);
  const prochain = creneaux.find((c) => c.fin > t);
  return (
    <Card>
      {creneaux.map((c) => {
        const passe = c.fin <= t;
        const actif = c === prochain;
        const couleur = c.type === 'golden' ? 'golden' : 'blue';
        const nuages = ciel ? couverture(ciel, c.debut) : undefined;
        const meteo = nuages !== undefined ? motCiel(nuages) : null;
        return (
          <View key={c.nom} style={[styles.creneau, { opacity: passe ? 0.35 : 1 }]} accessibilityLabel={`${c.nom} de ${heure(c.debut)} à ${heure(c.fin)}`}>
            <View style={[styles.rond, { backgroundColor: actif ? theme[couleur] : `${theme[couleur]}22` }]}>
              <Icon name={c.type === 'golden' ? 'golden' : 'bleue'} size="sm" color={actif ? 'background' : couleur} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt style={{ fontWeight: actif ? '700' : '500' }}>{c.nom.replace('Golden hour', 'Golden').replace('Heure bleue', 'Bleue')}</Txt>
              {actif ? <Txt variant="small" color={couleur}>{c.debut <= t ? 'En cours' : `Dans ${duree(Math.round((c.debut.getTime() - t.getTime()) / 60_000))}`}</Txt> : null}
            </View>
            {meteo && !passe ? (
              <View style={styles.row} accessibilityLabel={`${meteo.mot}, ${nuages} % de nuages`}>
                <Icon name={meteo.icon} size="sm" color="textSecondary" />
                <Txt variant="small" color="textSecondary">{meteo.mot}</Txt>
              </View>
            ) : null}
            <Num size={18} color={passe ? 'textSecondary' : 'text'}>{heure(c.debut)}</Num>
          </View>
        );
      })}
      <View style={[styles.row, { marginTop: Spacing.one }]}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="small">Météo</Txt>
          <Txt variant="label" style={{ letterSpacing: 0 }}>Ta position, arrondie à ~10 km, part vers Open-Meteo.</Txt>
        </View>
        <Switch
          accessibilityLabel="Météo"
          value={!!state.reglages.meteo}
          onValueChange={(meteo) => update((s) => ({ ...s, reglages: { ...s.reglages, meteo } }))}
          trackColor={{ true: theme.accent, false: theme.backgroundSelected }}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  creneau: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: 4 },
  rond: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
