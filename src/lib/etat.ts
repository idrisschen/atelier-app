// Le tableau des départs du jour (la métaphore de Flighty) : une ligne par chose, triée par urgence,
// avec un statut qu'on lit d'un coup d'œil. L'accueil change selon le moment au lieu d'être un tableau de bord fixe.
import type { NomIcone } from '@/components/icon';
import type { ThemeColor } from '@/constants/theme';

import { ajouteJours, ecartJours } from './dates';
import { heure, lumieresDuJour } from './soleil';
import type { AppState } from './types';

export type Depart = {
  cle: string;
  icon: NomIcone;
  quand: string; // colonne de gauche, comme l'heure d'un vol
  titre: string;
  statut: string;
  couleur: ThemeColor;
  lien: string;
};

const dateSortie = (quand: string) => {
  const [d, h] = quand.split('T');
  const [y, m, j] = d.split('-').map(Number);
  const [hh, mm] = h.split(':').map(Number);
  return new Date(y, m - 1, j, hh, mm);
};

export function departs(state: AppState, jour: string, maintenant = new Date()): Depart[] {
  const lignes: (Depart & { rang: number })[] = [];

  // 1. Verdicts à rendre : 48 h passées, les chiffres attendent.
  for (const c of state.contenus) {
    if (c.statut !== 'publie' || !c.publie) continue;
    const age = ecartJours(c.publie, jour);
    if (age >= 2) {
      lignes.push({ cle: c.id, rang: 0, icon: 'verdict', quand: 'Verdict', titre: c.titre, statut: 'À rendre', couleur: 'warning', lien: `/contenu/${c.id}` });
    } else {
      // 4. Publiés « en vol » : le verdict tombe à 48 h, pas avant (les chiffres arrivent avec du retard).
      const reste = ecartJours(jour, ajouteJours(c.publie, 2));
      lignes.push({ cle: c.id, rang: 3, icon: 'publie', quand: 'En vol', titre: c.titre, statut: `Verdict ${reste === 1 ? 'demain' : 'après-demain'}`, couleur: 'accent', lien: `/contenu/${c.id}` });
    }
  }

  // 2. Sorties du jour : l'heure, et la lumière si elle tombe dedans.
  for (const s of state.sorties) {
    if (s.faite || s.quand.slice(0, 10) !== jour) continue;
    const t = dateSortie(s.quand);
    const l = state.position ? lumieresDuJour(t, state.position.lat, state.position.lon).find((x) => x.debut <= t && t < x.fin) : undefined;
    const passee = t < maintenant;
    lignes.push({
      cle: s.id,
      rang: 1,
      icon: 'lieu',
      quand: heure(t),
      titre: s.lieu,
      statut: passee ? 'Tu y es allé ?' : l ? (l.type === 'golden' ? 'Golden hour' : 'Heure bleue') : 'Aujourd’hui',
      couleur: passee ? 'danger' : l ? (l.type === 'golden' ? 'golden' : 'blue') : 'success',
      lien: '/sortir',
    });
  }

  // 3. Tournages prévus aujourd'hui.
  for (const c of state.contenus) {
    if (c.tournage !== jour || (c.statut !== 'brief' && c.statut !== 'tournage' && c.statut !== 'idee')) continue;
    lignes.push({ cle: `t${c.id}`, rang: 2, icon: 'tournage', quand: 'Auj.', titre: c.titre, statut: 'Tournage', couleur: 'warning', lien: `/contenu/${c.id}` });
  }

  return lignes.sort((a, b) => a.rang - b.rang).map(({ rang: _r, ...d }) => d);
}
