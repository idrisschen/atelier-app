// Partager une carte en image : elle part dans la feuille de partage d'iOS (Instagram, Messages, Photos…).
// Sur le web (démo), le partage natif du navigateur s'il accepte les fichiers, sinon un téléchargement.
import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import { Platform, type HostInstance } from 'react-native';
import { captureRef } from 'react-native-view-shot';

export async function partageImage(ref: RefObject<HostInstance | null>, nom: string) {
  if (Platform.OS === 'web') {
    const uri = await captureRef(ref, { format: 'png', result: 'data-uri' });
    const blob = await (await fetch(uri)).blob();
    const fichier = new File([blob], `${nom}.png`, { type: 'image/png' });
    if (navigator.canShare?.({ files: [fichier] })) {
      try {
        return await navigator.share({ files: [fichier] });
      } catch (e) {
        if ((e as Error).name === 'AbortError') return; // partage annulé : rien à dire
        // NotAllowedError : le navigateur refuse le partage après le temps de capture. On télécharge l'image.
      }
    }
    const a = document.createElement('a');
    a.href = uri;
    a.download = fichier.name;
    a.click();
    return;
  }
  const uri = await captureRef(ref, { format: 'png', result: 'tmpfile' });
  await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
}
