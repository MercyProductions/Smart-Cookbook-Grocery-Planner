import type { Recipe } from '@/types';
import { RecipeGrid } from './RecipeGrid';

export function SimilarRecipes({ recipes }: { recipes: Recipe[] }) {
  if (recipes.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold tracking-tight">You might also like</h2>
      <div className="mt-4">
        <RecipeGrid recipes={recipes} />
      </div>
    </section>
  );
}
