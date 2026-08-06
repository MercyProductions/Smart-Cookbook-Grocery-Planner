import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Dices,
  Heart,
  Search,
  ShoppingBasket,
  type LucideIcon,
} from 'lucide-react';
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
import { Skeleton } from '@/components/ui/Skeleton';
import { RecipeImage } from '@/components/recipes/RecipeImage';
import { Button } from '@/components/ui/Button';
import heroImage from '@/assets/hero-roast-chicken.png';

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
  }, [allRecipes, checkedKeys, customItems, entries, excludePantry, itemOverrides, pantryItems, removedKeys]);

  const featured = useMemo(() => featuredForToday(allRecipes), [allRecipes]);
  const plannedRecipes = entries
    .map((entry) => ({ entry, recipe: allRecipes.find((recipe) => recipe.id === entry.recipeId) }))
    .filter((item): item is { entry: (typeof entries)[number]; recipe: Recipe } => Boolean(item.recipe))
    .slice(0, 4);
  const cookedWithRecipes = cookedMeals
    .map((meal) => ({ meal, recipe: allRecipes.find((recipe) => recipe.id === meal.recipeId) }))
    .filter((item): item is { meal: (typeof cookedMeals)[number]; recipe: Recipe } => Boolean(item.recipe));
  const recentlyCooked = cookedWithRecipes
    .filter((item, index, list) => list.findIndex((candidate) => candidate.recipe.id === item.recipe.id) === index)
    .slice(0, 4);
  const frequentlyCooked = Array.from(
    cookedWithRecipes.reduce((counts, item) => {
      const current = counts.get(item.recipe.id) ?? { recipe: item.recipe, count: 0 };
      counts.set(item.recipe.id, { ...current, count: current.count + 1 });
      return counts;
    }, new Map<string, { recipe: Recipe; count: number }>()).values(),
  )
    .sort((left, right) => right.count - left.count || left.recipe.title.localeCompare(right.recipe.title))
    .slice(0, 3);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/recipes?q=${encodeURIComponent(trimmed)}` : '/recipes');
  }

  function handlePickForMe() {
    setPickedRecipe(
      pickRecommendation(
        allRecipes,
        favoriteIds,
        pantryItems.map((item) => item.name),
        cookedMeals.map((meal) => meal.recipeId),
      ),
    );
  }

  return (
    <div className="pb-10">
      <section
        className="relative isolate min-h-[455px] overflow-hidden rounded-lg border border-border bg-[#e9e6df] bg-cover bg-right bg-no-repeat md:min-h-[500px]"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="relative z-10 flex min-h-[455px] max-w-[580px] flex-col justify-center px-6 py-10 md:min-h-[500px] md:px-12">
          <p className="text-sm font-semibold text-primary">The kitchen is open</p>
          <h1 className="mt-3 font-display text-[44px] leading-[0.97] text-[#171817] sm:text-[58px]">
            What will you cook today?
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-[#5e625d]">
            A generous recipe collection for quick wins, slow Sundays, and everything in between.
          </p>
          <form onSubmit={handleSearch} className="relative mt-7 max-w-[460px]">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search dishes or ingredients"
              className="h-12 w-full rounded-lg border border-[#d8d7d1] bg-white pl-11 pr-28 text-sm text-[#171817] shadow-[0_8px_22px_rgba(23,24,23,0.06)] placeholder:text-[#6d706b] focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 inline-flex h-9 items-center rounded-md bg-primary px-3.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Search
            </button>
          </form>
          <Link
            to="/meal-plan"
            className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#171817] transition-colors hover:text-primary"
          >
            Start this week's plan <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="grid border-x border-b border-border bg-card sm:grid-cols-3">
        <StatCard icon={CalendarDays} label="On your plan" value={entries.length} to="/meal-plan" />
        <StatCard
          icon={ShoppingBasket}
          label="Still to buy"
          value={groceryLines.filter((line) => !line.checked).length}
          to="/grocery-list"
        />
        <StatCard icon={Heart} label="Saved favourites" value={favoriteIds.length} to="/favorites" />
      </section>

      <section className="mt-12 grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
        <div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">Today&apos;s table</p>
              <h2 className="mt-1 font-display text-[34px] leading-tight text-text">Something worth making</h2>
            </div>
            <Link to="/recipes" className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-text hover:text-primary">
              Browse all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-lg border border-border bg-card">
                    <Skeleton className="aspect-[4/3] w-full rounded-none" />
                    <div className="space-y-2 p-4"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                  </div>
                ))
              : featured.map((recipe) => <FeaturedRecipe key={recipe.id} recipe={recipe} />)}
          </div>
        </div>

        <section className="flex min-h-[360px] flex-col justify-between rounded-lg bg-text p-6 text-card md:p-8">
          <div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-card/10 text-primary"><Dices size={20} /></span>
            <p className="mt-7 text-sm font-semibold text-primary">Feeling undecided?</p>
            <h2 className="mt-2 font-display text-[37px] leading-[1.02]">Let the cookbook choose.</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-card/65">A thoughtful suggestion from your collection, with your pantry and recent meals in mind.</p>
          </div>
          <div className="mt-7">
            <Button onClick={handlePickForMe} className="w-full">Pick for me <ArrowRight size={16} /></Button>
            {pickedRecipe && (
              <Link to={`/recipes/${pickedRecipe.id}`} className="mt-4 flex items-center gap-3 border-t border-card/15 pt-4 transition-opacity hover:opacity-80">
                <RecipeImage image={pickedRecipe.image} category={pickedRecipe.category} className="h-14 w-14 shrink-0 rounded-md" />
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase text-card/60">Tonight&apos;s idea</span>
                  <span className="mt-1 block line-clamp-1 font-display text-lg text-card">{pickedRecipe.title}</span>
                  <span className="mt-1 block text-xs text-card/60">{pickedRecipe.prepMinutes + pickedRecipe.cookMinutes} min / {pickedRecipe.servings} servings</span>
                </span>
              </Link>
            )}
          </div>
        </section>
      </section>

      <section className="mt-14 border-y border-border py-8 md:py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-primary">Explore the pantry</p>
            <h2 className="mt-1 font-display text-[34px] leading-tight">A recipe for every mood</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-text-muted">{allRecipes.length.toLocaleString()} recipes, from weekday breakfast to a dinner worth lingering over.</p>
        </div>
        <div className="mt-7 grid grid-cols-2 divide-x divide-y divide-border border border-border bg-card sm:grid-cols-5 sm:divide-y-0">
          {CATEGORIES.map((category) => (
            <Link key={category} to={`/recipes?category=${category}`} className="group flex min-h-28 flex-col justify-between p-4 transition-colors hover:bg-primary-soft sm:min-h-32">
              <span className="text-2xl" aria-hidden="true">{CATEGORY_EMOJI[category]}</span>
              <span className="mt-3 inline-flex items-center justify-between gap-2 text-sm font-semibold text-text group-hover:text-primary">
                {CATEGORY_LABELS[category]} <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {plannedRecipes.length > 0 && (
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">Your rhythm</p>
              <h2 className="mt-1 font-display text-[34px] leading-tight">On the menu</h2>
            </div>
            <Link to="/meal-plan" className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-text hover:text-primary">Open plan <ArrowRight size={16} /></Link>
          </div>
          <div className="mt-5 grid grid-cols-1 divide-y divide-border border border-border bg-card md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
            {plannedRecipes.map(({ entry, recipe }) => (
              <Link key={entry.recipeId} to={`/recipes/${recipe.id}`} className="group flex items-center gap-3 p-4 transition-colors hover:bg-surface">
                <RecipeImage image={recipe.image} category={recipe.category} className="h-14 w-14 shrink-0 rounded-md" />
                <span className="min-w-0"><span className="block line-clamp-1 font-display text-lg group-hover:text-primary">{recipe.title}</span><span className="mt-1 block text-xs text-text-muted">{entry.servings} servings</span></span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentlyCooked.length > 0 && (
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-sm font-semibold text-primary">Your kitchen</p><h2 className="mt-1 font-display text-[34px] leading-tight">Made before, loved again</h2></div>
            {frequentlyCooked.length > 0 && <span className="hidden max-w-sm text-right text-xs leading-5 text-text-muted md:block">Most cooked: {frequentlyCooked.map((item) => item.recipe.title).join(', ')}</span>}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {recentlyCooked.map(({ meal, recipe }) => (
              <Link key={meal.id} to={`/recipes/${recipe.id}`} className="group flex items-center gap-3 border-b border-border pb-3 transition-colors hover:border-primary">
                <RecipeImage image={recipe.image} category={recipe.category} className="h-16 w-16 shrink-0 rounded-md" />
                <span className="min-w-0"><span className="block line-clamp-1 font-display text-lg group-hover:text-primary">{recipe.title}</span><span className="mt-1 block text-xs text-text-muted">Cooked {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(meal.cookedAt))}</span></span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FeaturedRecipe({ recipe }: { recipe: Recipe }) {
  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;
  return (
    <Link to={`/recipes/${recipe.id}`} className="group overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-text/20 hover:shadow-[0_12px_28px_rgba(23,24,23,0.08)]">
      <RecipeImage image={recipe.image} category={recipe.category} className="aspect-[16/10] w-full" />
      <div className="p-4">
        <span className="text-[11px] font-semibold uppercase text-primary">{CATEGORY_LABELS[recipe.category]}</span>
        <h3 className="mt-1 line-clamp-1 font-display text-[22px] leading-6 text-text">{recipe.title}</h3>
        <p className="mt-3 border-t border-border pt-3 text-xs text-text-muted">{totalMinutes} min / {recipe.servings} servings</p>
      </div>
    </Link>
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
    <Link to={to} className="group flex items-center gap-3 border-b border-border p-5 transition-colors hover:bg-surface last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><Icon size={18} /></span>
      <span><span className="block font-display text-3xl leading-none text-text">{value}</span><span className="mt-1 block text-xs font-semibold text-text-muted group-hover:text-primary">{label}</span></span>
    </Link>
  );
}
