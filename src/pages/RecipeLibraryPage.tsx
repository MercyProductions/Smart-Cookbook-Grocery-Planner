import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoaderCircle, SearchX } from 'lucide-react';
import type { DietaryTag, Difficulty, RecipeCategory, RecipeFilterState } from '@/types';
import { applyRecipeFilters, DEFAULT_FILTER_STATE } from '@/lib/filters';
import { useAllRecipes } from '@/stores/useRecipeStore';
import { FilterBar } from '@/components/recipes/FilterBar';
import { RecipeGrid } from '@/components/recipes/RecipeGrid';
import { RecipeGridSkeleton } from '@/components/recipes/RecipeCardSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const VALID_CATEGORIES: RecipeCategory[] = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'];
const VALID_TAGS: DietaryTag[] = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'high-protein',
  'low-carb',
  'healthy',
  'comfort-food',
  'quick',
  'pescatarian',
  'keto',
  'paleo',
  'mediterranean',
  'kid-friendly',
  'meal-prep',
  'one-pot',
  'budget-friendly',
  'air-fryer',
  'high-fiber',
  'nut-free',
];
const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const RECIPE_BATCH_SIZE = 24;

function filtersFromSearchParams(params: URLSearchParams): RecipeFilterState {
  const category = params.get('category');
  const difficulty = params.get('difficulty');
  const maxTime = params.get('maxTime');
  const tags = params.get('tags');

  return {
    query: params.get('q') ?? '',
    category: category && VALID_CATEGORIES.includes(category as RecipeCategory) ? (category as RecipeCategory) : 'all',
    tags: tags ? (tags.split(',').filter((t) => VALID_TAGS.includes(t as DietaryTag)) as DietaryTag[]) : [],
    maxTotalMinutes: maxTime && !Number.isNaN(Number(maxTime)) ? Number(maxTime) : null,
    difficulty:
      difficulty && VALID_DIFFICULTIES.includes(difficulty as Difficulty) ? (difficulty as Difficulty) : 'all',
  };
}

function searchParamsFromFilters(filters: RecipeFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set('q', filters.query.trim());
  if (filters.category !== 'all') params.set('category', filters.category);
  if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
  if (filters.maxTotalMinutes !== null) params.set('maxTime', String(filters.maxTotalMinutes));
  if (filters.difficulty !== 'all') params.set('difficulty', filters.difficulty);
  return params;
}

export default function RecipeLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(RECIPE_BATCH_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const allRecipes = useAllRecipes();

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timeout);
  }, []);

  const filteredRecipes = useMemo(() => applyRecipeFilters(allRecipes, filters), [allRecipes, filters]);
  const visibleRecipes = useMemo(() => filteredRecipes.slice(0, visibleCount), [filteredRecipes, visibleCount]);
  const hasMore = visibleCount < filteredRecipes.length;

  useEffect(() => {
    setVisibleCount(RECIPE_BATCH_SIZE);
  }, [allRecipes, filters]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((current) => Math.min(current + RECIPE_BATCH_SIZE, filteredRecipes.length));
        }
      },
      { rootMargin: '720px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [filteredRecipes.length, hasMore, loading]);

  function handleChange(patch: Partial<RecipeFilterState>) {
    setSearchParams(searchParamsFromFilters({ ...filters, ...patch }), { replace: true });
  }

  function handleClear() {
    setSearchParams(searchParamsFromFilters(DEFAULT_FILTER_STATE), { replace: true });
  }

  return (
    <div className="pb-10">
      <section className="border-b border-border pb-7">
        <p className="text-sm font-semibold text-primary">The full collection</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-[45px] leading-none text-text sm:text-[56px]">Recipe Library</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-text-muted">Thousands of ideas for hungry people, curious cooks, and everyone in between.</p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-text-muted">{allRecipes.length.toLocaleString()} recipes</span>
        </div>
      </section>

      <div className="mt-5">
        <FilterBar filters={filters} onChange={handleChange} onClear={handleClear} resultCount={filteredRecipes.length} />
      </div>

      <div className="mt-6">
        {loading ? (
          <RecipeGridSkeleton />
        ) : filteredRecipes.length === 0 ? (
          <EmptyState
            icon={SearchX}
            heading="No recipes found"
            body="Try a different search or clear your filters."
            action={{ label: 'Clear filters', onClick: handleClear }}
          />
        ) : (
          <>
            <RecipeGrid recipes={visibleRecipes} />
            {hasMore && (
              <div ref={loadMoreRef} className="flex min-h-20 items-center justify-center gap-2 text-sm text-text-muted" role="status">
                <LoaderCircle size={16} className="animate-spin" />
                Loading more recipes
              </div>
            )}
            {!hasMore && filteredRecipes.length > RECIPE_BATCH_SIZE && (
              <p className="py-8 text-center text-sm text-text-muted">You have reached the end of this collection.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
