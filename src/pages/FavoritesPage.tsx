import { Heart } from 'lucide-react';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { useAllRecipes } from '@/stores/useRecipeStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { RecipeGrid } from '@/components/recipes/RecipeGrid';

export default function FavoritesPage() {
  const allRecipes = useAllRecipes();
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const favorites = allRecipes.filter((recipe) => favoriteIds.includes(recipe.id));

  return (
    <div className="pb-10">
      <section className="border-b border-border pb-7">
        <p className="text-sm font-semibold text-primary">Your personal classics</p>
        <h1 className="mt-1 font-display text-[45px] leading-none text-text">Favorites</h1>
        <p className="mt-3 text-sm text-text-muted">Recipes you saved for later, sorted and ready when hunger strikes.</p>
      </section>

      <div className="mt-7">
        {favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            heading="No favorites yet"
            body="Tap the heart on any recipe to save it here."
            action={{ label: 'Browse recipes', to: '/recipes' }}
          />
        ) : (
          <RecipeGrid recipes={favorites} />
        )}
      </div>
    </div>
  );
}
