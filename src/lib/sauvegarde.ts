// Sauvegarde : tout vit sur le téléphone, donc le créateur doit pouvoir emporter ses données (nouveau téléphone,
// app supprimée). Un fichier JSON qu'il range où il veut (Fichiers, iCloud Drive, mail…) et qu'il réimporte.
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { today } from './dates';
import type { AppState } from './types';

export async function exporter(state: AppState) {
  const nom = `rush-sauvegarde-${today()}.json`;
  const texte = JSON.stringify(state);
  if (Platform.OS === 'web') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([texte], { type: 'application/json' }));
    a.download = nom;
    a.click();
    return;
  }
  const fichier = new File(Paths.cache, nom);
  if (fichier.exists) fichier.delete();
  fichier.create();
  fichier.write(texte);
  await Sharing.shareAsync(fichier.uri, { mimeType: 'application/json', UTI: 'public.json' });
}

// null si l'utilisateur annule ; une erreur lisible si le fichier n'est pas une sauvegarde Rush.
export async function lireSauvegarde(): Promise<AppState | null> {
  const choix = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (choix.canceled) return null;
  const asset = choix.assets[0];
  const texte = Platform.OS === 'web' && asset.file ? await asset.file.text() : await new File(asset.uri).text();
  let data: AppState;
  try {
    data = JSON.parse(texte);
  } catch {
    throw new Error('Ce fichier n’est pas une sauvegarde Rush.');
  }
  if (data?.version !== 2 || !data.profile || !Array.isArray(data.contenus)) throw new Error('Ce fichier n’est pas une sauvegarde Rush.');
  return data;
}
