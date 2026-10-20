import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, Switch, View } from 'react-native';

import { Button, Card, Chip, Field, Screen, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { OBJECTIFS, PLATEFORMES } from '@/lib/options';
import { useStore } from '@/lib/store';
import type { Profile } from '@/lib/types';

export default function Reglages() {
  const theme = useTheme();
  const { state, update, reset } = useStore();
  const [p, setP] = useState<Profile>(state.profile!);
  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }));

  const enregistrer = () => {
    update((s) => ({ ...s, profile: p }));
    router.back();
  };

  const effacer = () => {
    const go = () => reset();
    if (Platform.OS === 'web') return go();
    Alert.alert('Tout effacer ?', 'Ton profil, tes stories, tes contenus, tes sorties et ton objectif seront supprimés de ce téléphone.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Effacer', style: 'destructive', onPress: go },
    ]);
  };

  return (
    <Screen title="Ton profil" kicker="Réglages">
      <Card>
        <Field label="Prénom" value={p.prenom} onChangeText={(prenom) => set({ prenom })} />
        <Txt variant="label">Plateformes</Txt>
        <View style={styles.wrap}>
          {PLATEFORMES.map((x) => (
            <Chip
              key={x}
              label={x}
              selected={p.plateformes.includes(x)}
              onPress={() => set({ plateformes: p.plateformes.includes(x) ? p.plateformes.filter((y) => y !== x) : [...p.plateformes, x] })}
            />
          ))}
        </View>
        <Field label="Niche" value={p.niche} onChangeText={(niche) => set({ niche })} multiline />
        <Field label="Audience" value={p.audience} onChangeText={(audience) => set({ audience })} />
        <Txt variant="label">Objectif</Txt>
        <View style={styles.wrap}>
          {OBJECTIFS.map((x) => (
            <Chip key={x} label={x} selected={p.objectif === x} onPress={() => set({ objectif: x })} />
          ))}
        </View>
        <Field label="Ta façon de parler" value={p.ton} onChangeText={(ton) => set({ ton })} />
        <Field label="Ce que tu refuses" value={p.regles} onChangeText={(regles) => set({ regles })} multiline />
        <Button label="Enregistrer" onPress={enregistrer} disabled={!p.prenom.trim() || p.plateformes.length === 0 || !p.niche.trim()} />
        <Button kind="ghost" label="Fermer" onPress={() => router.back()} />
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt variant="heading">Assistant IA</Txt>
            <Txt variant="small" color="textSecondary">Option. Les stories et les briefs sont alors rédigés par Claude à partir de ton profil. Sans elle, l&apos;Atelier marche avec ses propres règles.</Txt>
          </View>
          <Switch
            accessibilityLabel="Assistant IA"
            value={state.reglages.ia}
            onValueChange={(ia) => update((s) => ({ ...s, reglages: { ...s.reglages, ia } }))}
            trackColor={{ true: theme.accent, false: theme.backgroundSelected }}
          />
        </View>
      </Card>

      <Card>
        <Txt variant="heading">Tes données</Txt>
        <Txt variant="small" color="textSecondary">
          Tout reste sur ce téléphone. Si l&apos;assistant IA est activé, seul le texte de ta demande part vers l&apos;IA, le temps de la réponse.
        </Txt>
        <Button kind="danger" label="Tout effacer" onPress={effacer} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
