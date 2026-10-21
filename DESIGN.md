---
version: alpha
name: Rush
description: Coach iOS pour créateurs de contenu — sombre, gros chiffres, couleurs réservées aux statuts (inspiré de Flighty).
colors:
  text: "#F2F4F7"
  background: "#07090C"
  backgroundElement: "#12161C"
  backgroundSelected: "#1C222B"
  textSecondary: "#8B95A3"
  textTertiary: "#5A6370"
  border: "#232A34"
  accent: "#5B8CFF"
  accentText: "#FFFFFF"
  success: "#34D399"
  warning: "#FBBF24"
  danger: "#F87171"
  golden: "#F59E0B"
  blue: "#6366F1"
typography:
  display:
    fontFamily: system-ui
    fontSize: 34px
    lineHeight: 38px
    fontWeight: 800
    letterSpacing: -0.8px
  title:
    fontFamily: system-ui
    fontSize: 22px
    lineHeight: 27px
    fontWeight: 700
    letterSpacing: -0.4px
  heading:
    fontFamily: system-ui
    fontSize: 17px
    lineHeight: 22px
    fontWeight: 600
    letterSpacing: -0.2px
  body:
    fontFamily: system-ui
    fontSize: 16px
    lineHeight: 22px
    fontWeight: 400
  small:
    fontFamily: system-ui
    fontSize: 14px
    lineHeight: 19px
    fontWeight: 400
  label:
    fontFamily: system-ui
    fontSize: 12px
    lineHeight: 15px
    fontWeight: 600
    letterSpacing: 0.4px
  num:
    fontFamily: ui-rounded
    fontSize: 44px
    lineHeight: 1.08
    fontWeight: 700
    fontFeature: '"tnum"'
rounded:
  small: 10px
  medium: 16px
  large: 22px
  pill: 999px
spacing:
  half: 2px
  one: 4px
  two: 8px
  three: 16px
  four: 24px
  five: 32px
  six: 64px
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accentText}"
    rounded: "{rounded.medium}"
    height: 52px
  chip-selected:
    backgroundColor: "{colors.text}"
    textColor: "{colors.background}"
    rounded: "{rounded.pill}"
    height: 40px
---

## Overview

Rush est le coach qui fait sortir le créateur tourner, puis lui dit la vérité sur le résultat. L'interface emprunte à Flighty : fond sombre profond, très gros chiffres arrondis, et des couleurs vives réservées aux statuts. Chaque contenu est une carte d'embarquement qui suit un trajet en étapes (Idée → Brief → Tournage → Publié → Verdict). Chaque plateforme y a un code court, comme un code d'aéroport.

## Colors

- L'app est sombre dans les deux modes : c'est son identité. Ne prévoyez pas de thème clair.
- `success`, `warning` et `danger` servent uniquement à dire un état (verdict haut, moyen ou bas, étape en cours). Jamais à décorer.
- `accent` sert aux actions : bouton principal, onglet actif, curseur de saisie, halo de fond par défaut.
- `golden` et `blue` désignent la golden hour et l'heure bleue.
- Toute couleur vient de la palette du thème via `useTheme()`. Un écran ne contient aucune valeur de couleur en dur.

## Typography

- Le texte courant passe par `Txt` et l'une de ses variantes. `label` prend `textSecondary` par défaut.
- Tout chiffre mis en avant (vues, abonnés, heures) passe par `Num` : police arrondie, chasse fixe pour que les chiffres ne bougent pas quand ils changent, approche resserrée proportionnelle à la taille.
- Le titre d'écran est en `display` sur une seule ligne, et rétrécit pour tenir.

## Layout

- Chaque écran passe par `Screen`. Il gère les marges de sécurité, la marge du bas pour la barre d'onglets et une colonne centrée de largeur maximale 640.
- Les espacements, entre blocs comme en marge intérieure, viennent de l'échelle `spacing`. L'espacement par défaut entre blocs est `three`.
- Une section s'ouvre par une icône et un mot en `label`. L'action éventuelle se place à droite.
- Navigation : trois onglets (Aujourd'hui, Sortir, Bilan) dans la barre native. « Créer » est un rond détaché à droite, comme dans Flighty. Les formulaires de création et les réglages s'ouvrent en modale.

## Elevation & Depth

- Les surfaces sont en verre (`Glass`) : liquid glass natif sur iOS 26+, flou d'arrière-plan sur les autres plateformes. Un verre ne tient que s'il y a de la lumière derrière : tout écran qui en utilise s'appuie sur le fond `Ambient` (dégradé et halo qui dérive lentement).
- Le halo s'arrête quand l'utilisateur a demandé moins d'animations.
- Un verre peut prendre la teinte d'un statut pour signaler un état.
- Seul le bouton principal porte une lueur de la couleur `accent`. Les autres surfaces n'ont pas d'ombre.

## Shapes

- Cartes et verres : `rounded.large`. Boutons et champs de saisie : `rounded.medium`. Puces et pastilles de statut : `rounded.pill`. Les boutons à icône seule sont ronds.

## Components

- Une seule famille d'icônes, déclarée dans `ICONES` (`src/components/icon.tsx`) : SF Symbols sur iPhone, Material Symbols ailleurs, avec le même sens. Ajoutez toute nouvelle icône à cette table plutôt que de l'appeler directement.
- Un élément touchable réagit en s'enfonçant légèrement (échelle et opacité, sans décaler la mise en page) et déclenche un retour haptique léger sur iOS.
- Une pastille d'état (`Status`) associe toujours une icône ou un point de couleur à un mot.
- Un bouton à icône seule (`IconButton`) porte un libellé pour VoiceOver. Toute cible tactile mesure au moins 44 de haut.
- Les variantes de bouton sont `primary` (action principale, pleine), `secondary` (verre), `ghost` (sans fond) et `danger` (texte `danger` sur verre).
- Une puce sélectionnée s'inverse (fond `text`, texte `background`). Une puce non sélectionnée reste en verre.

## Do's and Don'ts

- Ne mettez jamais de couleur, d'espacement ou de rayon en dur dans un écran : prenez-les dans le thème.
- N'utilisez jamais les couleurs de statut comme décoration.
- Ne laissez jamais la couleur porter seule le sens : ajoutez une icône ou un mot.
