import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MealPlanEntry, MealSlot } from '@/types';
import { newId } from '@/lib/id';
import { MEAL_SLOTS, todayKey } from '@/lib/dates';

interface MealPlanState {
  entries: MealPlanEntry[];
  addRecipe: (recipeId: string, servings: number) => void;
  planRecipe: (recipeId: string, servings: number, date: string, mealSlot: MealSlot) => void;
  removeEntry: (entryId: string) => void;
  removeRecipe: (recipeId: string) => void;
  setEntryServings: (entryId: string, servings: number) => void;
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
          return {
            entries: [
              ...state.entries,
              { id: newId(), recipeId, servings, date: todayKey(), mealSlot: 'dinner' },
            ],
          };
        }),
      planRecipe: (recipeId, servings, date, mealSlot) =>
        set((state) => {
          const existing = state.entries.find((entry) => entry.date === date && entry.mealSlot === mealSlot);
          const nextEntry: MealPlanEntry = { id: existing?.id ?? newId(), recipeId, servings, date, mealSlot };
          return {
            entries: existing
              ? state.entries.map((entry) => (entry.id === existing.id ? nextEntry : entry))
              : [...state.entries, nextEntry],
          };
        }),
      removeEntry: (entryId) =>
        set((state) => ({ entries: state.entries.filter((entry) => entry.id !== entryId) })),
      removeRecipe: (recipeId) =>
        set((state) => ({ entries: state.entries.filter((entry) => entry.recipeId !== recipeId) })),
      setEntryServings: (entryId, servings) =>
        set((state) => ({
          entries: state.entries.map((entry) => (entry.id === entryId ? { ...entry, servings } : entry)),
        })),
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
      version: 2,
      partialize: (state) => ({ entries: state.entries }),
      migrate: (persisted) => {
        const state = persisted as Partial<MealPlanState> | undefined;
        const entries = Array.isArray(state?.entries) ? state.entries : [];
        return {
          entries: entries.flatMap((entry, index) => {
            if (!entry || typeof entry.recipeId !== 'string' || !Number.isFinite(entry.servings) || entry.servings < 1) {
              return [];
            }
            return [{
              id: typeof entry.id === 'string' && entry.id ? entry.id : newId(),
              recipeId: entry.recipeId,
              servings: entry.servings,
              date: typeof entry.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) ? entry.date : todayKey(),
              mealSlot: MEAL_SLOTS.includes(entry.mealSlot as MealSlot)
                ? entry.mealSlot as MealSlot
                : MEAL_SLOTS[index % MEAL_SLOTS.length],
            }];
          }),
        };
      },
    },
  ),
);
