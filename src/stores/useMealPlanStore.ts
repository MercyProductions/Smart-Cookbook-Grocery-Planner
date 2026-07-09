import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MealPlanEntry } from '@/types';

interface MealPlanState {
  entries: MealPlanEntry[];
  addRecipe: (recipeId: string, servings: number) => void;
  removeRecipe: (recipeId: string) => void;
  setServings: (recipeId: string, servings: number) => void;
  clear: () => void;
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
    }),
    { name: 'cookbook.mealplan.v1' },
  ),
);
