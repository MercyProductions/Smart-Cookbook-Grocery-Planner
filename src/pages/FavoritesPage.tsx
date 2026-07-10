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
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Favorites</h1>
      <p className="mt-1 text-sm text-text-muted">Recipes you saved for later.</p>

      <div className="mt-6">
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
