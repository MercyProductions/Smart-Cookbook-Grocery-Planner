import type { Recipe } from '@/types';

// Same category first, then most overlapping tags, excluding the recipe itself.
export function getSimilarRecipes(recipe: Recipe, allRecipes: Recipe[], limit = 4): Recipe[] {
  const others = allRecipes.filter((candidate) => candidate.id !== recipe.id);

  const scored = others.map((candidate) => {
    const sameCategory = candidate.category === recipe.category ? 1 : 0;
    const sharedTags = candidate.tags.filter((tag) => recipe.tags.includes(tag)).length;
    return { candidate, score: sameCategory * 100 + sharedTags };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}
