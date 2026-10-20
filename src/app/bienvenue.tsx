import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, Field, Txt } from '@/components/ui';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PLATEFORMES, OBJECTIFS } from '@/lib/options';
import { useStore } from '@/lib/store';
import type { Profile } from '@/lib/types';

const ETAPES = 4;

export default function Bienvenue() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { update } = useStore();
  const [etape, setEtape] = useState(0);
  const [p, setP] = useState<Profile>({ prenom: '', plateformes: [], niche: '', audience: '', objectif: '', ton: '', regles: '' });
  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }));

  const peutContinuer = [
    true,
    p.prenom.trim().length > 0 && p.plateformes.length > 0,
    p.niche.trim().length > 2,
    p.objectif.trim().length > 0,
  ][etape];

  const suivant = () => {
    if (etape < ETAPES - 1) return setEtape(etape + 1);
    update((s) => ({ ...s, profile: { ...p, prenom: p.prenom.trim(), niche: p.niche.trim() } }));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + Spacing.four, paddingBottom: insets.bottom + Spacing.three, paddingHorizontal: Spacing.three, alignItems: 'center' }}>
        <View style={{ flex: 1, width: '100%', maxWidth: MaxContentWidth, gap: Spacing.four }}>
          <View style={styles.progress} accessibilityLabel={`Étape ${etape + 1} sur ${ETAPES}`}>
            {Array.from({ length: ETAPES }, (_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: i <= etape ? theme.accent : theme.border }]} />
            ))}
          </View>

          {etape === 0 && (
            <View style={{ gap: Spacing.four, flex: 1, justifyContent: 'center' }}>
              <Txt variant="overline" color="accent">Atelier</Txt>
              <Txt style={styles.hero}>Poste mieux.{'\n'}Pas plus.</Txt>
              <View style={{ gap: Spacing.three }}>
                <Point n="1" titre="Tes missions du jour" texte="2 ou 3 stories qui font réagir, faisables en 30 secondes." />
                <Point n="2" titre="Ton tournage préparé" texte="Accroches, plans à ramener, phrases à dire avant de partir filmer." />
                <Point n="3" titre="Ton accroche notée" texte="Tu sais si les gens vont zapper avant de poster." />
              </View>
            </View>
          )}

          {etape === 1 && (
            <View style={{ gap: Spacing.four }}>
              <Txt variant="title">On commence par toi.</Txt>
              <Field label="Ton prénom" value={p.prenom} onChangeText={(prenom) => set({ prenom })} placeholder="Sam" autoFocus autoComplete="given-name" textContentType="givenName" returnKeyType="next" />
              <View style={{ gap: Spacing.two }}>
                <Txt variant="overline">Où tu postes</Txt>
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
              </View>
            </View>
          )}

          {etape === 2 && (
            <View style={{ gap: Spacing.four }}>
              <Txt variant="title">Tu parles de quoi ?</Txt>
              <Field
                label="Ta niche"
                value={p.niche}
                onChangeText={(niche) => set({ niche })}
                placeholder="Photo de rue en noir et blanc à Paris"
                hint="Une phrase précise vaut mieux qu'un mot : l'IA s'en sert pour tout."
                multiline
              />
              <Field label="Qui te regarde (facultatif)" value={p.audience} onChangeText={(audience) => set({ audience })} placeholder="18-30 ans, passionnés de photo argentique" />
            </View>
          )}

          {etape === 3 && (
            <View style={{ gap: Spacing.four }}>
              <Txt variant="title">Ton objectif.</Txt>
              <View style={styles.wrap}>
                {OBJECTIFS.map((x) => (
                  <Chip key={x} label={x} selected={p.objectif === x} onPress={() => set({ objectif: x })} />
                ))}
              </View>
              <Field label="Ta façon de parler (facultatif)" value={p.ton} onChangeText={(ton) => set({ ton })} placeholder="Calme, respectueux, un peu d'humour sec" />
              <Field
                label="Ce que tu refuses (facultatif)"
                value={p.regles}
                onChangeText={(regles) => set({ regles })}
                placeholder="Pas de sujets clivants, jamais de plan en voiture"
                hint="Tes règles permanentes : l'IA ne les enfreindra jamais."
                multiline
              />
            </View>
          )}

          <View style={{ flex: etape === 0 ? 0 : 1 }} />
          <View style={{ gap: Spacing.two }}>
            <Button label={etape === 0 ? 'Commencer' : etape === ETAPES - 1 ? 'Ouvrir mon atelier' : 'Continuer'} onPress={suivant} disabled={!peutContinuer} />
            {etape > 0 && <Button kind="ghost" label="Retour" onPress={() => setEtape(etape - 1)} />}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Point({ n, titre, texte }: { n: string; titre: string; texte: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' }}>
      <View style={[styles.num, { borderColor: theme.text }]}>
        <Txt variant="small" style={{ fontWeight: '800' }}>{n}</Txt>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="heading">{titre}</Txt>
        <Txt variant="small" color="textSecondary">{texte}</Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', gap: Spacing.one },
  dot: { flex: 1, height: 3, borderRadius: Radius.pill },
  hero: { fontSize: 52, lineHeight: 52, fontWeight: '900', letterSpacing: -2 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  num: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
