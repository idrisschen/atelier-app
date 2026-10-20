import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, DemoBadge, Divider, ErrorNote, Field, Screen, Txt } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { askAtelier } from '@/lib/ai';
import { newId, today, useStore } from '@/lib/store';
import type { Accroche, AnalyseAccroche } from '@/lib/types';

type Photo = { uri: string; base64: string; type: string };

export default function AccrocheScreen() {
  const theme = useTheme();
  const { state, update } = useStore();
  const [phrase, setPhrase] = useState('');
  const [texteEcran, setTexteEcran] = useState('');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const derniere = state.accroches[0];

  const choisir = async () => {
    // Le sélecteur système n'a pas besoin d'autorisation photo sur iOS 14+.
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, base64: true, allowsEditing: false });
    const a = r.assets?.[0];
    if (!r.canceled && a?.base64) setPhoto({ uri: a.uri, base64: a.base64, type: a.mimeType ?? 'image/jpeg' });
  };

  const analyser = async () => {
    if (!state.profile) return;
    setLoading(true);
    setError(null);
    try {
      const { demo, result } = await askAtelier<AnalyseAccroche>('accroche', state.profile, {
        phrase,
        texte_ecran: texteEcran,
        image: photo?.base64,
        image_type: photo?.type,
      });
      const a: Accroche = { id: newId(), date: today(), phrase: phrase.trim(), imageUri: photo?.uri, analyse: result, demo };
      update((s) => ({ ...s, accroches: [a, ...s.accroches] }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Accroche" kicker="Avant de poster">
      <Card>
        <Txt variant="small" color="textSecondary">
          Les 2 premières secondes décident de tout. Donne la première image et la première phrase de ta vidéo.
        </Txt>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={photo ? 'Changer la première image' : 'Ajouter la première image'}
          onPress={choisir}
          style={({ pressed }) => [styles.photo, { borderColor: theme.border, backgroundColor: theme.backgroundSelected, opacity: pressed ? 0.8 : 1 }]}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={{ alignItems: 'center', gap: Spacing.one, padding: Spacing.three }}>
              <Txt style={{ fontWeight: '700', textAlign: 'center' }}>Première image</Txt>
              <Txt variant="small" color="textSecondary" style={{ textAlign: 'center' }}>Une capture de la 1re seconde</Txt>
            </View>
          )}
        </Pressable>
        <Field label="Première phrase dite" value={phrase} onChangeText={setPhrase} placeholder="Personne ne sait que ça se fabrique ici." multiline />
        <Field label="Texte à l'écran" value={texteEcran} onChangeText={setTexteEcran} placeholder="À 200 M DE CHEZ TOI" />
        <Button label="Noter mon accroche" onPress={analyser} loading={loading} disabled={!phrase.trim() && !photo} />
        <ErrorNote message={error} />
      </Card>

      {derniere ? <Resultat a={derniere} /> : null}

      {state.accroches.length > 1 ? (
        <View style={{ gap: Spacing.two }}>
          <Txt variant="overline">Avant</Txt>
          {state.accroches.slice(1, 8).map((a) => (
            <View key={a.id} style={styles.histo}>
              <Note n={a.analyse.note} petit />
              <Txt numberOfLines={2} style={{ flex: 1 }}>{a.phrase || a.analyse.verdict}</Txt>
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

function Resultat({ a }: { a: Accroche }) {
  const r = a.analyse;
  return (
    <Card>
      <View style={styles.row}>
        <Note n={r.note} />
        <View style={{ flex: 1, gap: Spacing.one }}>
          <Txt variant="heading">{r.verdict}</Txt>
          {a.demo ? <DemoBadge /> : null}
        </View>
      </View>
      <Divider />
      <Bloc titre="Le défaut principal" texte={r.defaut_principal} fort />
      <Bloc titre="L'image" texte={r.image} />
      <Bloc titre="La phrase" texte={r.phrase} />
      <Bloc titre="Le texte à l'écran" texte={r.texte_ecran} />
      <Divider />
      <Txt variant="overline">À la place</Txt>
      {r.reecritures.map((x, i) => (
        <View key={i} style={{ gap: 2 }}>
          <Txt selectable style={{ fontWeight: '700' }}>« {x.phrase} »</Txt>
          <Txt variant="small" color="textSecondary">{x.image}</Txt>
        </View>
      ))}
    </Card>
  );
}

function Bloc({ titre, texte, fort }: { titre: string; texte: string; fort?: boolean }) {
  return (
    <View style={{ gap: 2 }}>
      <Txt variant="overline" color={fort ? 'accent' : undefined}>{titre}</Txt>
      <Txt style={fort ? { fontWeight: '600' } : undefined}>{texte}</Txt>
    </View>
  );
}

function Note({ n, petit }: { n: number; petit?: boolean }) {
  const theme = useTheme();
  const couleur = n >= 7 ? theme.success : n >= 5 ? theme.text : theme.accent;
  const taille = petit ? 40 : 72;
  return (
    <View
      accessibilityLabel={`Note ${n} sur 10`}
      style={{ width: taille, height: taille, borderRadius: taille / 2, borderWidth: petit ? 1.5 : 3, borderColor: couleur, alignItems: 'center', justifyContent: 'center' }}>
      <Txt style={{ color: couleur, fontSize: petit ? 16 : 30, fontWeight: '900', letterSpacing: -1 }}>{n}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  photo: { aspectRatio: 9 / 16, maxHeight: 280, alignSelf: 'center', width: 158, borderRadius: Radius.medium, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  histo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
});
