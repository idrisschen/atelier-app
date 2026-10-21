import * as Location from 'expo-location';
import { Platform } from 'react-native';

import type { Position } from './types';

// Une seule lecture, à la demande : la position sert à calculer la lumière et reste sur le téléphone,
// sauf si le créateur active la météo (meteo.ts l'arrondit alors à ~10 km pour Open-Meteo).
export async function lirePosition(): Promise<Position> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Position refusée. Tu peux l’activer dans les réglages de l’iPhone.');
  const p = (await Location.getLastKnownPositionAsync()) ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }));
  const pos: Position = { lat: Math.round(p.coords.latitude * 100) / 100, lon: Math.round(p.coords.longitude * 100) / 100 };
  // Sur le web, retrouver la ville exige une clé Google : on s'en passe.
  if (Platform.OS === 'web') return pos;
  try {
    const [adresse] = await Location.reverseGeocodeAsync({ latitude: pos.lat, longitude: pos.lon });
    pos.ville = adresse?.city ?? adresse?.subregion ?? undefined;
  } catch {
    // Le nom de la ville est un bonus : la lumière se calcule sans.
  }
  return pos;
}
