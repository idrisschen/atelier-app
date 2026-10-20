import type { ThemeColor } from '@/constants/theme';

import type { Statut } from './types';

export const PLATEFORMES = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Snapchat', 'X'] as const;

// Code court affiché comme un code d'aéroport sur la carte d'embarquement.
export const CODE_PLATEFORME: Record<string, string> = {
  Instagram: 'IG',
  TikTok: 'TT',
  YouTube: 'YT',
  LinkedIn: 'LI',
  Snapchat: 'SC',
  X: 'X',
};

export const OBJECTIFS = [
  'Grossir mon audience',
  'Décrocher des marques',
  'Trouver des clients',
  'Vendre mes produits',
] as const;

export const STICKERS: Record<string, string> = {
  sondage: 'Sondage',
  curseur: 'Curseur émoji',
  quiz: 'Quiz',
  questions: 'Boîte à questions',
  lien: 'Lien',
  ajoute_le_tien: 'Ajoute le tien',
  aucun: 'Sans sticker',
};

// Le parcours d'un contenu, comme les étapes d'un vol. La couleur dit l'état, on n'a pas à l'interpréter.
export const ETAPES: { id: Statut; label: string; theme: ThemeColor }[] = [
  { id: 'idee', label: 'Idée', theme: 'textSecondary' },
  { id: 'brief', label: 'Brief', theme: 'accent' },
  { id: 'tournage', label: 'Tournage', theme: 'warning' },
  { id: 'publie', label: 'Publié', theme: 'success' },
  { id: 'verdict', label: 'Verdict', theme: 'text' },
];

export const IDEES_SORTIE = [
  { titre: 'Le marché du matin', pourquoi: 'Mains, couleurs, voix : des plans forts en 20 minutes, et les gens acceptent souvent d’être filmés.' },
  { titre: 'Un artisan au travail', pourquoi: 'Un portrait garanti : un geste rare, une phrase forte, un lieu que personne ne montre.' },
  { titre: 'Le lieu connu, à l’heure dorée', pourquoi: 'Le même endroit que tout le monde, mais dans la lumière que personne n’attend.' },
  { titre: 'La fête ou l’événement du week-end', pourquoi: 'Beaucoup de monde, beaucoup d’action : ta meilleure chance d’avoir l’imprévu.' },
  { titre: 'Un quartier jamais filmé', pourquoi: 'La découverte fait partager : « je ne savais pas que ça existait à côté ».' },
  { titre: 'Les coulisses d’un lieu qui ouvre', pourquoi: 'L’avant-ouverture, c’est l’accès que ton audience n’a pas.' },
] as const;
