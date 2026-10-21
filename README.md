# Rush — MVP iOS

*Rush est le nom de travail ; le code, le bundle et la fonction serveur s'appellent encore `atelier`.*

App iOS pour créateurs de contenu, tirée de l'Atelier d'Erwin (`../code-erwin`), rendue générique : chaque créateur décrit son profil à l'onboarding.
Positionnement : « le coach qui te fait sortir créer, et te dit la vérité après ». Design inspiré de Flighty (sombre, gros chiffres, couleurs réservées aux statuts), décrit dans `DESIGN.md`.

## Ce que fait le MVP

Tout marche **sans IA** (règles et modèles en local, dans `src/lib/`). L'assistant IA est une option des réglages, désactivée par défaut.

| Écran | Rôle | Moteur local |
|---|---|---|
| Aujourd'hui | « Maintenant » (verdicts à rendre, sorties, tournages du jour), stories du jour, prochaine belle lumière, publications de la semaine, ma liste, prochain départ | `etat.ts`, `missions.ts` |
| Sortir | Golden hour et heure bleue près de soi (météo en option), sorties planifiées, idées de sortie | `soleil.ts`, `meteo.ts` |
| Bilan | Cartes à partager en story : activité, série, objectif d'abonnés, réseaux, meilleur contenu | `bilan.ts`, `objectif.ts` |
| + (Créer) | Une carte d'embarquement par contenu : Idée → Brief → Tournage → Publié → Verdict | `brief.ts`, `verdict.ts` |

- **Verdict à 48 h** : vues comparées à la médiane du créateur sur la même plateforme (et le même format dès 3 contenus). Les vues seules suffisent pour un verdict rapide ; avec le détail (ou une capture des stats lue par l'IA), le défaut principal (zap, partages, réactions, conversion) et **une** action.
- **Stories** : 1 à 3 par jour selon la taille du compte ; un seul sondage par jour, son résultat le lendemain ; défi le lundi ; boîte à questions en dernier.
- **Rappels** (iOS/Android, notifications locales) : l'heure du verdict, 30 min avant une sortie, 30 min avant la golden hour du soir. Demandés au premier « C'est publié », modifiables dans les réglages.
- **Données** : sur le téléphone (AsyncStorage, clé `atelier:v2`, migration automatique depuis `v1`), sans compte. Export et import d'une sauvegarde JSON dans les réglages. La position ne sert qu'au calcul de la lumière ; si la météo est activée, elle part arrondie à ~10 km vers Open-Meteo.

## Lancer en local

```bash
# 1. Passerelle IA (sans ANTHROPIC_API_KEY → réponses de démo)
cd supabase/functions/atelier
ANTHROPIC_API_KEY=sk-ant-… deno run --allow-net --allow-env index.ts   # écoute sur :8000

# 2. App (Node 22)
npx expo start          # i = simulateur (Xcode requis), w = navigateur, QR = Expo Go sur iPhone
```

Sur un iPhone physique : `EXPO_PUBLIC_AI_URL=http://<IP-du-Mac>:8000 npx expo start`.

## Mise en ligne

1. Fonction : `supabase functions deploy atelier` puis `supabase secrets set ANTHROPIC_API_KEY=…`.
   Dans `.env` de l'app : `EXPO_PUBLIC_AI_URL=https://<projet>.supabase.co/functions/v1/atelier` et `EXPO_PUBLIC_SUPABASE_ANON_KEY=…`.
2. Build iOS sans Xcode local : `npx eas-cli@latest build -p ios`, puis `npx eas-cli@latest submit -p ios` (compte Apple Developer requis).

## Avant l'App Store (non fait dans le MVP)

- **Quota par utilisateur** sur la fonction IA : un quota par adresse IP et par jour existe (`ATELIER_QUOTA`, 40 par défaut), mais il est en mémoire, par instance. Prévoir Supabase Auth anonyme + compteur persistant.
- Politique de confidentialité (profil, texte et image envoyés à Anthropic ; position arrondie à Open-Meteo si la météo est activée), fiche App Store.
- Abonnement (RevenueCat / StoreKit) si l'app devient payante.
- Modèle : `claude-opus-5-5` par défaut, modifiable via `ATELIER_MODEL` côté serveur selon le coût mesuré.
