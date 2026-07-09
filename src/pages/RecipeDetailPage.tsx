import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Clock, Copy, Heart, Plus, ShoppingBasket, Users } from 'lucide-react';
import { SEED_RECIPES } from '@/data/recipes';
import { CATEGORY_LABELS } from '@/lib/labels';
import { scaleIngredient } from '@/lib/scaling';
import { formatIngredientLine } from '@/lib/units';
import { getSimilarRecipes } from '@/lib/similar';
import { useMealPlanStore } from '@/stores/useMealPlanStore';
import { useToastStore } from '@/stores/useToastStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { RecipeImage } from '@/components/recipes/RecipeImage';
import { DifficultyBadge } from '@/components/recipes/DifficultyBadge';
import { TagPill } from '@/components/recipes/TagPill';
import { NutritionCard } from '@/components/recipes/NutritionCard';
import { SimilarRecipes } from '@/components/recipes/SimilarRecipes';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const recipe = useMemo(() => SEED_RECIPES.find((r) => r.id === id), [id]);
  const [servings, setServings] = useState(recipe?.servings ?? 1);
  const inPlan = useMealPlanStore((state) =>
    recipe ? state.entries.some((entry) => entry.recipeId === recipe.id) : false,
  );
  const addRecipe = useMealPlanStore((state) => state.addRecipe);
  const removeRecipe = useMealPlanStore((state) => state.removeRecipe);
  const showToast = useToastStore((state) => state.showToast);

  if (!recipe) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-5xl">🔍</span>
        <h1 className="text-xl font-semibold tracking-tight">Recipe not found</h1>
        <p className="text-text-muted">This recipe may have been removed.</p>
        <Link
          to="/recipes"
          className="mt-2 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Back to recipes
        </Link>
      </div>
    );
  }

  const factor = servings / recipe.servings;
  const scaledIngredients = recipe.ingredients.map((ingredient) => scaleIngredient(ingredient, factor));
  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;
  const similarRecipes = getSimilarRecipes(recipe, SEED_RECIPES, 4);

  const recipeId = recipe.id;

  function handleToggleMealPlan() {
    if (inPlan) {
      removeRecipe(recipeId);
      showToast('Removed from meal plan');
    } else {
      addRecipe(recipeId, servings);
      showToast('Added to meal plan');
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card className="overflow-hidden">
            <RecipeImage image={recipe.image} category={recipe.category} className="aspect-[4/3] w-full" />
            <div className="space-y-4 p-5">
              <div>
                <span className="text-xs font-medium text-primary">{CATEGORY_LABELS[recipe.category]}</span>
                <h1 className="mt-1 text-xl font-semibold tracking-tight">{recipe.title}</h1>
                <p className="mt-1 text-sm text-text-muted">{recipe.description}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {recipe.tags.map((tag) => (
                  <TagPill key={tag} tag={tag} />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} /> Prep {recipe.prepMinutes} min
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} /> Cook {recipe.cookMinutes} min
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} /> Total {totalMinutes} min
                </span>
                <DifficultyBadge difficulty={recipe.difficulty} />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="flex items-center gap-1.5 text-sm text-text-muted">
                  <Users size={15} /> Servings
                </span>
                <Stepper value={servings} onChange={setServings} min={1} max={20} label="Servings" />
              </div>

              <div className="space-y-2 pt-1">
                <Button
                  className="w-full"
                  variant={inPlan ? 'secondary' : 'primary'}
                  onClick={handleToggleMealPlan}
                >
                  {inPlan ? <Check size={16} /> : <Plus size={16} />}
                  {inPlan ? 'In Meal Plan' : 'Add to Meal Plan'}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    title="Favorites are available in a later phase"
                    onClick={(event) => event.preventDefault()}
                  >
                    <Heart size={16} />
                    Favorite
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    title="Grocery list is available in a later phase"
                    onClick={(event) => event.preventDefault()}
                  >
                    <ShoppingBasket size={16} />
                    Add ingredients
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  className="w-full"
                  title="Recipe editing is available in a later phase"
                  onClick={(event) => event.preventDefault()}
                >
                  <Copy size={16} />
                  Duplicate &amp; edit
                </Button>
              </div>
            </div>
          </Card>

          <div className="mt-4">
            <NutritionCard nutrition={recipe.nutrition} />
          </div>
        </div>

        <div>
          <section>
            <h2 className="text-lg font-semibold tracking-tight">Ingredients</h2>
            <p className="text-xs text-text-muted">For {servings} {servings === 1 ? 'serving' : 'servings'}</p>
            <ul className="mt-3 space-y-2">
              {scaledIngredients.map((ingredient, index) => (
                <li
                  key={`${ingredient.name}-${index}`}
                  className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-text">
                    {formatIngredientLine(ingredient)}
                    {ingredient.note && <span className="text-text-muted"> ({ingredient.note})</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold tracking-tight">Instructions</h2>
            <ol className="mt-3 space-y-4">
              {recipe.instructions.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm leading-relaxed text-text">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <p className="pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <SimilarRecipes recipes={similarRecipes} />
        </div>
      </div>
    </div>
  );
}
