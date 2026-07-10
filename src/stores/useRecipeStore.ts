import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Recipe } from '@/types';
import { SEED_RECIPES } from '@/data/recipes';
import { useFavoritesStore } from './useFavoritesStore';
import { useMealPlanStore } from './useMealPlanStore';

interface RecipeState {
  customRecipes: Recipe[];
  deletedSeedIds: string[];
  getAllRecipes: () => Recipe[];
  getRecipeById: (recipeId: string) => Recipe | undefined;
  saveCustomRecipe: (recipe: Recipe) => void;
  deleteRecipe: (recipeId: string) => void;
  reset: () => void;
}

function isRecipe(value: unknown): value is Recipe {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Recipe).id === 'string' &&
    typeof (value as Recipe).title === 'string' &&
    Array.isArray((value as Recipe).ingredients) &&
    Array.isArray((value as Recipe).instructions)
  );
}

function cleanIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0)));
}

export function combineRecipes(customRecipes: Recipe[], deletedSeedIds: string[]): Recipe[] {
  const deleted = new Set(deletedSeedIds);
  return [...SEED_RECIPES.filter((recipe) => !deleted.has(recipe.id)), ...customRecipes];
}

export function useAllRecipes(): Recipe[] {
  const customRecipes = useRecipeStore((state) => state.customRecipes);
  const deletedSeedIds = useRecipeStore((state) => state.deletedSeedIds);
  return useMemo(() => combineRecipes(customRecipes, deletedSeedIds), [customRecipes, deletedSeedIds]);
}

export function useRecipeById(recipeId: string | undefined): Recipe | undefined {
  const recipes = useAllRecipes();
  return useMemo(() => recipes.find((recipe) => recipe.id === recipeId), [recipeId, recipes]);
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      customRecipes: [],
      deletedSeedIds: [],

      getAllRecipes: () => combineRecipes(get().customRecipes, get().deletedSeedIds),

      getRecipeById: (recipeId) => get().getAllRecipes().find((recipe) => recipe.id === recipeId),

      saveCustomRecipe: (recipe) =>
        set((state) => {
          const customRecipe = { ...recipe, isCustom: true };
          const existing = state.customRecipes.some((item) => item.id === customRecipe.id);
          return {
            customRecipes: existing
              ? state.customRecipes.map((item) => (item.id === customRecipe.id ? customRecipe : item))
              : [...state.customRecipes, customRecipe],
          };
        }),

      deleteRecipe: (recipeId) => {
        set((state) => {
          const seedExists = SEED_RECIPES.some((recipe) => recipe.id === recipeId);
          return {
            customRecipes: state.customRecipes.filter((recipe) => recipe.id !== recipeId),
            deletedSeedIds: seedExists
              ? Array.from(new Set([...state.deletedSeedIds, recipeId]))
              : state.deletedSeedIds,
          };
        });
        useMealPlanStore.getState().removeRecipe(recipeId);
        useFavoritesStore.getState().removeFavorite(recipeId);
      },

      reset: () => set({ customRecipes: [], deletedSeedIds: [] }),
    }),
    {
      name: 'cookbook.recipes.v1',
      version: 1,
      partialize: (state) => ({
        customRecipes: state.customRecipes,
        deletedSeedIds: state.deletedSeedIds,
      }),
      migrate: (persisted) => {
        const state = persisted as Partial<RecipeState> | undefined;
        return {
          customRecipes: Array.isArray(state?.customRecipes)
            ? state.customRecipes.filter((recipe): recipe is Recipe => isRecipe(recipe)).map((recipe) => ({
                ...recipe,
                isCustom: true,
              }))
            : [],
          deletedSeedIds: cleanIds(state?.deletedSeedIds),
        };
      },
    },
  ),
);
