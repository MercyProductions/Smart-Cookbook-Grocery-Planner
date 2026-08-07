import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CircleUserRound,
  Dices,
  Heart,
  Search,
  ShoppingBasket,
  Sparkles,
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
import { useAccountStore } from '@/stores/useAccountStore';
import { getRecipeAllergenMatches } from '@/lib/allergens';
import { Skeleton } from '@/components/ui/Skeleton';
import { RecipeImage } from '@/components/recipes/RecipeImage';
import { Button } from '@/components/ui/Button';
import dinnerImage from '@/assets/recipe-dinner.png';

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
    .slice(0, 3);
}

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
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
  const displayName = useAccountStore((state) => state.displayName);
  const dietaryPreferences = useAccountStore((state) => state.dietaryPreferences);
  const allergies = useAccountStore((state) => state.allergies);
  const hideAllergenMatches = useAccountStore((state) => state.hideAllergenMatches);
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

  const discoveryRecipes = useMemo(
    () =>
      allRecipes.filter((recipe) => {
        if (dietaryPreferences.length > 0 && !dietaryPreferences.every((tag) => recipe.tags.includes(tag))) return false;
        if (hideAllergenMatches && allergies.length > 0 && getRecipeAllergenMatches(recipe, allergies).length > 0) return false;
        return true;
      }),
    [allRecipes, allergies, dietaryPreferences, hideAllergenMatches],
  );
  const featured = useMemo(() => featuredForToday(discoveryRecipes), [discoveryRecipes]);
  const plannedRecipes = entries
    .map((entry) => ({ entry, recipe: allRecipes.find((recipe) => recipe.id === entry.recipeId) }))
    .filter((item): item is { entry: (typeof entries)[number]; recipe: Recipe } => Boolean(item.recipe))
    .slice(0, 3);
  const cookedWithRecipes = cookedMeals
    .map((meal) => ({ meal, recipe: allRecipes.find((recipe) => recipe.id === meal.recipeId) }))
    .filter((item): item is { meal: (typeof cookedMeals)[number]; recipe: Recipe } => Boolean(item.recipe));
  const recentlyCooked = cookedWithRecipes
    .filter((item, index, list) => list.findIndex((candidate) => candidate.recipe.id === item.recipe.id) === index)
    .slice(0, 3);
  const groceryRemaining = groceryLines.filter((line) => !line.checked).length;
  const preferenceCount = dietaryPreferences.length + allergies.length;
  const firstName = displayName.trim() || 'Chef';

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/recipes?q=${encodeURIComponent(trimmed)}` : '/recipes');
  }

  function handlePickForMe() {
    setPickedRecipe(
      pickRecommendation(
        discoveryRecipes,
        favoriteIds,
        pantryItems.map((item) => item.name),
        cookedMeals.map((meal) => meal.recipeId),
      ),
    );
  }

  return (
    <div className="pb-12">
      <header className="flex flex-col gap-5 border-b border-border pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">{timeOfDayGreeting()}</p>
          <h1 className="mt-2 font-display text-[45px] leading-none text-text sm:text-[56px]">Welcome back, {firstName}.</h1>
          <p className="mt-3 text-sm leading-6 text-text-muted">Make a little room for something good today.</p>
        </div>
        <Link to="/account" className="group inline-flex items-center gap-3 self-start border border-border bg-card px-3 py-2.5 transition-colors hover:border-text/25 hover:bg-surface md:self-auto">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><CircleUserRound size={18} /></span>
          <span><span className="block text-sm font-semibold text-text">Your kitchen</span><span className="block text-xs text-text-muted">{preferenceCount > 0 ? `${preferenceCount} preferences active` : 'Set your preferences'}</span></span>
          <ArrowRight size={16} className="text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>
      </header>

      <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.7fr)]">
        <section className="grid overflow-hidden rounded-lg border border-border bg-card md:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
          <div className="flex min-h-[335px] flex-col justify-center p-6 md:p-9">
            <p className="text-sm font-semibold text-primary">Tonight&apos;s table</p>
            <h2 className="mt-3 max-w-md font-display text-[38px] leading-[1.04] text-text md:text-[46px]">Make something you&apos;ll want to eat again.</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-text-muted">Search the whole collection, or let the kitchen help you get dinner moving.</p>
            <form onSubmit={handleSearch} className="relative mt-6 max-w-[470px]">
              <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dishes or ingredients" className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-24 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none" />
              <button type="submit" className="absolute right-1 top-1 inline-flex h-9 items-center rounded-md bg-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-hover">Search</button>
            </form>
          </div>
          <img src={dinnerImage} alt="Tomato basil pasta" className="min-h-[250px] h-full w-full object-cover" />
        </section>

        <section className="flex min-h-[335px] flex-col justify-between rounded-lg bg-[#236544] p-6 text-white md:p-7">
          <div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-[#ffb0a8]"><CalendarDays size={19} /></span>
            <p className="mt-6 text-sm font-semibold text-[#ffb0a8]">This week</p>
            <h2 className="mt-2 font-display text-[36px] leading-[1.02]">What&apos;s on the menu?</h2>
          </div>
          {plannedRecipes.length > 0 ? (
            <div className="mt-6 space-y-3 border-t border-white/15 pt-4">
              {plannedRecipes.map(({ entry, recipe }) => <Link key={entry.id ?? entry.recipeId} to={`/recipes/${recipe.id}`} className="flex items-center justify-between gap-3 text-sm font-semibold transition-colors hover:text-[#ffb0a8]"><span className="line-clamp-1">{recipe.title}</span><span className="shrink-0 text-xs font-medium text-white/60">{entry.servings} servings</span></Link>)}
            </div>
          ) : (
            <p className="mt-6 border-t border-white/15 pt-4 text-sm leading-6 text-white/70">Give the week a little shape, then let the grocery list catch up.</p>
          )}
          <Link to="/meal-plan" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#ffb0a8]">Open meal plan <ArrowRight size={16} /></Link>
        </section>
      </section>

      <section className="mt-5 grid border border-border bg-card sm:grid-cols-3">
        <StatCard icon={CalendarDays} label="Meals on your plan" value={entries.length} to="/meal-plan" />
        <StatCard icon={ShoppingBasket} label="Items still to buy" value={groceryRemaining} to="/grocery-list" />
        <StatCard icon={Heart} label="Saved favourites" value={favoriteIds.length} to="/favorites" />
      </section>

      <section className="mt-12 grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.7fr)]">
        <div>
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-sm font-semibold text-primary">Inspiration, sorted</p><h2 className="mt-1 font-display text-[36px] leading-tight text-text">Something worth making</h2></div>
            <Link to="/recipes" className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-text hover:text-primary">Browse recipes <ArrowRight size={16} /></Link>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="overflow-hidden rounded-lg border border-border bg-card"><Skeleton className="aspect-[4/3] w-full rounded-none" /><div className="space-y-2 p-4"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-3 w-1/2" /></div></div>)
              : featured.map((recipe) => <FeaturedRecipe key={recipe.id} recipe={recipe} />)}
          </div>
        </div>

        <section className="flex min-h-[360px] flex-col justify-between rounded-lg border border-[#c5d8cd] bg-[#e8f0ea] p-6 md:p-7">
          <div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#236544] text-white"><Dices size={19} /></span>
            <p className="mt-6 text-sm font-semibold text-[#236544]">Feeling undecided?</p>
            <h2 className="mt-2 font-display text-[36px] leading-[1.02] text-text">Let the cookbook choose.</h2>
            <p className="mt-4 text-sm leading-6 text-text-muted">A smart suggestion shaped by your pantry, preferences, and recent meals.</p>
          </div>
          <div className="mt-6">
            <Button onClick={handlePickForMe} className="w-full">Pick for me <Sparkles size={16} /></Button>
            {pickedRecipe && <Link to={`/recipes/${pickedRecipe.id}`} className="mt-4 flex items-center gap-3 border-t border-[#c5d8cd] pt-4 transition-opacity hover:opacity-75"><RecipeImage image={pickedRecipe.image} category={pickedRecipe.category} className="h-14 w-14 shrink-0 rounded-md" /><span className="min-w-0"><span className="block text-[11px] font-semibold uppercase text-[#236544]">Tonight&apos;s idea</span><span className="mt-1 block line-clamp-1 font-display text-lg text-text">{pickedRecipe.title}</span><span className="mt-1 block text-xs text-text-muted">{pickedRecipe.prepMinutes + pickedRecipe.cookMinutes} min / {pickedRecipe.servings} servings</span></span></Link>}
          </div>
        </section>
      </section>

      <section className="mt-12 border-y border-border py-8 md:py-10">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-primary">Browse by course</p><h2 className="mt-1 font-display text-[36px] leading-tight text-text">A recipe for every mood</h2></div><p className="max-w-sm text-sm leading-6 text-text-muted">{allRecipes.length.toLocaleString()} recipes, from a quick breakfast to a dinner worth lingering over.</p></div>
        <div className="mt-7 grid grid-cols-2 divide-x divide-y divide-border border border-border bg-card sm:grid-cols-5 sm:divide-y-0">
          {CATEGORIES.map((category) => <Link key={category} to={`/recipes?category=${category}`} className="group flex min-h-28 flex-col justify-between p-4 transition-colors hover:bg-primary-soft sm:min-h-32"><span className="text-2xl" aria-hidden="true">{CATEGORY_EMOJI[category]}</span><span className="mt-3 inline-flex items-center justify-between gap-2 text-sm font-semibold text-text group-hover:text-primary">{CATEGORY_LABELS[category]} <ArrowRight size={14} /></span></Link>)}
        </div>
      </section>

      {recentlyCooked.length > 0 && (
        <section className="mt-12">
          <div><p className="text-sm font-semibold text-primary">Your kitchen</p><h2 className="mt-1 font-display text-[36px] leading-tight text-text">Made before, loved again</h2></div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {recentlyCooked.map(({ meal, recipe }) => <Link key={meal.id} to={`/recipes/${recipe.id}`} className="group flex items-center gap-3 border-b border-border pb-3 transition-colors hover:border-primary"><RecipeImage image={recipe.image} category={recipe.category} className="h-16 w-16 shrink-0 rounded-md" /><span className="min-w-0"><span className="block line-clamp-1 font-display text-lg group-hover:text-primary">{recipe.title}</span><span className="mt-1 block text-xs text-text-muted">Cooked {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(meal.cookedAt))}</span></span></Link>)}
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
      <RecipeImage image={recipe.image} category={recipe.category} className="aspect-[4/3] w-full" />
      <div className="p-4"><span className="text-[11px] font-semibold uppercase text-primary">{CATEGORY_LABELS[recipe.category]}</span><h3 className="mt-1 line-clamp-1 font-display text-[22px] leading-6 text-text">{recipe.title}</h3><p className="mt-3 border-t border-border pt-3 text-xs text-text-muted">{totalMinutes} min / {recipe.servings} servings</p></div>
    </Link>
  );
}

function StatCard({ icon: Icon, label, value, to }: { icon: LucideIcon; label: string; value: number; to: string }) {
  return (
    <Link to={to} className="group flex items-center gap-3 border-b border-border p-5 transition-colors hover:bg-surface last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><Icon size={18} /></span><span><span className="block font-display text-3xl leading-none text-text">{value}</span><span className="mt-1 block text-xs font-semibold text-text-muted group-hover:text-primary">{label}</span></span></Link>
  );
}
