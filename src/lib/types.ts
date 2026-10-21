export type Profile = {
  prenom: string;
  plateformes: string[];
  niche: string;
  audience: string;
  objectif: string;
  ton: string;
  regles: string;
};

export type Reglages = {
  ia: boolean; // assistant IA (option, désactivé par défaut : tout marche sans)
  quotaSemaine: number; // publications visées par semaine
  cases?: CaseSemaine[]; // « Cette semaine » : les publications à tenir, par type (absent = valeurs par défaut)
};

// ---------- la todo ----------

export type Tache = { id: string; texte: string; faite: boolean; cree: string };

// Une case de la semaine : un libellé, et un format qui la coche tout seul quand un contenu de ce format est publié.
export type CaseSemaine = { label: string; format?: FormatContenu };

// ---------- missions stories ----------

export type StickerType = 'sondage' | 'curseur' | 'quiz' | 'questions' | 'lien' | 'ajoute_le_tien' | 'aucun';

export type Mission = {
  format?: string; // identifiant du format local (pour les suites et la rotation)
  titre: string;
  moment: string;
  quoi: string;
  texte_ecran: string;
  sticker: { type: StickerType; question: string; reponses: string[] };
  pourquoi: string;
};

export type MissionsDuJour = {
  missions: Mission[];
  conseil: string;
  faites: number[];
  journee: string;
  source: 'local' | 'ia';
  demo?: boolean;
};

// ---------- contenus : la carte d'embarquement ----------

export type Statut = 'idee' | 'brief' | 'tournage' | 'publie' | 'verdict';

export type FormatContenu = 'reportage' | 'vlog' | 'tuto' | 'coulisses' | 'portrait';

export type Brief = {
  objectif: string;
  accroches: { image: string; phrase: string; texte_ecran: string }[];
  plans: { plan: string; combien: string }[];
  phrases: string[];
  a_eviter: string[];
};

export type Stats = {
  vues: number;
  portee?: number; // comptes touchés (« reach ») : la base des ratios qu'Instagram regarde
  likes: number;
  commentaires: number;
  partages: number;
  enregistrements: number;
  abonnes: number;
  zap?: number; // % qui zappent dans les 3 premières secondes, si la plateforme le donne
};

export type Verdict = {
  niveau: 'haut' | 'moyen' | 'bas' | 'repere';
  ratio: number | null; // vues / médiane des contenus précédents
  titre: string;
  defaut: string;
  actions: string[];
};

export type Contenu = {
  id: string;
  titre: string;
  format: FormatContenu;
  plateforme: string;
  statut: Statut;
  cree: string; // AAAA-MM-JJ
  tournage?: string; // date prévue
  brief?: Brief;
  plansFaits: number[];
  publie?: string; // date de publication
  stats?: Stats;
  verdict?: Verdict;
};

// ---------- sorties ----------

export type Sortie = {
  id: string;
  lieu: string;
  quand: string; // AAAA-MM-JJTHH:mm (heure locale)
  note: string;
  contenuId?: string;
  faite: boolean;
};

export type Position = { lat: number; lon: number; ville?: string };

// ---------- objectif ----------

export type Objectif = {
  plateforme: string;
  cible: number;
  echeance: string; // AAAA-MM-JJ
  releves: { date: string; valeur: number }[];
};

export type AppState = {
  version: 2;
  profile: Profile | null;
  reglages: Reglages;
  missions: Record<string, MissionsDuJour>;
  contenus: Contenu[];
  sorties: Sortie[];
  objectif: Objectif | null;
  position: Position | null;
  taches: Tache[]; // dans l'ordre des priorités
  casesCochees: Record<string, number[]>; // lundi de la semaine → cases cochées à la main
  reseaux: Record<string, { date: string; valeur: number }[]>; // plateforme → relevés d'abonnés
};
