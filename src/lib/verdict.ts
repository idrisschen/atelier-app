// Verdict à 48 h, sans IA : les vues comparées à la médiane du créateur, puis UN défaut et UNE action.
// Règles tirées de l'Atelier d'Erwin (accroches.py, conseils.py) : on compare le créateur à lui-même, jamais aux autres.
// Quand les comptes touchés sont notés, on juge sur les ratios qu'Instagram dit regarder (Mosseri, janv. 2025) :
// partages par compte touché et j'aime par compte touché, rapportés à la médiane du créateur.
import type { Contenu, Stats, Verdict } from './types';

export function mediane(xs: number[]) {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const pct = (x: number) => `${(x * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;

// « 2,5× » : le ratio à la médiane, à la française.
export const fois = (r: number) => `${r.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}×`;

export function calculeVerdict(stats: Stats, precedents: Contenu[]): Verdict {
  const med = mediane(precedents.filter((c) => c.stats).map((c) => c.stats!.vues));
  const ratio = med && med > 0 ? stats.vues / med : null;
  const niveau: Verdict['niveau'] = ratio === null ? 'repere' : ratio >= 1.3 ? 'haut' : ratio >= 0.7 ? 'moyen' : 'bas';

  const titre =
    niveau === 'repere'
      ? 'Premier repère posé. Les prochains se compareront à lui.'
      : niveau === 'haut'
        ? 'Ce format marche. Refais-le.'
        : niveau === 'moyen'
          ? 'Dans ta moyenne. Rien de cassé, rien de neuf.'
          : 'Il a décroché quelque part.';

  // Écart à la médiane du créateur pour un ratio « par compte touché » (null sans assez de repères).
  const ecart = (cle: 'partages' | 'likes') => {
    if (!stats.portee) return null;
    const med = mediane(precedents.filter((c) => c.stats?.portee).map((c) => c.stats![cle] / c.stats!.portee!));
    return med && med > 0 && precedents.filter((c) => c.stats?.portee).length >= 2 ? stats[cle] / stats.portee / med - 1 : null;
  };
  const ecartPartages = ecart('partages');
  const ecartLikes = ecart('likes');
  const signe = (e: number) => `${e > 0 ? '+' : '−'}${Math.round(Math.abs(e) * 100)} %`;

  const v = Math.max(stats.vues, 1);
  const reactions = (stats.likes + stats.commentaires + stats.partages) / v;
  const garde = (stats.partages + stats.enregistrements) / v;
  const conversion = stats.abonnes / v;

  // Le défaut principal d'abord : le premier qui s'applique, dans l'ordre où la vidéo est vue.
  let defaut: string;
  const actions: string[] = [];
  if (stats.zap !== undefined && stats.zap >= 50) {
    defaut = `${Math.round(stats.zap)} % zappent dans les 3 premières secondes : l’accroche ne tient pas.`;
    actions.push('Ouvre sur le moment le plus fort, pas sur l’installation.', 'Première phrase : une promesse ou une contradiction, jamais « Bon les gars ».');
  } else if (ecartPartages !== null && ecartPartages <= -0.3) {
    defaut = `Partages par compte touché : ${signe(ecartPartages)} par rapport à ta médiane. On regarde, mais on ne l’envoie à personne.`;
    actions.push('Avant de tourner, nomme la personne à qui on l’enverrait, et fais la vidéo pour elle.');
  } else if (ecartLikes !== null && ecartLikes <= -0.3) {
    defaut = `J’aime par compte touché : ${signe(ecartLikes)} par rapport à ta médiane. Ils l’ont vu sans être touchés.`;
    actions.push('Montre ce que tu penses, pas seulement ce que tu vois : une opinion par vidéo.');
  } else if (reactions < 0.03) {
    defaut = `Seulement ${pct(reactions)} des gens réagissent : ils regardent sans être touchés.`;
    actions.push('Termine par une question précise, à laquelle on répond en un mot.', 'Montre une opinion : ce que tu penses, pas seulement ce que tu vois.');
  } else if (garde < 0.01) {
    defaut = `Peu de partages et d’enregistrements (${pct(garde)}) : agréable, mais rien à garder ni à envoyer.`;
    actions.push('Ajoute une info utile : un lieu, un prix, un réglage, une adresse.', 'Pense « à qui on l’enverrait ? » avant de tourner.');
  } else if (conversion < 0.002 && stats.vues > 1000) {
    defaut = `${stats.abonnes} abonnés pour ${stats.vues.toLocaleString('fr-FR')} vues : on aime la vidéo, pas encore le compte.`;
    actions.push('Dis en une phrase ce qu’on trouvera sur ton compte.', 'Fais de ce sujet une série : « partie 1 » donne une raison de s’abonner.');
  } else if (ecartPartages !== null && ecartPartages >= 0.3) {
    defaut = `Partages par compte touché : ${signe(ecartPartages)} par rapport à ta médiane. C’est le signal qui t’amène des non-abonnés.`;
    actions.push('Refais ce sujet sous un autre angle dans la semaine.');
  } else {
    defaut = 'Rien de bloquant : l’accroche tient, les gens réagissent et gardent la vidéo.';
    actions.push('Refais ce format dans la semaine, avec un autre sujet.');
  }
  // Une seule action : la plus utile. Le verdict dit quoi faire, pas une liste à cocher.
  return { niveau, ratio, titre, defaut, actions: actions.slice(0, 1) };
}
