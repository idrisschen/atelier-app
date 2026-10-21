import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Switch, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Button, Card, Chip, ErrorNote, Field, Groupe, Screen, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { OBJECTIFS, PLATEFORMES } from '@/lib/options';
import { demanderRappels } from '@/lib/rappels';
import { exporter, lireSauvegarde } from '@/lib/sauvegarde';
import { useStore } from '@/lib/store';
import type { Profile } from '@/lib/types';

export default function Reglages() {
  const theme = useTheme();
  const { state, update, reset } = useStore();
  const [p, setP] = useState<Profile>(state.profile!);
  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }));
  const [erreur, setErreur] = useState<string | null>(null);

  const basculerRappels = async (rappels: boolean) => {
    const ok = rappels ? await demanderRappels() : false;
    if (rappels && !ok) setErreur('Notifications refusées : active-les pour Rush dans les réglages de l’iPhone.');
    update((s) => ({ ...s, reglages: { ...s.reglages, rappels: ok } }));
  };

  const sauvegarder = () => {
    setErreur(null);
    exporter(state).catch((e) => {
      console.error('export', e);
      setErreur('Impossible de créer la sauvegarde.');
    });
  };

  const restaurer = async () => {
    setErreur(null);
    try {
      const data = await lireSauvegarde();
      if (!data) return;
      const go = () => {
        update((s) => ({ ...s, ...data }));
        router.back();
      };
      if (Platform.OS === 'web') return go();
      Alert.alert('Remplacer tes données ?', 'Tout ce qui est sur ce téléphone sera remplacé par la sauvegarde.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Remplacer', style: 'destructive', onPress: go },
      ]);
    } catch (e) {
      setErreur((e as Error).message);
    }
  };

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

      {Platform.OS !== 'web' ? (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
            <Icon name="heure" size="lg" color="golden" />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="heading">Rappels</Txt>
              <Txt variant="small" color="textSecondary">L’heure du verdict, tes sorties et la golden hour du soir, 30 minutes avant.</Txt>
            </View>
            <Switch
              accessibilityLabel="Rappels"
              value={!!state.reglages.rappels}
              onValueChange={basculerRappels}
              trackColor={{ true: theme.accent, false: theme.backgroundSelected }}
            />
          </View>
        </Card>
      ) : null}

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
          <Icon name="profil" size="lg" color="textSecondary" />
          <Txt variant="heading">Tes données</Txt>
        </View>
        <Txt variant="small" color="textSecondary">
          Tout reste sur ce téléphone : supprimer l&apos;app efface tout. Exporte une sauvegarde de temps en temps. Si tu actives la météo, ta position arrondie à ~10 km part vers Open-Meteo. Si l&apos;assistant IA est activé, ton profil (prénom, niche, audience, ton, règles) et ta demande partent vers Claude (Anthropic), le temps de la réponse.
        </Txt>
        <Button kind="secondary" icon="partager" label="Exporter une sauvegarde" onPress={sauvegarder} />
        <Button kind="secondary" icon="refaire" label="Importer une sauvegarde" onPress={restaurer} />
        <ErrorNote message={erreur} />
        <Button kind="danger" icon="supprimer" label="Tout effacer" onPress={effacer} />
      </Card>
    </Screen>
  );
}
