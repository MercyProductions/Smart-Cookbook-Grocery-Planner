import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket, UtensilsCrossed } from 'lucide-react';
import type { Recipe } from '@/types';
import { SEED_RECIPES } from '@/data/recipes';
import { useMealPlanStore } from '@/stores/useMealPlanStore';
import { MealPlanCard } from '@/components/mealplan/MealPlanCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function MealPlanPage() {
  const entries = useMealPlanStore((state) => state.entries);
  const clear = useMealPlanStore((state) => state.clear);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const items = entries
    .map((entry) => ({ entry, recipe: SEED_RECIPES.find((r) => r.id === entry.recipeId) }))
    .filter((item): item is { entry: (typeof entries)[number]; recipe: Recipe } => Boolean(item.recipe));

  const totalServings = items.reduce((sum, item) => sum + item.entry.servings, 0);

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Meal Plan</h1>
        <div className="mt-6">
          <EmptyState
            icon={UtensilsCrossed}
            heading="Nothing planned yet"
            body="Browse recipes and add whatever sounds good."
            action={{ label: 'Browse recipes', to: '/recipes' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Meal Plan</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(true)}>
            Clear all
          </Button>
          <Link
            to="/grocery-list"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-white transition-all duration-200 hover:bg-primary-hover active:scale-[0.98]"
          >
            <ShoppingBasket size={14} />
            View grocery list
          </Link>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {items.map(({ entry, recipe }) => (
          <MealPlanCard key={entry.recipeId} recipe={recipe} servings={entry.servings} />
        ))}
      </div>

      <p className="mt-4 text-sm text-text-muted">
        {items.length} {items.length === 1 ? 'recipe' : 'recipes'} · {totalServings}{' '}
        {totalServings === 1 ? 'serving' : 'servings'}
      </p>

      <ConfirmDialog
        open={confirmOpen}
        title="Clear meal plan?"
        body="This removes all recipes from your meal plan. This can't be undone."
        confirmLabel="Clear all"
        danger
        onConfirm={() => {
          clear();
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
