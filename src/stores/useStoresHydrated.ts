import { useEffect, useState } from 'react';
import { useFavoritesStore } from './useFavoritesStore';
import { useGroceryStore } from './useGroceryStore';
import { useMealPlanStore } from './useMealPlanStore';
import { useRecipeStore } from './useRecipeStore';
import { useSettingsStore } from './useSettingsStore';
import { useAccountStore } from './useAccountStore';

interface PersistedStore {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (callback: () => void) => () => void;
  };
}

const STORES: PersistedStore[] = [
  useAccountStore,
  useSettingsStore,
  useMealPlanStore,
  useGroceryStore,
  useFavoritesStore,
  useRecipeStore,
];

function allStoresHydrated(): boolean {
  return STORES.every((store) => store.persist.hasHydrated());
}

export function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(allStoresHydrated);

  useEffect(() => {
    const update = () => setHydrated(allStoresHydrated());
    const unsubscribes = STORES.map((store) => store.persist.onFinishHydration(update));
    update();
    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe();
    };
  }, []);

  return hydrated;
}
