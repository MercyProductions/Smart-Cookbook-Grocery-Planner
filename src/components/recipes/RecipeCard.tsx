import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, Heart, Plus, Users } from 'lucide-react';
import type { Recipe } from '@/types';
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '@/lib/labels';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { useMealPlanStore } from '@/stores/useMealPlanStore';
import { useToastStore } from '@/stores/useToastStore';
import { Card } from '@/components/ui/Card';
import { RecipeImage } from './RecipeImage';
import { DifficultyBadge } from './DifficultyBadge';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;
  const inPlan = useMealPlanStore((state) => state.entries.some((entry) => entry.recipeId === recipe.id));
  const addRecipe = useMealPlanStore((state) => state.addRecipe);
  const removeRecipe = useMealPlanStore((state) => state.removeRecipe);
  const isFavorite = useFavoritesStore((state) => state.favoriteIds.includes(recipe.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const showToast = useToastStore((state) => state.showToast);

  function handleToggleMealPlan(event: MouseEvent) {
    event.preventDefault();
    if (inPlan) {
      removeRecipe(recipe.id);
      showToast('Removed from meal plan');
    } else {
      addRecipe(recipe.id, recipe.servings);
      showToast('Added to meal plan');
    }
  }

  function handleToggleFavorite(event: MouseEvent) {
    event.preventDefault();
    toggleFavorite(recipe.id);
    showToast(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  }

  return (
    <Card hover className="group overflow-hidden">
      <Link to={`/recipes/${recipe.id}`} className="block">
        <div className="relative">
          <RecipeImage image={recipe.image} category={recipe.category} className="aspect-[4/3] w-full" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-0.5 text-xs font-medium text-text shadow-sm backdrop-blur">
            {CATEGORY_EMOJI[recipe.category]} {CATEGORY_LABELS[recipe.category]}
          </span>
          {recipe.isCustom && (
            <span className="absolute left-3 bottom-3 inline-flex items-center rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
              My recipe
            </span>
          )}

          <button
            type="button"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
            title={isFavorite ? 'Favorite' : 'Add to favorites'}
            className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-colors hover:text-primary ${
              isFavorite ? 'text-primary' : 'text-text-muted'
            }`}
            onClick={handleToggleFavorite}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          <button
            type="button"
            aria-label={inPlan ? 'Remove from meal plan' : 'Add to meal plan'}
            aria-pressed={inPlan}
            title={inPlan ? 'In meal plan' : 'Add to meal plan'}
            onClick={handleToggleMealPlan}
            className={`absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition-opacity duration-200 ${
              inPlan ? 'bg-accent opacity-100' : 'bg-primary opacity-100 lg:opacity-0 lg:group-hover:opacity-100'
            }`}
          >
            {inPlan ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>

        <div className="p-4">
          <h3 className="line-clamp-2 font-semibold tracking-tight text-text">{recipe.title}</h3>
          <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock size={13} />
              {totalMinutes} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={13} />
              {recipe.servings}
            </span>
            <DifficultyBadge difficulty={recipe.difficulty} />
          </div>
        </div>
      </Link>
    </Card>
  );
}
