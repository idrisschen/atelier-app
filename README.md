# Atelier — MVP iOS

App iOS pour créateurs de contenu, tirée de l'Atelier d'Erwin (`../code-erwin`), rendue générique : chaque créateur décrit son profil à l'onboarding.
Positionnement : « le coach qui te fait sortir créer, et te dit la vérité après ». Design inspiré de Flighty (sombre, gros chiffres, couleurs réservées aux statuts).

## Ce que fait le MVP

Tout marche **sans IA** (règles et modèles en local, dans `src/lib/`). L'assistant IA est une option des réglages, désactivée par défaut.

| Onglet | Rôle | Moteur local | Origine dans l'Atelier |
|---|---|---|---|
| Aujourd'hui | Anneaux de la semaine, prochaine belle lumière, verdicts à rendre, stories du jour, prochain départ | `missions.ts` | `1_accueil`, `stories.py`, `BRIEF_STORIES.md` |
| Créer | Une carte d'embarquement par contenu : Idée → Brief → Tournage → Publié → Verdict | `brief.ts`, `verdict.ts` | `tournage.py`, `accroches.py`, `conseils.py` |
| Sortir | Golden hour et heure bleue près de soi, sorties planifiées, idées de sortie | `soleil.ts` | `agenda.py` (onglet Sortir) |
| Objectif | Abonnés : rythme nécessaire vs réel ; quota de publications par semaine | `objectif.ts` | `1_accueil` (Fil rouge) |

- **Verdict à 48 h** : vues comparées à la médiane du créateur sur la même plateforme, puis le défaut principal (zap, réactions, partages, conversion) et 3 actions.
- **Stories** : un seul sondage par jour, au réveil ; son résultat le lendemain ; défi le lundi ; boîte à questions en dernier.
- **Données** : sur le téléphone (AsyncStorage, clé `atelier:v2`, migration automatique depuis `v1`), sans compte. La position ne sert qu'au calcul de la lumière.

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
