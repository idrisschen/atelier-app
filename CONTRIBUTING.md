# Contribuer

**On ne pousse jamais directement sur `main`.** Tout passe par une pull request relue par Idriss.

```bash
git switch main && git pull
git switch -c feat/ma-modif        # ou fix/…, copy/…
# … modifications …
git push -u origin feat/ma-modif
gh pr create --fill                # ou le bouton « Compare & pull request » sur GitHub
```

Avant d'ouvrir la PR :

```bash
npx tsc --noEmit
npx expo lint
```

Une PR = un sujet. Mets une capture d'écran si l'interface change.
Les consignes IA (le prompt) sont dans `supabase/functions/atelier/index.ts`, constante `SYSTEM`.
