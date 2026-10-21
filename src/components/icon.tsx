// Une seule famille d'icônes : SF Symbols sur iPhone, Material Symbols ailleurs (même sens, même graisse).
import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';

import type { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Sym = ComponentProps<typeof SymbolView>['name'];

const I = (ios: string, md: string) => ({ ios, android: md, web: md }) as unknown as Sym;

export const ICONES = {
  aujourdhui: I('sun.max.fill', 'wb_sunny'),
  creer: I('ticket.fill', 'confirmation_number'),
  sortir: I('map.fill', 'map'),
  objectif: I('flag.fill', 'flag'),
  bilan: I('person.text.rectangle.fill', 'badge'),
  partager: I('square.and.arrow.up', 'ios_share'),
  serie: I('flame.fill', 'local_fire_department'),
  profil: I('person.crop.circle', 'person'),
  ajouter: I('plus', 'add'),
  retour: I('chevron.left', 'chevron_left'),
  suite: I('chevron.right', 'chevron_right'),
  fermer: I('xmark', 'close'),
  ok: I('checkmark', 'check'),
  refaire: I('arrow.clockwise', 'refresh'),
  supprimer: I('trash', 'delete'),
  editer: I('pencil', 'edit'),
  monter: I('arrow.up', 'arrow_upward'),
  liste: I('checklist', 'checklist'),
  // étapes d'un contenu
  idee: I('lightbulb.fill', 'lightbulb'),
  brief: I('doc.text.fill', 'description'),
  tournage: I('video.fill', 'videocam'),
  publie: I('paperplane.fill', 'send'),
  verdict: I('checkmark.seal.fill', 'verified'),
  // stickers
  sondage: I('chart.bar.fill', 'poll'),
  curseur: I('flame.fill', 'local_fire_department'),
  quiz: I('questionmark.circle.fill', 'quiz'),
  questions: I('bubble.left.fill', 'question_answer'),
  lien: I('link', 'link'),
  ajoute_le_tien: I('person.2.fill', 'group'),
  aucun: I('circle.dashed', 'radio_button_unchecked'),
  // moments et lumière
  matin: I('sunrise.fill', 'wb_twilight'),
  midi: I('sun.max.fill', 'wb_sunny'),
  soir: I('sunset.fill', 'bedtime'),
  bleue: I('moon.stars.fill', 'nightlight'),
  golden: I('sun.horizon.fill', 'wb_twilight'),
  eclaircie: I('cloud.sun.fill', 'partly_cloudy_day'),
  nuage: I('cloud.fill', 'cloud'),
  lieu: I('mappin.and.ellipse', 'place'),
  heure: I('clock.fill', 'schedule'),
  date: I('calendar', 'today'),
  plans: I('checklist', 'checklist'),
  // chiffres
  vues: I('eye.fill', 'visibility'),
  jaime: I('heart.fill', 'favorite'),
  commentaires: I('bubble.right.fill', 'chat'),
  partages: I('arrowshape.turn.up.right.fill', 'share'),
  enregistrements: I('bookmark.fill', 'bookmark'),
  abonnes: I('person.badge.plus', 'person_add'),
  zap: I('hand.point.up.left.fill', 'timer'),
  hausse: I('arrow.up.right', 'trending_up'),
  baisse: I('arrow.down.right', 'trending_down'),
  stable: I('arrow.right', 'trending_flat'),
  ia: I('sparkles', 'auto_awesome'),
  attention: I('exclamationmark.triangle.fill', 'warning'),
  interdit: I('xmark.circle.fill', 'cancel'),
  parole: I('quote.bubble.fill', 'format_quote'),
  cible: I('scope', 'my_location'),
  rythme: I('metronome.fill', 'speed'),
} as const;

export type NomIcone = keyof typeof ICONES;

export const TAILLE = { sm: 14, md: 18, lg: 22, xl: 28 } as const;

export function Icon({ name, size = 'md', color = 'text' }: { name: NomIcone; size?: keyof typeof TAILLE | number; color?: ThemeColor }) {
  const theme = useTheme();
  const px = typeof size === 'number' ? size : TAILLE[size];
  return <SymbolView name={ICONES[name]} size={px} tintColor={theme[color]} type="hierarchical" style={{ width: px, height: px }} />;
}
