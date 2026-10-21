// Une carte du bilan, comme celles du Passport de Flighty : un dégradé par thème, de très gros chiffres,
// un bouton de partage qui en fait une image à poster en story, et un lien vers le détail.
// Seule la partie haute part dans l'image : ni le bouton de partage ni le lien n'y apparaissent.
import { useId, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type HostInstance } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Icon } from '@/components/icon';
import { ErrorNote, tap } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { partageImage } from '@/lib/partage';

export function CarteBilan({
  de,
  vers,
  encre = '#FFFFFF',
  nom,
  children,
  lien,
}: {
  de: string;
  vers: string;
  encre?: string; // couleur du texte : blanc sur les cartes sombres, foncé sur les claires
  nom: string; // nom du fichier image partagé
  children: ReactNode;
  lien?: { label: string; onPress: () => void };
}) {
  const capture = useRef<HostInstance>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  // Identifiant unique : un id SVG dupliqué entre cartes casse le dégradé.
  const id = `d${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const partager = async () => {
    setErreur(null);
    try {
      await partageImage(capture, nom);
    } catch (e) {
      console.error('partage de la carte', e);
      setErreur('Impossible de créer l’image. Réessaie.');
    }
  };

  return (
    <View style={[styles.carte, { backgroundColor: vers }]}>
      <View ref={capture} collapsable={false} style={styles.capture}>
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0.35" y2="1">
              <Stop offset="0" stopColor={de} />
              <Stop offset="1" stopColor={vers} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id})`} />
        </Svg>
        <View style={styles.contenu}>{children}</View>
      </View>
      <View style={styles.partage}>
        {/* Pas de verre ici : sur le web, le flou d'arrière-plan déborde en carré sur le dégradé. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Partager en image"
          hitSlop={8}
          onPress={() => {
            tap();
            partager();
          }}
          style={({ pressed }) => [styles.bouton, pressed && { opacity: 0.6 }]}>
          <Icon name="partager" size={18} color="text" />
        </Pressable>
      </View>
      {lien || erreur ? (
        <View style={styles.bas}>
          <ErrorNote message={erreur} />
          {lien ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={lien.label}
              onPress={() => {
                tap();
                lien.onPress();
              }}
              style={({ pressed }) => [styles.lien, { borderColor: `${encre}33`, backgroundColor: `${encre}14` }, pressed && { opacity: 0.7 }]}>
              <Text style={[styles.lienTexte, { color: encre }]}>{lien.label}</Text>
              <Icon name="suite" size="md" color={encre === '#FFFFFF' ? 'text' : 'background'} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

// Libellé en capitales espacées, comme « FLIGHTS » / « DISTANCE » chez Flighty.
export function Libelle({ children, color }: { children: ReactNode; color: string }) {
  return <Text style={[styles.libelle, { color }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  carte: { borderRadius: Radius.large, overflow: 'hidden' },
  capture: { overflow: 'hidden' },
  contenu: { padding: Spacing.four, gap: Spacing.three },
  partage: { position: 'absolute', top: Spacing.three, right: Spacing.three },
  bouton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.22)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.25)' },
  bas: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four, gap: Spacing.two },
  lien: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52, borderRadius: Radius.medium, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: Spacing.three },
  lienTexte: { fontSize: 17, fontWeight: '600' },
  libelle: { fontSize: 13, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
});
