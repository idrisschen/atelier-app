// Brief de tournage sans IA : la méthode de tournage.py / BRIEF_TOURNAGE.md, déclinée par format.
// Les accroches sont des structures à compléter (crochets) : on ne réécrit pas le sujet sans IA.
import type { Brief, FormatContenu, Profile } from './types';

export const FORMATS: Record<FormatContenu, { label: string; code: string }> = {
  reportage: { label: 'Reportage', code: 'REP' },
  vlog: { label: 'Vlog', code: 'VLG' },
  tuto: { label: 'Tuto', code: 'TUT' },
  coulisses: { label: 'Coulisses', code: 'BTS' },
  portrait: { label: 'Portrait', code: 'PRT' },
};

const OBJECTIF: Record<FormatContenu, string> = {
  reportage: 'Faire découvrir un lieu ou un événement par les gens qui le font vivre, en moins de 45 secondes.',
  vlog: 'Embarquer les gens dans ta journée : un point de départ, un imprévu, une chute.',
  tuto: 'Une seule chose apprise, montrée en action, que les gens enregistrent pour plus tard.',
  coulisses: 'Montrer ce que personne ne voit : le travail, les ratés, le moment avant le résultat.',
  portrait: 'Une personne, une phrase forte, un détail qui la rend unique.',
};

const ACCROCHES: Record<FormatContenu, Brief['accroches']> = {
  reportage: [
    { image: 'Gros plan sur des mains en action, sans contexte.', phrase: 'Personne ne sait que [ce qui se passe ici].', texte_ecran: 'À [distance] DE CHEZ TOI' },
    { image: 'Toi face caméra, déjà en train de marcher vers l’entrée.', phrase: 'J’ai [durée] pour comprendre pourquoi [fait surprenant].', texte_ecran: '[DURÉE]' },
    { image: 'Le résultat final en plein cadre, dès la 1re seconde.', phrase: 'Voilà ce qui sort de [lieu] chaque [moment].', texte_ecran: 'CHAQUE [MOMENT]' },
  ],
  vlog: [
    { image: 'Toi en mouvement, plan déjà commencé.', phrase: 'Je ne devais pas finir ici ce soir.', texte_ecran: '[HEURE] · [LIEU]' },
    { image: 'Le moment le plus fort de la journée, puis retour au matin.', phrase: 'Ce matin j’avais un plan. Il a duré [durée].', texte_ecran: 'LE PLAN' },
    { image: 'Un détail intrigant en très gros plan.', phrase: 'Tu sais ce que c’est ? Moi non plus il y a [durée].', texte_ecran: '?' },
  ],
  tuto: [
    { image: 'Le résultat réussi, puis le raté juste après.', phrase: 'Tu fais sûrement [l’erreur] comme moi avant.', texte_ecran: 'L’ERREUR' },
    { image: 'Tes mains qui font le geste, cadré serré.', phrase: '[Nombre] secondes pour [résultat].', texte_ecran: '[N] SECONDES' },
    { image: 'Avant / après côte à côte.', phrase: 'Un seul réglage change tout : [le réglage].', texte_ecran: 'UN SEUL RÉGLAGE' },
  ],
  coulisses: [
    { image: 'Le bazar avant, en plan large.', phrase: 'Voilà à quoi ça ressemble vraiment avant [le résultat].', texte_ecran: 'LA VRAIE VERSION' },
    { image: 'Un raté filmé tel quel.', phrase: 'Ça, personne ne le poste. Moi si.', texte_ecran: 'RATÉ N°[N]' },
    { image: 'Le compteur : heures, prises, kilomètres.', phrase: '[Chiffre] [unité] pour [ce que les gens voient en 3 s].', texte_ecran: '[CHIFFRE]' },
  ],
  portrait: [
    { image: 'Son visage en gros plan, il ou elle parle déjà.', phrase: 'La phrase la plus forte de la personne, en premier.', texte_ecran: '[PRÉNOM], [ÂGE OU MÉTIER]' },
    { image: 'Ses mains au travail.', phrase: 'Depuis [durée], [prénom] fait [chose rare].', texte_ecran: 'DEPUIS [DURÉE]' },
    { image: 'Un objet qui lui appartient, en détail.', phrase: 'Cet objet a [histoire courte].', texte_ecran: '' },
  ],
};

const PLANS: Record<FormatContenu, Brief['plans']> = {
  reportage: [
    { plan: 'Les mains et l’action, sans visage', combien: '5 plans de 3 s' },
    { plan: 'Les visages des gens (avec leur accord)', combien: '4 plans de 4 s' },
    { plan: 'Détails : matière, outils, enseigne', combien: '6 plans de 2 s' },
    { plan: 'Un plan large pour situer, à la fin seulement', combien: '1 plan de 3 s' },
    { plan: 'Toi qui réagis (pas plus)', combien: '2 plans de 3 s' },
  ],
  vlog: [
    { plan: 'Le départ : porte, chaussures, trajet', combien: '3 plans de 2 s' },
    { plan: 'L’imprévu, filmé au moment où il arrive', combien: '1 séquence de 15 s' },
    { plan: 'Les autres et l’ambiance, pas toi', combien: '6 plans de 3 s' },
    { plan: 'Toi face caméra, une phrase par moment fort', combien: '3 plans de 5 s' },
    { plan: 'La fin de journée, lumière basse', combien: '2 plans de 4 s' },
  ],
  tuto: [
    { plan: 'Le résultat final, propre', combien: '2 plans de 3 s' },
    { plan: 'Chaque étape en gros plan sur les mains', combien: '1 plan de 4 s par étape' },
    { plan: 'Le raté à éviter', combien: '1 plan de 3 s' },
    { plan: 'Toi qui expliques l’étape clé', combien: '1 plan de 8 s' },
  ],
  coulisses: [
    { plan: 'Le lieu avant, en désordre', combien: '2 plans de 3 s' },
    { plan: 'Le travail en accéléré (timelapse)', combien: '1 plan de 20 s' },
    { plan: 'Les ratés et les reprises', combien: '3 plans de 3 s' },
    { plan: 'Le résultat, en dernier', combien: '2 plans de 3 s' },
  ],
  portrait: [
    { plan: 'Son visage pendant qu’elle ou il parle', combien: '3 plans de 6 s' },
    { plan: 'Ses mains au travail', combien: '4 plans de 3 s' },
    { plan: 'Son lieu, sans elle ou lui', combien: '3 plans de 2 s' },
    { plan: 'Un silence : elle ou il regarde ailleurs', combien: '1 plan de 4 s' },
  ],
};

const PHRASES: Record<FormatContenu, string[]> = {
  reportage: ['Depuis combien de temps vous faites ça ?', 'Le truc que les gens ne savent pas, c’est quoi ?', 'Ce que vous préférez ici, en un mot ?'],
  vlog: ['Là, je ne m’y attendais pas.', 'Si tu passes par [lieu], fais ça.', 'Le meilleur moment de la journée, c’était celui-là.'],
  tuto: ['L’erreur que tout le monde fait, c’est…', 'Retiens juste ça :', 'Enregistre pour la prochaine fois.'],
  coulisses: ['Personne ne voit cette partie.', 'Là, j’ai failli tout arrêter.', 'Et voilà ce que vous voyez au final.'],
  portrait: ['Qu’est-ce que les gens ne comprennent pas sur ton métier ?', 'Le jour où tout a changé pour toi ?', 'Tu dirais quoi à quelqu’un qui commence ?'],
};

const A_EVITER = [
  'Commencer par un plan large vide ou par « Bon les gars, aujourd’hui… ».',
  'Plus de 30 % de selfie : filme les autres, l’action, les détails.',
  'Un temps calme juste après l’accroche : le 2e moment fort vient tout de suite.',
  'Publier une personne reconnaissable sans son accord (droit à l’image) : demande-le et filme son « oui », sinon garde la foule, filme de dos ou floute.',
];

export function briefLocal(format: FormatContenu, profile: Profile): Brief {
  const regles = profile.regles
    .split(/[,;\n]/)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => (r.endsWith('.') ? r : `${r}.`));
  return {
    objectif: OBJECTIF[format],
    accroches: ACCROCHES[format],
    plans: PLANS[format],
    phrases: PHRASES[format],
    a_eviter: [...A_EVITER, ...regles],
  };
}
