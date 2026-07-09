import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import type { DietaryTag, Difficulty, RecipeCategory, RecipeFilterState } from '@/types';
import { SEED_RECIPES } from '@/data/recipes';
import { applyRecipeFilters, DEFAULT_FILTER_STATE } from '@/lib/filters';
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
];
const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

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

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timeout);
  }, []);

  const filteredRecipes = useMemo(() => applyRecipeFilters(SEED_RECIPES, filters), [filters]);

  function handleChange(patch: Partial<RecipeFilterState>) {
    setSearchParams(searchParamsFromFilters({ ...filters, ...patch }), { replace: true });
  }

  function handleClear() {
    setSearchParams(searchParamsFromFilters(DEFAULT_FILTER_STATE), { replace: true });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Recipe Library</h1>
      <p className="mt-1 text-sm text-text-muted">Browse the full collection and find something that sounds good.</p>

      <div className="mt-4">
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
          <RecipeGrid recipes={filteredRecipes} />
        )}
      </div>
    </div>
  );
}
