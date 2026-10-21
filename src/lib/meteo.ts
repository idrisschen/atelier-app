// Couverture nuageuse heure par heure (Open-Meteo, sans clé) : une golden hour sous un grain ne vaut rien.
// Option désactivée par défaut : la position, arrondie à ~10 km, quitte alors le téléphone.
import { jourIso } from './dates';
import type { Position } from './types';

type Ciel = Record<string, number>; // « AAAA-MM-JJTHH:00 » (heure locale) → % de ciel couvert

let cache: { cle: string; quand: number; ciel: Ciel } | null = null;
const DUREE_CACHE = 60 * 60_000;

export async function lireCiel(pos: Position): Promise<Ciel> {
  const lat = Math.round(pos.lat * 10) / 10;
  const lon = Math.round(pos.lon * 10) / 10;
  const cle = `${lat},${lon}`;
  if (cache && cache.cle === cle && Date.now() - cache.quand < DUREE_CACHE) return cache.ciel;
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloud_cover&timezone=auto&forecast_days=2`);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const data: { hourly?: { time: string[]; cloud_cover: number[] } } = await res.json();
  const ciel: Ciel = Object.fromEntries((data.hourly?.time ?? []).map((t, i) => [t, data.hourly!.cloud_cover[i]]));
  cache = { cle, quand: Date.now(), ciel };
  return ciel;
}

export const couverture = (ciel: Ciel, t: Date) => ciel[`${jourIso(t)}T${String(t.getHours()).padStart(2, '0')}:00`];

export function motCiel(pct: number) {
  return pct <= 30 ? { mot: 'Dégagé', icon: 'eclaircie' as const } : pct <= 70 ? { mot: 'Voilé', icon: 'eclaircie' as const } : { mot: 'Couvert', icon: 'nuage' as const };
}
