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
    const next = filters.tags.includes(tag) ? filters.tags.filter((item) => item !== tag) : [...filters.tags, tag];
    onChange({ tags: next });
  }

  const active = isFilterStateActive(filters);

  return (
    <div className="sticky top-0 z-10 -mx-4 border-y border-border bg-surface/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8 xl:-mx-10 xl:px-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative max-w-2xl flex-1">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              placeholder="Search dishes, ingredients, cuisines"
              className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-text shadow-[0_1px_2px_rgba(23,24,23,0.03)] placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filters.maxTotalMinutes ?? 'any'}
              onChange={(event) => onChange({ maxTotalMinutes: event.target.value === 'any' ? null : Number(event.target.value) })}
              aria-label="Max total time"
              className="h-9 text-xs"
            >
              <option value="any">Any time</option>
              {MAX_TIME_OPTIONS.map((minutes) => <option key={minutes} value={minutes}>Under {minutes} min</option>)}
            </Select>
            <Select
              value={filters.difficulty}
              onChange={(event) => onChange({ difficulty: event.target.value as Difficulty | 'all' })}
              aria-label="Difficulty"
              className="h-9 text-xs"
            >
              <option value="all">Any difficulty</option>
              {DIFFICULTIES.map((difficulty) => <option key={difficulty} value={difficulty}>{DIFFICULTY_LABELS[difficulty]}</option>)}
            </Select>
            {active && (
              <button type="button" onClick={onClear} className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-xs font-semibold text-text-muted hover:bg-primary-soft hover:text-primary">
                <X size={14} /> Clear
              </button>
            )}
            <span className="ml-auto text-xs font-medium text-text-muted lg:ml-1">{resultCount.toLocaleString()} results</span>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          <CategoryButton label="All recipes" active={filters.category === 'all'} onClick={() => onChange({ category: 'all' })} />
          {CATEGORIES.map((category) => (
            <CategoryButton key={category} label={CATEGORY_LABELS[category]} active={filters.category === category} onClick={() => onChange({ category })} />
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((tag) => <TagPill key={tag} tag={tag} active={filters.tags.includes(tag)} onClick={() => toggleTag(tag)} />)}
        </div>
      </div>
    </div>
  );
}

function CategoryButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? 'border-primary bg-primary text-white' : 'border-border bg-card text-text-muted hover:border-text/25 hover:text-text'
      }`}
    >
      {label}
    </button>
  );
}
