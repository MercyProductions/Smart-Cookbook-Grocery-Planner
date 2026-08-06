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
  const durationMatch = query.match(/\b(\d+)\s*(?:min(?:ute)?s?)\b/);
  const requestedMinutes = durationMatch ? Number(durationMatch[1]) : null;
  const keywordQuery = query.replace(/\b\d+\s*(?:min(?:ute)?s?)\b/, '').trim();

  return recipes.filter((recipe) => {
    if (keywordQuery) {
      const searchText = [
        recipe.title,
        recipe.description,
        recipe.category,
        recipe.cuisine ?? '',
        recipe.notes ?? '',
        recipe.tags.join(' '),
        recipe.ingredients.map((ingredient) => ingredient.name).join(' '),
      ].join(' ').toLowerCase();
      if (!searchText.includes(keywordQuery)) return false;
    }

    if (requestedMinutes !== null && recipe.prepMinutes + recipe.cookMinutes > requestedMinutes) {
      return false;
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
