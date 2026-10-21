import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ambient } from '@/components/ambient';
import { Glass } from '@/components/glass';
import { Icon, type NomIcone } from '@/components/icon';
import { Button, Chip, Field, Groupe, Txt } from '@/components/ui';
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
  const [quota, setQuota] = useState(3);
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
    update((s) => ({ ...s, profile: { ...p, prenom: p.prenom.trim(), niche: p.niche.trim() }, reglages: { ...s.reglages, quotaSemaine: quota } }));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Ambient />
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
              <Txt variant="label" color="accent">Rush</Txt>
              <Txt style={styles.hero}>Sors créer.{'\n'}On te dit la vérité après.</Txt>
              <View style={{ gap: Spacing.three }}>
                <Point icon="objectif" couleur="golden" titre="Un cap et un rythme" texte="Un objectif clair et ton quota de publications de la semaine." />
                <Point icon="questions" couleur="accent" titre="Ta mission du jour" texte="2 ou 3 stories qui font réagir, en 30 secondes chacune." />
                <Point icon="golden" couleur="golden" titre="Sortir et tourner" texte="La belle lumière près de toi, un brief prêt avant de filmer." />
                <Point icon="verdict" couleur="success" titre="Le verdict, franc" texte="À 48 h, comparé à ta médiane, défaut principal d’abord." />
              </View>
            </View>
          )}

          {etape === 1 && (
            <View style={{ gap: Spacing.four }}>
              <Txt variant="title">On commence par toi.</Txt>
              <Field label="Ton prénom" icon="profil" value={p.prenom} onChangeText={(prenom) => set({ prenom })} placeholder="Sam" autoFocus autoComplete="given-name" textContentType="givenName" returnKeyType="next" />
              <View style={{ gap: Spacing.two }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                  <Icon name="publie" size="sm" color="textSecondary" />
                  <Txt variant="label">Où tu postes</Txt>
                </View>
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
                icon="cible"
                value={p.niche}
                onChangeText={(niche) => set({ niche })}
                placeholder="Photo de rue en noir et blanc à Paris"
                hint="Une phrase précise vaut mieux qu'un mot : Rush s'en sert partout."
                multiline
              />
              <Field label="Qui te regarde (facultatif)" icon="abonnes" value={p.audience} onChangeText={(audience) => set({ audience })} placeholder="18-30 ans, passionnés de photo argentique" />
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
              <Groupe titre="Publications par semaine" icon="rythme">
                {[1, 2, 3, 4, 5, 7].map((n) => (
                  <Chip key={n} label={String(n)} selected={quota === n} onPress={() => setQuota(n)} />
                ))}
              </Groupe>
              <Field label="Ta façon de parler (facultatif)" icon="parole" value={p.ton} onChangeText={(ton) => set({ ton })} placeholder="Calme, respectueux, un peu d'humour sec" />
              <Field
                label="Ce que tu refuses (facultatif)"
                icon="interdit"
                value={p.regles}
                onChangeText={(regles) => set({ regles })}
                placeholder="Pas de sujets clivants, jamais de plan en voiture"
                hint="Tes règles permanentes : elles s'ajoutent à chaque brief."
                multiline
              />
            </View>
          )}

          <View style={{ flex: etape === 0 ? 0 : 1 }} />
          <View style={{ gap: Spacing.two }}>
            <Button icon={etape === ETAPES - 1 ? 'ok' : 'suite'} label={etape === 0 ? 'Commencer' : etape === ETAPES - 1 ? 'Ouvrir Rush' : 'Continuer'} onPress={suivant} disabled={!peutContinuer} />
            {etape > 0 && <Button kind="ghost" icon="retour" label="Retour" onPress={() => setEtape(etape - 1)} />}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Point({ icon, couleur, titre, texte }: { icon: NomIcone; couleur: 'accent' | 'golden' | 'success'; titre: string; texte: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: Spacing.three, alignItems: 'center' }}>
      <Glass radius={14} style={styles.num}>
        <Icon name={icon} size="lg" color={couleur} />
      </Glass>
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
  hero: { fontSize: 44, lineHeight: 46, fontWeight: '800', letterSpacing: -1.6 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  num: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
