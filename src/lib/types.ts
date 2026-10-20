export type Profile = {
  prenom: string;
  plateformes: string[];
  niche: string;
  audience: string;
  objectif: string;
  ton: string;
  regles: string;
};

export type StickerType = 'sondage' | 'curseur' | 'quiz' | 'questions' | 'lien' | 'ajoute_le_tien' | 'aucun';

export type Mission = {
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
  demo: boolean;
};

export type Brief = {
  objectif: string;
  accroches: { image: string; phrase: string; texte_ecran: string }[];
  plans: { plan: string; combien: string }[];
  phrases: string[];
  a_eviter: string[];
};

export type AnalyseAccroche = {
  note: number;
  verdict: string;
  defaut_principal: string;
  image: string;
  phrase: string;
  texte_ecran: string;
  reecritures: { phrase: string; image: string }[];
};

export type Tournage = { id: string; date: string; sujet: string; brief: Brief; demo: boolean };

export type Accroche = { id: string; date: string; phrase: string; imageUri?: string; analyse: AnalyseAccroche; demo: boolean };

export type Objectif = {
  plateforme: string;
  cible: number;
  echeance: string; // AAAA-MM-JJ
  releves: { date: string; valeur: number }[];
};

export type AppState = {
  profile: Profile | null;
  missions: Record<string, MissionsDuJour>;
  tournages: Tournage[];
  accroches: Accroche[];
  objectif: Objectif | null;
};
