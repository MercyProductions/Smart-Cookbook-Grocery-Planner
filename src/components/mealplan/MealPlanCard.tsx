import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { Recipe } from '@/types';
import { DIFFICULTY_LABELS } from '@/lib/labels';
import { useMealPlanStore } from '@/stores/useMealPlanStore';
import { Card } from '@/components/ui/Card';
import { Stepper } from '@/components/ui/Stepper';
import { RecipeImage } from '@/components/recipes/RecipeImage';

interface MealPlanCardProps {
  recipe: Recipe;
  servings: number;
}

export function MealPlanCard({ recipe, servings }: MealPlanCardProps) {
  const setServings = useMealPlanStore((state) => state.setServings);
  const removeRecipe = useMealPlanStore((state) => state.removeRecipe);
  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;

  return (
    <Card className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
      <Link to={`/recipes/${recipe.id}`} className="shrink-0">
        <RecipeImage image={recipe.image} category={recipe.category} className="h-20 w-full rounded-lg sm:w-20" />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/recipes/${recipe.id}`}
          className="line-clamp-1 font-display text-xl text-text hover:text-primary"
        >
          {recipe.title}
        </Link>
        <p className="mt-0.5 text-xs text-text-muted">
          {totalMinutes} min · {DIFFICULTY_LABELS[recipe.difficulty]}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Stepper
          value={servings}
          onChange={(value) => setServings(recipe.id, value)}
          min={1}
          max={20}
          label={`Servings for ${recipe.title}`}
        />
        <button
          type="button"
          aria-label={`Remove ${recipe.title} from meal plan`}
          onClick={() => removeRecipe(recipe.id)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-primary-soft hover:text-primary"
        >
          <X size={16} />
        </button>
      </div>
    </Card>
  );
}
