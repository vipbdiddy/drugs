import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { newId } from './ids';
import { deletePhoto } from './photos';
import { SEED_ISMS, SEED_LOVED_ONES } from './seed';
import type { Ism, LovedOne, Settings } from './types';

// Kept from the app's first name so data saved under it still loads.
const STORAGE_KEY = 'still-with-me/v1';

interface PersistedState {
  userId: string;
  settings: Settings;
  lovedOnes: LovedOne[];
  isms: Ism[];
  savedIsmIds: string[];
}


const initialState = (): PersistedState => ({
  userId: newId(),
  settings: { displayName: '', defaultScope: 'mine' },
  lovedOnes: [],
  isms: [],
  savedIsmIds: [],
});

type NewLovedOne = Omit<LovedOne, 'id' | 'ownerId' | 'createdAt'>;
type NewIsm = Omit<Ism, 'id' | 'ownerId' | 'createdAt'>;

interface Store {
  ready: boolean;
  userId: string;
  settings: Settings;
  /** Your own loved ones plus every public one from other families. */
  lovedOnes: LovedOne[];
  /** Your own isms plus every ism from other families (filter with `visibleIsms`). */
  isms: Ism[];
  savedIsmIds: Set<string>;
  getLovedOne: (id: string) => LovedOne | undefined;
  addLovedOne: (input: NewLovedOne) => LovedOne;
  updateLovedOne: (id: string, patch: Partial<NewLovedOne>) => void;
  deleteLovedOne: (id: string) => void;
  addIsm: (input: NewIsm) => Ism;
  updateIsm: (id: string, patch: Partial<NewIsm>) => void;
  deleteIsm: (id: string) => void;
  toggleSaved: (ismId: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetEverything: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as PersistedState;
        // Entries saved before stories existed are all quotes.
        saved.isms = saved.isms.map((i) => ({ ...i, kind: i.kind ?? 'quote' }));
        setState({ ...initialState(), ...saved });
      })
      .catch((e) => console.warn('Could not load saved data', e))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
      console.warn('Could not save data', e),
    );
  }, [state, ready]);

  const addLovedOne = useCallback(
    (input: NewLovedOne) => {
      const lovedOne: LovedOne = { ...input, id: newId(), ownerId: state.userId, createdAt: Date.now() };
      setState((s) => ({ ...s, lovedOnes: [...s.lovedOnes, lovedOne] }));
      return lovedOne;
    },
    [state.userId],
  );

  const addIsm = useCallback(
    (input: NewIsm) => {
      const ism: Ism = { ...input, id: newId(), ownerId: state.userId, createdAt: Date.now() };
      setState((s) => ({ ...s, isms: [ism, ...s.isms] }));
      return ism;
    },
    [state.userId],
  );

  const store = useMemo<Store>(() => {
    const lovedOnes = [...state.lovedOnes, ...SEED_LOVED_ONES];
    const byId = new Map(lovedOnes.map((l) => [l.id, l]));
    return {
      ready,
      userId: state.userId,
      settings: state.settings,
      lovedOnes,
      isms: [...state.isms, ...SEED_ISMS],
      savedIsmIds: new Set(state.savedIsmIds),
      getLovedOne: (id) => byId.get(id),
      addLovedOne,
      updateLovedOne: (id, patch) => {
        const old = state.lovedOnes.find((l) => l.id === id);
        if ('photoUri' in patch && old?.photoUri !== patch.photoUri) deletePhoto(old?.photoUri);
        setState((s) => ({
          ...s,
          lovedOnes: s.lovedOnes.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        }));
      },
      deleteLovedOne: (id) => {
        deletePhoto(state.lovedOnes.find((l) => l.id === id)?.photoUri);
        setState((s) => {
          const removed = new Set(s.isms.filter((i) => i.lovedOneId === id).map((i) => i.id));
          return {
            ...s,
            lovedOnes: s.lovedOnes.filter((l) => l.id !== id),
            isms: s.isms.filter((i) => !removed.has(i.id)),
            savedIsmIds: s.savedIsmIds.filter((sid) => !removed.has(sid)),
          };
        });
      },
      addIsm,
      updateIsm: (id, patch) =>
        setState((s) => ({ ...s, isms: s.isms.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      deleteIsm: (id) =>
        setState((s) => ({
          ...s,
          isms: s.isms.filter((i) => i.id !== id),
          savedIsmIds: s.savedIsmIds.filter((sid) => sid !== id),
        })),
      toggleSaved: (ismId) =>
        setState((s) => ({
          ...s,
          savedIsmIds: s.savedIsmIds.includes(ismId)
            ? s.savedIsmIds.filter((sid) => sid !== ismId)
            : [ismId, ...s.savedIsmIds],
        })),
      updateSettings: (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      resetEverything: () => {
        state.lovedOnes.forEach((l) => deletePhoto(l.photoUri));
        setState(initialState());
      },
    };
  }, [state, ready, addLovedOne, addIsm]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <StoreProvider>');
  return store;
}
