// Le bilan du créateur (le « Passport » de Flighty), calculé sur le téléphone à partir de ce qu'il a coché.
import { ajouteJours, debutSemaine, ecartJours } from './dates';
import type { AppState } from './types';

export type Periode = '7' | '30' | 'tout';

// Une semaine est tenue avec au moins 3 jours de stories : les autres jours sont des jours off, pas des ratés.
// Un raté isolé ne casse pas une habitude, et un streak quotidien rigide nourrit le burnout (1 créateur sur 2).
export const JOURS_PAR_SEMAINE = 3;

export const PERIODES: { id: Periode; label: string }[] = [
  { id: '7', label: '7 jours' },
  { id: '30', label: '30 jours' },
  { id: 'tout', label: 'Depuis le début' },
];

export function bilan(state: AppState, periode: Periode, jour: string) {
  const actif = (d: string) => (state.missions[d]?.faites.length ?? 0) > 0;

  // Premier jour où il s'est passé quelque chose : la base de « depuis le début ».
  const dates = [
    ...Object.keys(state.missions),
    ...state.contenus.flatMap((c) => [c.cree, c.publie ?? c.cree]),
    ...state.sorties.map((s) => s.quand.slice(0, 10)),
  ].filter((d) => d <= jour);
  const premier = dates.length ? dates.reduce((a, b) => (a < b ? a : b)) : jour;
  const debut = periode === 'tout' ? premier : ajouteJours(jour, -(Number(periode) - 1));
  const nbJours = ecartJours(debut, jour) + 1;
  const dans = (d: string) => d >= debut && d <= jour;

  let missions = 0;
  let sondages = 0;
  let joursActifs = 0;
  for (const [d, m] of Object.entries(state.missions)) {
    if (!dans(d) || m.faites.length === 0) continue;
    joursActifs++;
    missions += m.faites.length;
    sondages += m.faites.filter((i) => m.missions[i]?.sticker.type === 'sondage').length;
  }

  // Série en semaines tenues. La semaine en cours compte dès qu'elle est tenue, et ne casse rien tant qu'elle ne l'est pas.
  const joursActifsSemaine = (lundi: string) => [0, 1, 2, 3, 4, 5, 6].filter((n) => actif(ajouteJours(lundi, n))).length;
  const tenue = (lundi: string) => joursActifsSemaine(lundi) >= JOURS_PAR_SEMAINE;
  const cetteSemaine = debutSemaine(jour);
  const joursCetteSemaine = joursActifsSemaine(cetteSemaine);
  let serie = tenue(cetteSemaine) ? 1 : 0;
  for (let l = ajouteJours(cetteSemaine, -7); tenue(l); l = ajouteJours(l, -7)) serie++;
  let record = serie;
  const premiereSemaine = debutSemaine(premier);
  for (let l = premiereSemaine, courant = 0; l <= cetteSemaine; l = ajouteJours(l, 7)) {
    courant = tenue(l) ? courant + 1 : 0;
    record = Math.max(record, courant);
  }

  const sorties = state.sorties.filter((s) => s.faite && dans(s.quand.slice(0, 10)));
  const publies = state.contenus.filter((c) => c.publie && dans(c.publie));
  const meilleur = publies
    .filter((c) => c.verdict?.ratio != null && c.stats)
    .sort((a, b) => b.verdict!.ratio! - a.verdict!.ratio!)[0];

  return {
    nbJours,
    missions,
    sondages,
    joursActifs,
    serie,
    record,
    joursCetteSemaine,
    sorties: sorties.length,
    sortiesPourContenu: sorties.filter((s) => s.contenuId).length,
    publies: publies.length,
    parSemaine: (publies.length / nbJours) * 7,
    meilleur: meilleur ?? null,
  };
}

export const pluriel = (n: number, mot: string) => `${n.toLocaleString('fr-FR')} ${mot}${n > 1 ? 's' : ''}`;
