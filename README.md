# Atelier — MVP iOS

App iOS pour créateurs de contenu, tirée de l'Atelier d'Erwin (`../code-erwin`), rendue générique : chaque créateur décrit son profil à l'onboarding et toute l'IA s'adapte à lui.

## Ce que fait le MVP

| Onglet | Rôle | Origine dans l'Atelier |
|---|---|---|
| Aujourd'hui | 2-3 missions stories du jour à cocher (sticker, texte à l'écran, « pourquoi »), avec suites logiques sur 3 jours | `stories.py`, `BRIEF_STORIES.md` |
| Tournage | Brief avant de filmer : 3 accroches, plans à ramener, phrases, à éviter | `tournage.py`, `BRIEF_TOURNAGE.md` |
| Accroche | Note /10 de la 1re image + 1re phrase, défaut principal, 3 réécritures (vision Claude) | `accroches.py`, `BRIEF_ACCROCHES.md` |
| Objectif | Fil rouge abonnés : rythme nécessaire vs rythme réel (calcul local, sans IA) | `1_accueil` (Fil rouge) |

Données : sur le téléphone (AsyncStorage), sans compte. IA : fonction serveur `supabase/functions/atelier`, la clé Claude ne quitte jamais le serveur.

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

- **Quota par utilisateur** sur la fonction IA : aujourd'hui, n'importe qui avec l'URL et la clé anon peut consommer la clé Claude. Prévoir Supabase Auth anonyme + compteur quotidien.
- Politique de confidentialité (texte et image envoyés à Anthropic), fiche App Store, icône et splash définitifs.
- Abonnement (RevenueCat / StoreKit) si l'app devient payante.
- Modèle : `claude-opus-5-5` par défaut, modifiable via `ATELIER_MODEL` côté serveur selon le coût mesuré.
