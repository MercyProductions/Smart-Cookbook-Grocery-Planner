import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MealPlanEntry } from '@/types';

interface MealPlanState {
  entries: MealPlanEntry[];
  addRecipe: (recipeId: string, servings: number) => void;
  removeRecipe: (recipeId: string) => void;
  setServings: (recipeId: string, servings: number) => void;
  clear: () => void;
  reset: () => void;
}

export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set) => ({
      entries: [],
      addRecipe: (recipeId, servings) =>
        set((state) => {
          if (state.entries.some((entry) => entry.recipeId === recipeId)) return state;
          return { entries: [...state.entries, { recipeId, servings }] };
        }),
      removeRecipe: (recipeId) =>
        set((state) => ({ entries: state.entries.filter((entry) => entry.recipeId !== recipeId) })),
      setServings: (recipeId, servings) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.recipeId === recipeId ? { ...entry, servings } : entry,
          ),
        })),
      clear: () => set({ entries: [] }),
      reset: () => set({ entries: [] }),
    }),
    {
      name: 'cookbook.mealplan.v1',
      version: 1,
      partialize: (state) => ({ entries: state.entries }),
      migrate: (persisted) => {
        const state = persisted as Partial<MealPlanState> | undefined;
        return {
          entries: Array.isArray(state?.entries)
            ? state.entries.filter(
                (entry): entry is { recipeId: string; servings: number } =>
                  typeof entry.recipeId === 'string' &&
                  typeof entry.servings === 'number' &&
                  Number.isFinite(entry.servings),
              )
            : [],
        };
      },
    },
  ),
);
