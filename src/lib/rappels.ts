// Rappels locaux : le coach vient chercher le créateur au lieu d'attendre qu'il ouvre l'app.
// Tout est planifié sur le téléphone (aucun serveur de push) et recalculé à chaque changement d'état.
// Pas de notifications sur le web : les fonctions n'y font rien.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { ajouteJours } from './dates';
import { lumieresDuJour } from './soleil';
import type { AppState } from './types';

const ACTIF = Platform.OS !== 'web';
const AVANT_SORTIE = 30; // minutes
const AVANT_LUMIERE = 30; // minutes
const HEURE_VERDICT = 10; // le verdict tombe à 10 h, 48 h après la publication

if (ACTIF) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

export async function demanderRappels() {
  if (!ACTIF) return false;
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

type Rappel = { quand: Date; titre: string; corps: string; url: string };

const aLaDate = (iso: string, h: number, m = 0) => {
  const [y, mo, d] = iso.split('-').map(Number);
  return new Date(y, mo - 1, d, h, m);
};

export function rappelsAPlanifier(state: AppState, maintenant = new Date()): Rappel[] {
  const rappels: Rappel[] = [];

  for (const c of state.contenus) {
    if (c.statut !== 'publie' || !c.publie) continue;
    rappels.push({ quand: aLaDate(ajouteJours(c.publie, 2), HEURE_VERDICT), titre: 'L’heure du verdict', corps: `« ${c.titre} » a 48 h : note ses vues, Rush te dit ce qui a marché.`, url: `/contenu/${c.id}` });
  }

  for (const s of state.sorties) {
    if (s.faite) continue;
    const [d, h] = s.quand.split('T');
    const [hh, mm] = h.split(':').map(Number);
    const t = aLaDate(d, hh, mm);
    rappels.push({ quand: new Date(t.getTime() - AVANT_SORTIE * 60_000), titre: `Sortie dans ${AVANT_SORTIE} min`, corps: s.lieu, url: '/sortir' });
  }

  // La golden hour du soir, aujourd'hui et demain : le rappel qui fait sortir.
  if (state.position) {
    for (const n of [0, 1]) {
      const jour = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() + n);
      const soir = lumieresDuJour(jour, state.position.lat, state.position.lon).find((l) => l.type === 'golden' && l.debut.getHours() >= 12);
      if (soir) rappels.push({ quand: new Date(soir.debut.getTime() - AVANT_LUMIERE * 60_000), titre: `Golden hour dans ${AVANT_LUMIERE} min`, corps: '20 minutes dehors suffisent pour la semaine.', url: '/sortir' });
    }
  }

  return rappels.filter((r) => r.quand > maintenant);
}

// Tout effacer puis tout replanifier : quelques rappels à la fois, c'est plus sûr qu'un diff.
export async function planifierRappels(state: AppState) {
  if (!ACTIF) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!state.reglages.rappels) return;
  for (const r of rappelsAPlanifier(state)) {
    await Notifications.scheduleNotificationAsync({
      content: { title: r.titre, body: r.corps, data: { url: r.url } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.quand },
    });
  }
}

// Toucher un rappel ouvre l'écran concerné.
export function ecouterRappels(ouvrir: (url: string) => void) {
  if (!ACTIF) return () => {};
  const sub = Notifications.addNotificationResponseReceivedListener((r) => {
    const url = r.notification.request.content.data?.url;
    if (typeof url === 'string') ouvrir(url);
  });
  return () => sub.remove();
}
