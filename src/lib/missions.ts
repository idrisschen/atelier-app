// Missions stories du jour, sans IA : les règles de l'Atelier d'Erwin (BRIEF_STORIES.md) en code.
// - chaque mission porte un sticker en un geste (sondage, curseur, quiz) ; une boîte à questions au plus par jour ;
// - un sondage d'hier appelle sa suite aujourd'hui (le résultat, jamais un nouveau sondage dessus) ;
// - pas de remplissage, des formats qui tournent d'un jour à l'autre ;
// - le nombre suit la taille du compte : les petits comptes postent en médiane ~12 stories par mois à 1k–5k abonnés,
//   ~35 à 10k–50k (Socialinsider 2025, comptes de marques). Plus de stories ne rattrape pas une portée qui ne suit pas.
import { ajouteJours } from './dates';
import type { AppState, Mission, MissionsDuJour } from './types';

type Ctx = { niche: string; jour: string; lundi: boolean; publieRecemment: string | null };

type Format = {
  id: string;
  sondage?: boolean; // appelle une suite le lendemain
  fabrique: (c: Ctx) => Omit<Mission, 'moment' | 'format'>;
};

const FORMATS: Format[] = [
  {
    id: 'duel',
    sondage: true,
    fabrique: () => ({
      titre: 'Laquelle tu préfères ?',
      quoi: "Deux de tes contenus récents l'un au-dessus de l'autre, séparés par une bande noire.",
      texte_ecran: 'LAQUELLE ?',
      sticker: { type: 'sondage', question: '', reponses: ['Celle du haut', 'Celle du bas'] },
      pourquoi: 'Ceux qui votent reviennent voir le résultat demain : deux stories pour le prix d’une.',
    }),
  },
  {
    id: 'avant_apres',
    sondage: true,
    fabrique: () => ({
      titre: 'Avant ou après ?',
      quoi: 'Le même plan brut et retouché, côte à côte.',
      texte_ecran: 'TU GARDES LAQUELLE ?',
      sticker: { type: 'sondage', question: '', reponses: ['Avant', 'Après'] },
      pourquoi: 'Tu sais quelle retouche ton audience préfère avant de l’appliquer partout.',
    }),
  },
  {
    id: 'devine',
    fabrique: () => ({
      titre: 'Devine où j’étais',
      quoi: 'Un détail de ton dernier lieu de tournage, cadré serré pour qu’on hésite.',
      texte_ecran: 'DEVINE OÙ',
      sticker: { type: 'quiz', question: 'J’étais où ?', reponses: ['[Bon lieu]', '[Lieu plausible]', '[Lieu drôle]'] },
      pourquoi: 'Le quiz se joue en un geste et donne envie de voir la vidéo qui va avec.',
    }),
  },
  {
    id: 'coulisses',
    sondage: true,
    fabrique: () => ({
      titre: 'Je commence par lequel ?',
      quoi: 'Deux débuts possibles pour ta prochaine vidéo, en deux captures.',
      texte_ecran: 'JE COMMENCE PAR LEQUEL ?',
      sticker: { type: 'sondage', question: '', reponses: ['Le 1', 'Le 2'] },
      pourquoi: 'Ton audience choisit ton accroche : tu postes celle qui a déjà gagné.',
    }),
  },
  {
    id: 'curseur',
    fabrique: () => ({
      titre: 'Elle vaut combien ?',
      quoi: 'Ta meilleure image de la semaine, en plein écran.',
      texte_ecran: '',
      sticker: { type: 'curseur', question: 'Elle vaut combien ? 🔥', reponses: [] },
      pourquoi: 'La moyenne des 🔥 te dit si elle mérite un post à part entière.',
    }),
  },
  {
    id: 'materiel',
    fabrique: ({ niche }) => ({
      titre: 'Mon matériel aujourd’hui',
      quoi: `Ton sac ou ton matériel posé à plat, avant de partir (${niche}).`,
      texte_ecran: 'AUJOURD’HUI JE PARS AVEC ÇA',
      sticker: { type: 'quiz', question: 'Je vais filmer quoi ?', reponses: ['[Bonne réponse]', '[Autre]', '[Autre]'] },
      pourquoi: 'Les coulisses en un tap : on s’attache à la personne derrière le compte.',
    }),
  },
  {
    id: 'questions',
    fabrique: ({ niche }) => ({
      titre: 'Pose-moi ta question',
      quoi: 'Un plan de toi au travail, sans rien dire.',
      texte_ecran: '',
      sticker: { type: 'questions', question: `Ta question sur ${niche.toLowerCase()}`, reponses: [] },
      pourquoi: 'Chaque question reçue est une idée de vidéo que ton audience a déjà demandée.',
    }),
  },
];

const RESULTAT: Format = {
  id: 'resultat',
  fabrique: () => ({
    titre: 'Le résultat du sondage',
    quoi: 'Le gagnant d’hier en grand avec son pourcentage, l’autre en petit.',
    texte_ecran: 'VOUS AVEZ CHOISI CELUI-CI',
    sticker: { type: 'curseur', question: 'Il vaut combien ? 🔥', reponses: [] },
    pourquoi: 'Ceux qui ont voté hier reviennent voir qui a gagné. Jamais de nouveau sondage sur un résultat.',
  }),
};

const DEFI: Format = {
  id: 'defi',
  fabrique: ({ niche }) => ({
    titre: 'Le défi de la semaine',
    quoi: 'Ton exemple pour lancer le thème. Choisis un sujet que tout le monde a déjà dans son téléphone.',
    texte_ecran: 'DÉFI DE LA SEMAINE 📸',
    sticker: { type: 'ajoute_le_tien', question: `Ton meilleur ${niche.toLowerCase().split(' ')[0]} de la semaine`, reponses: [] },
    pourquoi: '« Ajoute le tien » fait voir ta story aux amis de chaque participant.',
  }),
};

const PARTAGE: Format = {
  id: 'partage',
  fabrique: ({ publieRecemment }) => ({
    titre: 'Partage ta dernière vidéo',
    quoi: `Repartage « ${publieRecemment} » en story, juste après l’avoir postée.`,
    texte_ecran: '',
    sticker: { type: 'curseur', question: 'Elle vaut combien ? 🔥', reponses: [] },
    pourquoi: 'Tes abonnés les plus fidèles voient tes stories avant ton post : ils lancent ses premières vues.',
  }),
};

const MOMENTS = ['Au réveil', 'Vers 13 h', 'Vers 18 h'];

// Abonnés connus (dernier relevé de l'objectif) → missions par jour. Inconnu : 2.
export function missionsParJour(state: AppState) {
  const releves = state.objectif?.releves ?? [];
  const abonnes = releves.length ? [...releves].sort((a, b) => a.date.localeCompare(b.date)).pop()!.valeur : null;
  if (abonnes === null) return 2;
  return abonnes < 5000 ? 1 : abonnes < 10000 ? 2 : 3;
}

// Petit hasard déterministe : même jour = mêmes missions.
function graine(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function missionsLocales(state: AppState, jour: string, journee: string): MissionsDuJour {
  const niche = state.profile?.niche || 'ton sujet';
  const [y, m, d] = jour.split('-').map(Number);
  const lundi = new Date(y, m - 1, d).getDay() === 1;
  const recent = state.contenus.find((c) => c.publie && c.publie >= ajouteJours(jour, -1));
  const ctx: Ctx = { niche, jour, lundi, publieRecemment: recent?.titre ?? null };

  const hier = state.missions[ajouteJours(jour, -1)];
  const formatsRecents = new Set(
    [1, 2, 3].flatMap((n) => state.missions[ajouteJours(jour, -n)]?.missions.map((x) => x.format) ?? []),
  );
  // Suite logique : un sondage posté hier attend son résultat.
  const sondageHier = hier?.missions.some((x, i) => hier.faites.includes(i) && FORMATS.find((f) => f.id === x.format)?.sondage);

  const max = missionsParJour(state);
  const choisis: Format[] = [];
  if (sondageHier) choisis.push(RESULTAT);
  if (lundi) choisis.push(DEFI);
  if (recent) choisis.push(PARTAGE);

  const rnd = graine(jour + niche);
  const candidats = FORMATS.filter((f) => !formatsRecents.has(f.id)).sort(() => rnd() - 0.5);
  const reserve = FORMATS.filter((f) => formatsRecents.has(f.id)).sort(() => rnd() - 0.5);
  for (const f of [...candidats, ...reserve]) {
    if (choisis.length >= max) break;
    if (sondageHier && f.sondage) continue; // pas de sondage le jour d'un résultat
    if (f.sondage && choisis.some((c) => c.sondage)) continue; // un seul sondage : il aura sa suite demain
    if (f.id === 'questions' && choisis.some((c) => c.id === 'questions')) continue;
    choisis.push(f);
  }

  // Ordre de la journée (règle d'Erwin) : le résultat ou le sondage au réveil, la boîte à questions en dernier.
  const rang = (f: Format) => (f.id === 'resultat' ? 0 : f.sondage ? 1 : f.id === 'questions' ? 3 : 2);
  const missions = choisis
    .slice(0, max) // les suites passent en premier : un résultat de sondage n’est jamais coupé
    .sort((a, b) => rang(a) - rang(b))
    .map((f, i) => ({ ...f.fabrique(ctx), format: f.id, moment: MOMENTS[i] }));
  return {
    missions,
    conseil: journee
      ? `Ta journée : « ${journee} ». Prends 5 secondes de ce que tu vis pour la 2e mission, c’est la plus vue.`
      : 'Ta première story est ton accroche : c’est là qu’on part le plus (près d’1 sur 4). Mets-y la plus forte, au réveil.',
    faites: [],
    journee,
    source: 'local',
  };
}
