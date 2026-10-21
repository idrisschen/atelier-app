// Un réseau à la fois : abonnés relevés à la main (l'API Instagram attend la validation de Meta), progression sur 7 jours,
// publications de la semaine et dernier verdict. Les relevés de la plateforme de l'objectif sont ceux de l'objectif.
import { ajouteJours, debutSemaine, ecartJours } from './dates';
import type { AppState, CaseSemaine, Contenu } from './types';

type Releve = { date: string; valeur: number };

export function releves(state: AppState, plateforme: string): Releve[] {
  const propres = state.reseaux[plateforme] ?? [];
  const objectif = state.objectif?.plateforme === plateforme ? state.objectif.releves : [];
  const parJour = new Map<string, number>();
  for (const r of [...propres, ...objectif]) parJour.set(r.date, r.valeur);
  return [...parJour].map(([date, valeur]) => ({ date, valeur })).sort((a, b) => a.date.localeCompare(b.date));
}

// Noter les abonnés d'un jour : dans le réseau, et dans l'objectif s'il porte sur ce réseau.
export function noteAbonnes(state: AppState, plateforme: string, valeur: number, jour: string): AppState {
  const sans = (rs: Releve[]) => rs.filter((r) => r.date !== jour);
  return {
    ...state,
    reseaux: { ...state.reseaux, [plateforme]: [...sans(state.reseaux[plateforme] ?? []), { date: jour, valeur }] },
    objectif:
      state.objectif?.plateforme === plateforme
        ? { ...state.objectif, releves: [...sans(state.objectif.releves), { date: jour, valeur }] }
        : state.objectif,
  };
}

export function reseau(state: AppState, plateforme: string, jour: string) {
  const rs = releves(state, plateforme);
  const dernier = rs[rs.length - 1] ?? null;
  // Gain sur 7 jours : par rapport au relevé le plus récent d'au moins 7 jours avant le dernier.
  const ref = dernier ? [...rs].reverse().find((r) => ecartJours(r.date, dernier.date) >= 7) : undefined;
  const lundi = debutSemaine(jour);
  const contenus = state.contenus.filter((c) => c.plateforme === plateforme);
  const verdicts = contenus.filter((c) => c.verdict && c.publie).sort((a, b) => b.publie!.localeCompare(a.publie!));
  return {
    abonnes: dernier?.valeur ?? null,
    releveLe: dernier?.date ?? null,
    gain7: dernier && ref ? Math.round(((dernier.valeur - ref.valeur) / ecartJours(ref.date, dernier.date)) * 7) : null,
    publiesSemaine: contenus.filter((c) => c.publie && c.publie >= lundi && c.publie <= jour).length,
    enCours: contenus.filter((c) => c.statut === 'idee' || c.statut === 'brief' || c.statut === 'tournage').length,
    dernierVerdict: (verdicts[0] as Contenu | undefined) ?? null,
    serie: rs.filter((r) => r.date >= ajouteJours(jour, -27)), // 4 semaines pour la mini-courbe
  };
}

// ---------- « Cette semaine » ----------

export const CASES_DEFAUT: CaseSemaine[] = [
  { label: 'Publication', format: undefined },
  { label: 'Publication', format: undefined },
  { label: 'Vlog de la semaine', format: 'vlog' },
];

// Quelles cases sont cochées : d'abord par les contenus publiés cette semaine (format exact, puis n'importe lequel
// pour une case sans format), puis à la main.
export function casesDeLaSemaine(state: AppState, jour: string) {
  const cases = state.reglages.cases ?? CASES_DEFAUT;
  const lundi = debutSemaine(jour);
  const publies = state.contenus.filter((c) => c.publie && c.publie >= lundi && c.publie <= jour);
  const restants = [...publies];
  const auto = new Set<number>();
  const prend = (i: number, ok: (c: Contenu) => boolean) => {
    const k = restants.findIndex(ok);
    if (k < 0) return;
    auto.add(i);
    restants.splice(k, 1);
  };
  cases.forEach((c, i) => c.format && prend(i, (x) => x.format === c.format));
  cases.forEach((c, i) => !c.format && prend(i, () => true));
  const main = new Set(state.casesCochees[lundi] ?? []);
  return { lundi, cases: cases.map((c, i) => ({ ...c, auto: auto.has(i), cochee: auto.has(i) || main.has(i) })) };
}
