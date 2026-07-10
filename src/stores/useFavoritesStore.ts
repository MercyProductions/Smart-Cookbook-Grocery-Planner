import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favoriteIds: string[];
  addFavorite: (recipeId: string) => void;
  removeFavorite: (recipeId: string) => void;
  toggleFavorite: (recipeId: string) => void;
  clear: () => void;
}

function cleanIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0)));
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favoriteIds: [],

      addFavorite: (recipeId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(recipeId)
            ? state.favoriteIds
            : [...state.favoriteIds, recipeId],
        })),

      removeFavorite: (recipeId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((id) => id !== recipeId),
        })),

      toggleFavorite: (recipeId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(recipeId)
            ? state.favoriteIds.filter((id) => id !== recipeId)
            : [...state.favoriteIds, recipeId],
        })),

      clear: () => set({ favoriteIds: [] }),
    }),
    {
      name: 'cookbook.favorites.v1',
      version: 1,
      partialize: (state) => ({ favoriteIds: state.favoriteIds }),
      migrate: (persisted) => {
        const state = persisted as Partial<FavoritesState> | undefined;
        return { favoriteIds: cleanIds(state?.favoriteIds) };
      },
    },
  ),
);
