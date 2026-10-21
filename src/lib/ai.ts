import type { Profile } from './types';

// URL de la fonction « atelier » (Supabase Edge Function, ou `deno run` en local sur le port 8000).
// Sur un iPhone physique en dev, remplacer localhost par l'IP du Mac.
const URL = process.env.EXPO_PUBLIC_AI_URL ?? 'http://localhost:8000';
const ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export type AiTask = 'missions' | 'tournage' | 'accroche' | 'stats';

export class AiError extends Error {}

export async function askAtelier<T>(task: AiTask, profile: Profile, input: Record<string, unknown>) {
  let res: Response;
  try {
    res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(ANON ? { Authorization: `Bearer ${ANON}`, apikey: ANON } : {}),
      },
      body: JSON.stringify({ task, profile, input }),
    });
  } catch {
    throw new AiError('Pas de connexion au service. Vérifie ton réseau.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new AiError(data?.error ?? `Erreur ${res.status}`);
  return data as { demo: boolean; result: T };
}
