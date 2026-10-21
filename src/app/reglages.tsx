import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Switch, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Button, Card, Chip, Field, Groupe, Screen, Txt } from '@/components/ui';
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
    <Screen back title="Profil">
      <Card>
        <Field label="Prénom" icon="profil" value={p.prenom} onChangeText={(prenom) => set({ prenom })} />
        <Groupe titre="Plateformes" icon="publie">
          {PLATEFORMES.map((x) => (
            <Chip
              key={x}
              label={x}
              selected={p.plateformes.includes(x)}
              onPress={() => set({ plateformes: p.plateformes.includes(x) ? p.plateformes.filter((y) => y !== x) : [...p.plateformes, x] })}
            />
          ))}
        </Groupe>
        <Field label="Niche" icon="cible" value={p.niche} onChangeText={(niche) => set({ niche })} multiline />
        <Field label="Audience" icon="abonnes" value={p.audience} onChangeText={(audience) => set({ audience })} />
        <Groupe titre="Objectif" icon="objectif">
          {OBJECTIFS.map((x) => (
            <Chip key={x} label={x} selected={p.objectif === x} onPress={() => set({ objectif: x })} />
          ))}
        </Groupe>
        <Field label="Ta façon de parler" icon="parole" value={p.ton} onChangeText={(ton) => set({ ton })} />
        <Field label="Ce que tu refuses" icon="interdit" value={p.regles} onChangeText={(regles) => set({ regles })} multiline />
        <Button icon="ok" label="Enregistrer" onPress={enregistrer} disabled={!p.prenom.trim() || p.plateformes.length === 0 || !p.niche.trim()} />
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
          <Icon name="ia" size="lg" color="accent" />
          <View style={{ flex: 1, gap: 2 }}>
            <Txt variant="heading">Assistant IA</Txt>
            <Txt variant="small" color="textSecondary">Option. Les stories et les briefs sont alors rédigés par Claude à partir de ton profil. Sans elle, Rush marche avec ses propres règles.</Txt>
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
          <Icon name="profil" size="lg" color="textSecondary" />
          <Txt variant="heading">Tes données</Txt>
        </View>
        <Txt variant="small" color="textSecondary">
          Tout reste sur ce téléphone. Si l&apos;assistant IA est activé, seul le texte de ta demande part vers l&apos;IA, le temps de la réponse.
        </Txt>
        <Button kind="danger" icon="supprimer" label="Tout effacer" onPress={effacer} />
      </Card>
    </Screen>
  );
}
