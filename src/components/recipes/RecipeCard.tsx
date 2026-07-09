import { Link } from 'react-router-dom';
import { Clock, Heart, Plus, Users } from 'lucide-react';
import type { Recipe } from '@/types';
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '@/lib/labels';
import { Card } from '@/components/ui/Card';
import { RecipeImage } from './RecipeImage';
import { DifficultyBadge } from './DifficultyBadge';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;

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
            aria-label="Add to favorites"
            aria-pressed={false}
            title="Favorites are available in a later phase"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-text-muted shadow-sm backdrop-blur transition-colors hover:text-primary"
            onClick={(event) => event.preventDefault()}
          >
            <Heart size={16} />
          </button>

          <button
            type="button"
            title="Meal planning is available in a later phase"
            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white opacity-100 shadow-sm transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100"
            onClick={(event) => event.preventDefault()}
          >
            <Plus size={16} />
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
