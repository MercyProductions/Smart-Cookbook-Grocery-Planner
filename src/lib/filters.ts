import type { Recipe, RecipeFilterState } from '@/types';

export const DEFAULT_FILTER_STATE: RecipeFilterState = {
  query: '',
  category: 'all',
  tags: [],
  maxTotalMinutes: null,
  difficulty: 'all',
};

export function isFilterStateActive(filters: RecipeFilterState): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.category !== 'all' ||
    filters.tags.length > 0 ||
    filters.maxTotalMinutes !== null ||
    filters.difficulty !== 'all'
  );
}

export function applyRecipeFilters(recipes: Recipe[], filters: RecipeFilterState): Recipe[] {
  const query = filters.query.trim().toLowerCase();

  return recipes.filter((recipe) => {
    if (query) {
      const matchesTitle = recipe.title.toLowerCase().includes(query);
      const matchesIngredient = recipe.ingredients.some((ingredient) =>
        ingredient.name.toLowerCase().includes(query),
      );
      if (!matchesTitle && !matchesIngredient) return false;
    }

    if (filters.category !== 'all' && recipe.category !== filters.category) return false;

    if (filters.tags.length > 0 && !filters.tags.every((tag) => recipe.tags.includes(tag))) {
      return false;
    }

    if (filters.maxTotalMinutes !== null) {
      const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;
      if (totalMinutes > filters.maxTotalMinutes) return false;
    }

    if (filters.difficulty !== 'all' && recipe.difficulty !== filters.difficulty) return false;

    return true;
  });
}
