import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import type { AppState } from './types';

// Tout vit sur le téléphone (pas de compte pour le MVP). Une clé versionnée pour pouvoir migrer plus tard.
const KEY = 'atelier:v1';
const HISTORIQUE_MAX = 30;

const VIDE: AppState = { profile: null, missions: {}, tournages: [], accroches: [], objectif: null };

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
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setState({ ...VIDE, ...JSON.parse(raw) });
      })
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
      return {
        ...next,
        tournages: next.tournages.slice(0, HISTORIQUE_MAX),
        accroches: next.accroches.slice(0, HISTORIQUE_MAX),
      };
    });

  const reset = () => setState(VIDE);

  return <Ctx.Provider value={{ state, ready, update, reset }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore hors de StoreProvider');
  return s;
}

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
