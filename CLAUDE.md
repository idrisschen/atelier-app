@AGENTS.md

# Rush

**Rush** est le nom de travail de la phase de dev. Le nom définitif sera choisi plus tard. Le code, le bundle (`com.maninstudio.atelier`), le scheme, la clé de stockage et la fonction serveur s'appellent encore `atelier` : ne les renommez pas sans demande explicite. Renommer la clé de stockage ou le bundle casse les données et les builds existants.

App iOS (Expo / React Native) pour créateurs de contenu : « le coach qui te fait sortir créer, et te dit la vérité après ». Elle est tirée de l'Atelier d'Erwin (`../code-erwin`, en Python) et rendue générique : chaque créateur décrit son profil à l'onboarding. Le fonctionnement produit est décrit dans `README.md`, le design dans `DESIGN.md`.

## Stack

- Expo SDK 58, React Native 0.88, React 19.3, TypeScript 6, Expo Router (routes typées), React Compiler activé.
- Données sur le téléphone, sans compte : AsyncStorage, clé `atelier:v2`, migrée depuis `v1` au chargement (`src/lib/store.tsx`).
- IA en option, désactivée par défaut : Supabase Edge Function en Deno (`supabase/functions/atelier/`) qui appelle Claude. Le prompt est la constante `SYSTEM` dans `index.ts`, le modèle est réglé par `ATELIER_MODEL` côté serveur.
- Démo web : `Dockerfile` et `server/web.ts` (Deno), qui servent l'export web et la passerelle IA sur `/api`.

## Arborescence

- `src/app/`: les routes uniquement. Les onglets sont dans `(tabs)/` (`index` = Aujourd'hui, `sortir`, `bilan`, `creer`). Les modales sont déclarées dans `_layout.tsx` et l'onboarding est `bienvenue.tsx`, protégé par `Stack.Protected` selon `state.profile`.
- `src/lib/`: la logique métier, locale et pure. `missions.ts` (stories du jour), `brief.ts`, `verdict.ts` (verdict à 48 h contre la médiane du créateur), `soleil.ts` (golden hour et heure bleue), `objectif.ts`, `bilan.ts`. Les types sont dans `types.ts`, les listes de référence dans `options.ts`.
- `src/components/`: `ui.tsx` (primitives `Screen`, `Txt`, `Num`, `Card`, `Button`, `Chip`, `Status`, `Field`…), `glass.tsx`, `ambient.tsx`, `icon.tsx` (table `ICONES`) et `boarding-pass.tsx`.
- `src/constants/theme.ts`: la seule source des couleurs, espacements et rayons.

## Règles

- **Tout marche sans IA.** Une fonctionnalité doit d'abord tourner sur des règles locales dans `src/lib/`. L'IA ne fait qu'enrichir et ne doit jamais être requise.
- **Le français partout** : interface, noms de variables et de fonctions métier (`contenus`, `sortie`, `verdict`), commentaires. Le texte s'adresse au créateur en le tutoyant. Suivez le style du code environnant : commentaires courts qui expliquent le pourquoi.
- **Design** : respectez `DESIGN.md`. Passez par les primitives de `ui.tsx` et les jetons de `theme.ts`, jamais de valeur en dur dans un écran. Les couleurs de statut ne servent qu'aux états.
- **Accessibilité** : `accessibilityLabel` sur tout bouton à icône seule, cibles tactiles de 44 au minimum, prise en compte de `useReducedMotion` pour les animations.
- **Changement du format stocké** : incrémentez la version et ajoutez une migration dans `store.tsx`. Ne cassez jamais les données d'un utilisateur existant.
- **Position** : elle ne sert qu'au calcul de la lumière et ne quitte pas le téléphone.

## Avant de rendre

```bash
npx tsc --noEmit
npx expo lint
```

Il n'y a pas de suite de tests. Si l'interface change, vérifiez-la dans le simulateur ou sur le web (`npx expo start`, puis `i` ou `w`) avec une capture d'écran.

## Git

On ne pousse jamais sur `main` : une branche `feat/…`, `fix/…` ou `copy/…`, puis une PR relue par Idriss (voir `CONTRIBUTING.md`). Une PR = un sujet.

## Dette connue avant l'App Store

La fonction IA n'a pas de quota par utilisateur : quiconque a l'URL et la clé anon peut consommer la clé Claude. Il faut prévoir Supabase Auth anonyme et un compteur quotidien. Il manque aussi la politique de confidentialité, l'icône et le splash définitifs (ceux du template Expo sont encore dans `assets/`), et l'abonnement.
