import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { DietaryTag, Difficulty, RecipeCategory, RecipeFilterState } from '@/types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, TAG_LABELS } from '@/lib/labels';
import { isFilterStateActive } from '@/lib/filters';
import { Select } from '@/components/ui/Select';
import { TagPill } from './TagPill';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as RecipeCategory[];
const TAGS = Object.keys(TAG_LABELS) as DietaryTag[];
const DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as Difficulty[];
const MAX_TIME_OPTIONS = [15, 30, 45, 60];

interface FilterBarProps {
  filters: RecipeFilterState;
  onChange: (patch: Partial<RecipeFilterState>) => void;
  onClear: () => void;
  resultCount: number;
}

export function FilterBar({ filters, onChange, onClear, resultCount }: FilterBarProps) {
  const [queryInput, setQueryInput] = useState(filters.query);

  // Keep the local input in sync if filters are reset/cleared elsewhere.
  useEffect(() => {
    setQueryInput(filters.query);
  }, [filters.query]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (queryInput !== filters.query) onChange({ query: queryInput });
    }, 200);
    return () => clearTimeout(timeout);
  }, [filters.query, onChange, queryInput]);

  function toggleTag(tag: DietaryTag) {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ tags: next });
  }

  const active = isFilterStateActive(filters);

  return (
    <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-surface/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="Search recipes or ingredients…"
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CategoryPill
            label="All"
            active={filters.category === 'all'}
            onClick={() => onChange({ category: 'all' })}
          />
          {CATEGORIES.map((category) => (
            <CategoryPill
              key={category}
              label={CATEGORY_LABELS[category]}
              active={filters.category === category}
              onClick={() => onChange({ category })}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map((tag) => (
              <TagPill key={tag} tag={tag} active={filters.tags.includes(tag)} onClick={() => toggleTag(tag)} />
            ))}
          </div>

          <Select
            value={filters.maxTotalMinutes ?? 'any'}
            onChange={(event) =>
              onChange({
                maxTotalMinutes: event.target.value === 'any' ? null : Number(event.target.value),
              })
            }
            aria-label="Max total time"
          >
            <option value="any">Any time</option>
            {MAX_TIME_OPTIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                Under {minutes} min
              </option>
            ))}
          </Select>

          <Select
            value={filters.difficulty}
            onChange={(event) => onChange({ difficulty: event.target.value as Difficulty | 'all' })}
            aria-label="Difficulty"
          >
            <option value="all">Any difficulty</option>
            {DIFFICULTIES.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {DIFFICULTY_LABELS[difficulty]}
              </option>
            ))}
          </Select>

          {active && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-primary"
            >
              <X size={13} />
              Clear filters
            </button>
          )}

          <span className="ml-auto text-xs text-text-muted">
            {resultCount} {resultCount === 1 ? 'recipe' : 'recipes'}
          </span>
        </div>
      </div>
    </div>
  );
}

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'border-primary bg-primary text-white'
          : 'border-border bg-card text-text-muted hover:bg-primary-soft/60'
      }`}
    >
      {label}
    </button>
  );
}
