import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import type { AppState, Contenu, MissionsDuJour, Objectif, Profile, Brief } from './types';

// Tout vit sur le téléphone (pas de compte pour le MVP). Une clé par version du format, migration au chargement.
const KEY = 'atelier:v2';
const KEY_V1 = 'atelier:v1';
const CONTENUS_MAX = 200;

const VIDE: AppState = {
  version: 2,
  profile: null,
  reglages: { ia: false, quotaSemaine: 3 },
  missions: {},
  contenus: [],
  sorties: [],
  objectif: null,
  position: null,
};

type V1 = {
  profile: Profile | null;
  missions: Record<string, Omit<MissionsDuJour, 'source'> & { demo?: boolean }>;
  tournages: { id: string; date: string; sujet: string; brief: Brief }[];
  objectif: Objectif | null;
};

// v1 (premier MVP) → v2 : les tournages deviennent des contenus au statut « brief », l'historique d'accroches est abandonné.
function migreV1(v1: V1): AppState {
  const contenus: Contenu[] = (v1.tournages ?? []).map((t) => ({
    id: t.id,
    titre: t.sujet,
    format: 'reportage',
    plateforme: v1.profile?.plateformes[0] ?? 'Instagram',
    statut: 'brief',
    cree: t.date,
    brief: t.brief,
    plansFaits: [],
  }));
  const missions = Object.fromEntries(
    Object.entries(v1.missions ?? {}).map(([d, m]) => [d, { ...m, source: m.demo === false ? 'ia' : 'local' } as MissionsDuJour]),
  );
  return { ...VIDE, profile: v1.profile, objectif: v1.objectif, missions, contenus };
}

type Store = {
  state: AppState;
  ready: boolean;
  update: (fn: (s: AppState) => AppState) => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(VIDE);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) return setState({ ...VIDE, ...JSON.parse(raw) });
      const ancien = await AsyncStorage.getItem(KEY_V1);
      if (ancien) setState(migreV1(JSON.parse(ancien)));
    })()
      .catch((e) => console.error('lecture du stockage', e))
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch((e) => console.error('écriture du stockage', e));
  }, [state]);

  const update = (fn: (s: AppState) => AppState) =>
    setState((s) => {
      const next = fn(s);
      return { ...next, contenus: next.contenus.slice(0, CONTENUS_MAX) };
    });

  const reset = () => {
    AsyncStorage.removeItem(KEY_V1).catch(() => {});
    setState(VIDE);
  };

  return <Ctx.Provider value={{ state, ready, update, reset }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore hors de StoreProvider');
  return s;
}

export { ajouteJours, dateCourte, debutSemaine, ecartJours, jourIso, newId, today } from './dates';
