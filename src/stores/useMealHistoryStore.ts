import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { newId } from '@/lib/id';

export interface CookedMeal {
  id: string;
  recipeId: string;
  servings: number;
  cookedAt: string;
}

interface MealHistoryState {
  cookedMeals: CookedMeal[];
  recordCookedMeal: (recipeId: string, servings: number) => void;
  clearHistory: () => void;
  reset: () => void;
}

export const useMealHistoryStore = create<MealHistoryState>()(
  persist(
    (set) => ({
      cookedMeals: [],
      recordCookedMeal: (recipeId, servings) =>
        set((state) => ({
          cookedMeals: [{ id: newId(), recipeId, servings, cookedAt: new Date().toISOString() }, ...state.cookedMeals].slice(0, 100),
        })),
      clearHistory: () => set({ cookedMeals: [] }),
      reset: () => set({ cookedMeals: [] }),
    }),
    {
      name: 'cookbook.history.v1',
      version: 1,
      partialize: (state) => ({ cookedMeals: state.cookedMeals }),
      migrate: (persisted) => {
        const state = persisted as Partial<MealHistoryState> | undefined;
        return {
          cookedMeals: Array.isArray(state?.cookedMeals)
            ? state.cookedMeals.filter((meal): meal is CookedMeal =>
                Boolean(meal) && typeof meal.id === 'string' && typeof meal.recipeId === 'string' &&
                typeof meal.servings === 'number' && typeof meal.cookedAt === 'string',
              )
            : [],
        };
      },
    },
  ),
);
