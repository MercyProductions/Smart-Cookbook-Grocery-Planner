import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, ChefHat, Clock, Copy, Heart, Pencil, Plus, ShoppingBasket, Trash2, Users } from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/labels';
import { scaleIngredient } from '@/lib/scaling';
import { formatIngredientLine } from '@/lib/units';
import { getSimilarRecipes } from '@/lib/similar';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { useMealPlanStore } from '@/stores/useMealPlanStore';
import { useAllRecipes, useRecipeById, useRecipeStore } from '@/stores/useRecipeStore';
import { useToastStore } from '@/stores/useToastStore';
import { useGroceryStore } from '@/stores/useGroceryStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Stepper } from '@/components/ui/Stepper';
import { RecipeImage } from '@/components/recipes/RecipeImage';
import { DifficultyBadge } from '@/components/recipes/DifficultyBadge';
import { TagPill } from '@/components/recipes/TagPill';
import { NutritionCard } from '@/components/recipes/NutritionCard';
import { SimilarRecipes } from '@/components/recipes/SimilarRecipes';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const allRecipes = useAllRecipes();
  const recipe = useRecipeById(id);
  const [servings, setServings] = useState(recipe?.servings ?? 1);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const inPlan = useMealPlanStore((state) =>
    recipe ? state.entries.some((entry) => entry.recipeId === recipe.id) : false,
  );
  const addRecipe = useMealPlanStore((state) => state.addRecipe);
  const removeRecipe = useMealPlanStore((state) => state.removeRecipe);
  const isFavorite = useFavoritesStore((state) => (recipe ? state.favoriteIds.includes(recipe.id) : false));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const showToast = useToastStore((state) => state.showToast);
  const addCustomItem = useGroceryStore((state) => state.addCustomItem);

  useEffect(() => {
    if (recipe) setServings(recipe.servings);
  }, [recipe]);

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
  const similarRecipes = getSimilarRecipes(recipe, allRecipes, 4);

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

  function handleToggleFavorite() {
    toggleFavorite(recipeId);
    showToast(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  }

  function handleAddIngredients() {
    scaledIngredients.forEach((ingredient) => {
      addCustomItem({
        name: ingredient.name,
        quantity: ingredient.unit === 'to-taste' ? undefined : ingredient.quantity,
        unit: ingredient.unit === 'to-taste' ? undefined : ingredient.unit,
        category: ingredient.groceryCategory,
        note: ingredient.note,
      });
    });
    showToast('Ingredients added to grocery list');
  }

  function handleDelete() {
    deleteRecipe(recipeId);
    showToast('Recipe deleted');
    setDeleteOpen(false);
    navigate('/recipes');
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
                {recipe.cuisine && <p className="mt-2 text-xs font-medium text-text-muted">{recipe.cuisine} cuisine</p>}
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
                <Button className="w-full" onClick={() => navigate(`/recipes/${recipe.id}/cook`)}>
                  <ChefHat size={16} />
                  Cook this
                </Button>
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={handleToggleMealPlan}
                >
                  {inPlan ? <Check size={16} /> : <Plus size={16} />}
                  {inPlan ? 'In Meal Plan' : 'Add to Meal Plan'}
                </Button>
                <Button variant="secondary" className="w-full" onClick={handleAddIngredients}>
                  <ShoppingBasket size={16} />
                  Add ingredients to list
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  aria-pressed={isFavorite}
                  onClick={handleToggleFavorite}
                >
                  <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                  {isFavorite ? 'Favorited' : 'Favorite'}
                </Button>
                {recipe.isCustom ? (
                  <>
                    <Link
                      to={`/recipes/${recipe.id}/edit`}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-text transition-all duration-200 hover:bg-primary-soft active:scale-[0.98]"
                    >
                      <Pencil size={16} />
                      Edit recipe
                    </Link>
                    <Button variant="danger" className="w-full" onClick={() => setDeleteOpen(true)}>
                      <Trash2 size={16} />
                      Delete recipe
                    </Button>
                  </>
                ) : (
                  <Link
                    to={`/recipes/${recipe.id}/edit`}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-transparent px-4 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-primary-soft/60 hover:text-text active:scale-[0.98]"
                  >
                    <Copy size={16} />
                    Duplicate &amp; edit
                  </Link>
                )}
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

          {recipe.notes && (
            <section className="mt-8 border-t border-border pt-6">
              <h2 className="text-lg font-semibold tracking-tight">Notes</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-muted">{recipe.notes}</p>
            </section>
          )}

          <SimilarRecipes recipes={similarRecipes} />
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete recipe?"
        body="This removes the recipe from your library, meal plan, and favorites. This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
