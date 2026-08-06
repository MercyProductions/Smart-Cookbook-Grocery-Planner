import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dices, Heart, Search, ShoppingBasket, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import type { GroceryLine, Recipe, RecipeCategory } from '@/types';
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '@/lib/labels';
import { buildGroceryList, excludePantryItems, overlayGroceryState } from '@/lib/grocery';
import { addDays, entryMatchesDateRange, startOfWeek, todayKey } from '@/lib/dates';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { useGroceryStore } from '@/stores/useGroceryStore';
import { useMealPlanStore } from '@/stores/useMealPlanStore';
import { useMealHistoryStore } from '@/stores/useMealHistoryStore';
import { usePantryStore } from '@/stores/usePantryStore';
import { useAllRecipes } from '@/stores/useRecipeStore';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { RecipeImage } from '@/components/recipes/RecipeImage';
import { Button } from '@/components/ui/Button';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as RecipeCategory[];

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function featuredForToday(recipes: Recipe[]): Recipe[] {
  const dateKey = new Date().toISOString().slice(0, 10);
  return [...recipes]
    .sort((a, b) => hashString(`${dateKey}-${a.id}`) - hashString(`${dateKey}-${b.id}`))
    .slice(0, 4);
}

function pickRecommendation(
  recipes: Recipe[],
  favoriteIds: string[],
  pantryNames: string[],
  recentRecipeIds: string[],
): Recipe | undefined {
  const favorites = new Set(favoriteIds);
  const pantry = new Set(pantryNames);
  const recent = new Set(recentRecipeIds.slice(0, 6));
  const withoutRecent = recipes.filter((recipe) => !recent.has(recipe.id));
  const candidates = withoutRecent.length >= 12 ? withoutRecent : recipes;
  const scored = candidates
    .map((recipe) => ({
      recipe,
      score: (favorites.has(recipe.id) ? 4 : 0) + recipe.ingredients.filter((ingredient) => pantry.has(ingredient.name)).length,
    }))
    .sort((a, b) => b.score - a.score);
  const pool = scored.slice(0, Math.min(40, scored.length));
  return pool[Math.floor(Math.random() * pool.length)]?.recipe;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const allRecipes = useAllRecipes();
  const entries = useMealPlanStore((state) => state.entries);
  const checkedKeys = useGroceryStore((state) => state.checkedKeys);
  const removedKeys = useGroceryStore((state) => state.removedKeys);
  const customItems = useGroceryStore((state) => state.customItems);
  const itemOverrides = useGroceryStore((state) => state.itemOverrides);
  const excludePantry = useGroceryStore((state) => state.excludePantry);
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const cookedMeals = useMealHistoryStore((state) => state.cookedMeals);
  const pantryItems = usePantryStore((state) => state.items);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [pickedRecipe, setPickedRecipe] = useState<Recipe | undefined>();

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 300);
    return () => window.clearTimeout(timeout);
  }, []);

  const groceryLines = useMemo<GroceryLine[]>(() => {
    const weekStart = startOfWeek(todayKey());
    const scopedEntries = entries.filter((entry) => entryMatchesDateRange(entry, weekStart, addDays(weekStart, 6)));
    const generated = buildGroceryList(scopedEntries, allRecipes);
    const items = excludePantry ? excludePantryItems(generated, pantryItems.map((item) => item.name)) : generated;
    return overlayGroceryState(items, { checkedKeys, removedKeys, customItems, itemOverrides });
  }, [allRecipes, customItems, entries, excludePantry, itemOverrides, pantryItems, checkedKeys, removedKeys]);

  const featured = useMemo(() => featuredForToday(allRecipes), [allRecipes]);
  const plannedRecipes = entries
    .map((entry) => ({ entry, recipe: allRecipes.find((recipe) => recipe.id === entry.recipeId) }))
    .filter((item): item is { entry: (typeof entries)[number]; recipe: Recipe } => Boolean(item.recipe))
    .slice(0, 4);
  const cookedWithRecipes = cookedMeals
    .map((meal) => ({ meal, recipe: allRecipes.find((recipe) => recipe.id === meal.recipeId) }))
    .filter((item): item is { meal: (typeof cookedMeals)[number]; recipe: Recipe } => Boolean(item.recipe));
  const recentlyCooked = cookedWithRecipes.filter((item, index, list) =>
    list.findIndex((candidate) => candidate.recipe.id === item.recipe.id) === index,
  ).slice(0, 4);
  const frequentlyCooked = Array.from(
    cookedWithRecipes.reduce((counts, item) => {
      const current = counts.get(item.recipe.id) ?? { recipe: item.recipe, count: 0 };
      counts.set(item.recipe.id, { ...current, count: current.count + 1 });
      return counts;
    }, new Map<string, { recipe: Recipe; count: number }>() ).values(),
  ).sort((left, right) => right.count - left.count || left.recipe.title.localeCompare(right.recipe.title)).slice(0, 3);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/recipes?q=${encodeURIComponent(trimmed)}` : '/recipes');
  }

  function handlePickForMe() {
    setPickedRecipe(pickRecommendation(
      allRecipes,
      favoriteIds,
      pantryItems.map((item) => item.name),
      cookedMeals.map((meal) => meal.recipeId),
    ));
  }

  return (
    <div>
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="p-5 md:p-6">
          <h1 className="text-3xl font-semibold tracking-tight">What sounds good today?</h1>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            Browse recipes, plan a few meals, and let the grocery list do the tidy merging for you.
          </p>
          <form onSubmit={handleSearch} className="relative mt-5">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search recipes or ingredients"
              className="h-11 w-full rounded-lg border border-border bg-surface pl-9 pr-28 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 inline-flex h-8 items-center rounded-lg bg-primary px-3 text-xs font-medium text-white hover:bg-primary-hover"
            >
              Search
            </button>
          </form>
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <StatCard icon={UtensilsCrossed} label="Meal plan" value={entries.length} to="/meal-plan" />
          <StatCard
            icon={ShoppingBasket}
            label="Groceries left"
            value={groceryLines.filter((line) => !line.checked).length}
            to="/grocery-list"
          />
          <StatCard icon={Heart} label="Favorites" value={favoriteIds.length} to="/favorites" />
        </div>
      </section>

      <section className="mt-8 border-y border-border py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">What should we eat?</h2>
            <p className="mt-1 text-sm text-text-muted">A fresh suggestion that favors your pantry and avoids meals you cooked recently.</p>
          </div>
          <Button onClick={handlePickForMe}><Dices size={16} />Pick for me</Button>
        </div>
        {pickedRecipe && (
          <Link to={`/recipes/${pickedRecipe.id}`} className="mt-4 flex items-center gap-4 rounded-lg border border-border bg-card p-3 hover:bg-primary-soft/50">
            <RecipeImage image={pickedRecipe.image} category={pickedRecipe.category} className="h-16 w-16 rounded-lg" />
            <span className="min-w-0">
              <span className="block text-xs font-medium text-primary">Tonight's idea</span>
              <span className="mt-1 block line-clamp-1 font-semibold tracking-tight">{pickedRecipe.title}</span>
              <span className="mt-1 block text-xs text-text-muted">{pickedRecipe.prepMinutes + pickedRecipe.cookMinutes} min · {pickedRecipe.servings} servings</span>
            </span>
          </Link>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Featured</h2>
          <Link to="/recipes" className="text-sm font-medium text-primary hover:text-primary-hover">
            Browse all
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </Card>
              ))
            : featured.map((recipe) => (
                <Link key={recipe.id} to={`/recipes/${recipe.id}`}>
                  <Card hover className="overflow-hidden">
                    <RecipeImage image={recipe.image} category={recipe.category} className="aspect-[4/3] w-full" />
                    <div className="p-4">
                      <p className="text-xs font-medium text-primary">{CATEGORY_LABELS[recipe.category]}</p>
                      <h3 className="mt-1 line-clamp-1 font-semibold tracking-tight">{recipe.title}</h3>
                      <p className="mt-1 text-xs text-text-muted">
                        {recipe.prepMinutes + recipe.cookMinutes} min - {recipe.servings} servings
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
        </div>
      </section>

      {recentlyCooked.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Recently cooked</h2>
            <span className="text-xs text-text-muted">Your cooking history stays on this device.</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {recentlyCooked.map(({ meal, recipe }) => (
              <Link key={meal.id} to={`/recipes/${recipe.id}`} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:bg-primary-soft/50">
                <RecipeImage image={recipe.image} category={recipe.category} className="h-12 w-12 rounded-lg" />
                <span className="min-w-0">
                  <span className="block line-clamp-1 text-sm font-semibold">{recipe.title}</span>
                  <span className="mt-1 block text-xs text-text-muted">Cooked {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(meal.cookedAt))}</span>
                </span>
              </Link>
            ))}
          </div>
          {frequentlyCooked.length > 0 && (
            <p className="mt-4 text-sm text-text-muted">
              Most cooked: {frequentlyCooked.map((item) => `${item.recipe.title} (${item.count})`).join(', ')}
            </p>
          )}
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Quick links</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              to={`/recipes?category=${category}`}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:bg-primary-soft hover:text-text"
            >
              <span aria-hidden="true">{CATEGORY_EMOJI[category]}</span>
              {CATEGORY_LABELS[category]}
            </Link>
          ))}
        </div>
      </section>

      {plannedRecipes.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Your meal plan</h2>
            <Link to="/grocery-list" className="text-sm font-medium text-primary hover:text-primary-hover">
              View grocery list
            </Link>
          </div>
          <Card className="mt-3 p-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {plannedRecipes.map(({ entry, recipe }) => (
                <Link
                  key={entry.recipeId}
                  to={`/recipes/${recipe.id}`}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-primary-soft/60"
                >
                  <RecipeImage image={recipe.image} category={recipe.category} className="h-14 w-14 rounded-xl" />
                  <span className="min-w-0">
                    <span className="block line-clamp-1 text-sm font-medium">{recipe.title}</span>
                    <span className="text-xs text-text-muted">{entry.servings} servings</span>
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  to: string;
}) {
  return (
    <Link to={to}>
      <Card hover className="flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon size={18} />
        </span>
        <span>
          <span className="block text-2xl font-semibold tabular-nums">{value}</span>
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</span>
        </span>
      </Card>
    </Link>
  );
}
