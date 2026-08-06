import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Minus, Pencil, Plus, ShoppingBasket, Trash2, UtensilsCrossed } from 'lucide-react';
import type { MealPlanEntry, MealSlot, Recipe } from '@/types';
import {
  addDays,
  formatDayLabel,
  formatWeekRange,
  MEAL_SLOT_LABELS,
  MEAL_SLOTS,
  startOfWeek,
  todayKey,
  weekDateKeys,
} from '@/lib/dates';
import { useMealPlanStore } from '@/stores/useMealPlanStore';
import { useAllRecipes } from '@/stores/useRecipeStore';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { RecipeImage } from '@/components/recipes/RecipeImage';

interface PickerTarget {
  date: string;
  mealSlot: MealSlot;
}

export default function MealPlanPage() {
  const entries = useMealPlanStore((state) => state.entries);
  const planRecipe = useMealPlanStore((state) => state.planRecipe);
  const removeEntry = useMealPlanStore((state) => state.removeEntry);
  const setEntryServings = useMealPlanStore((state) => state.setEntryServings);
  const clear = useMealPlanStore((state) => state.clear);
  const recipes = useAllRecipes();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(todayKey()));
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [query, setQuery] = useState('');
  const [clearOpen, setClearOpen] = useState(false);

  const days = useMemo(() => weekDateKeys(weekStart), [weekStart]);
  const weekEnd = days[days.length - 1];
  const plannedEntries = entries.filter((entry) => entry.date && entry.date >= weekStart && entry.date <= weekEnd);
  const recipesById = useMemo(() => new Map(recipes.map((recipe) => [recipe.id, recipe])), [recipes]);
  const visibleChoices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return recipes
      .filter((recipe) => {
        if (!normalized) return true;
        return [
          recipe.title,
          recipe.description,
          recipe.category,
          recipe.cuisine ?? '',
          recipe.tags.join(' '),
          recipe.ingredients.map((ingredient) => ingredient.name).join(' '),
        ].join(' ').toLowerCase().includes(normalized);
      })
      .slice(0, 30);
  }, [query, recipes]);

  function openPicker(date: string, mealSlot: MealSlot) {
    setQuery('');
    setPickerTarget({ date, mealSlot });
  }

  function selectRecipe(recipe: Recipe) {
    if (!pickerTarget) return;
    planRecipe(recipe.id, recipe.servings, pickerTarget.date, pickerTarget.mealSlot);
    setPickerTarget(null);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meal Plan</h1>
          <p className="mt-1 text-sm text-text-muted">Put breakfast, lunch, and dinner on the calendar, then shop the week.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {entries.length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => setClearOpen(true)}>Clear plan</Button>
          )}
          <Link
            to={`/grocery-list?from=${weekStart}&to=${weekEnd}`}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-white transition-all duration-200 hover:bg-primary-hover active:scale-[0.98]"
          >
            <ShoppingBasket size={14} />
            Shop this week
          </Link>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-y border-border py-3">
        <Button variant="ghost" size="sm" aria-label="Previous week" onClick={() => setWeekStart((value) => addDays(value, -7))}>
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold">{formatWeekRange(weekStart)}</p>
          <button type="button" onClick={() => setWeekStart(startOfWeek(todayKey()))} className="mt-0.5 text-xs font-medium text-primary hover:text-primary-hover">This week</button>
        </div>
        <Button variant="ghost" size="sm" aria-label="Next week" onClick={() => setWeekStart((value) => addDays(value, 7))}>
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-7">
        {days.map((date) => {
          const label = formatDayLabel(date);
          return (
            <section key={date} className={`min-w-0 border border-border bg-card p-3 ${label.isToday ? 'border-primary ring-1 ring-primary/20' : ''}`}>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{label.weekday}</span>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${label.isToday ? 'bg-primary text-white' : 'bg-surface text-text'}`}>{label.day}</span>
              </div>
              <div className="space-y-2">
                {MEAL_SLOTS.map((mealSlot) => {
                  const entry = plannedEntries.find((item) => item.date === date && item.mealSlot === mealSlot);
                  const recipe = entry ? recipesById.get(entry.recipeId) : undefined;
                  return (
                    <MealSlotCard
                      key={mealSlot}
                      entry={entry}
                      recipe={recipe}
                      mealSlot={mealSlot}
                      onPick={() => openPicker(date, mealSlot)}
                      onRemove={() => entry?.id && removeEntry(entry.id)}
                      onSetServings={(servings) => entry?.id && setEntryServings(entry.id, servings)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {plannedEntries.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={UtensilsCrossed}
            heading="This week is wide open"
            body="Choose any meal slot to start building your week. Your grocery list will update from the meals you plan."
          />
        </div>
      )}

      <Modal open={Boolean(pickerTarget)} onClose={() => setPickerTarget(null)} title="Choose a recipe">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Choose a recipe</h2>
              {pickerTarget && <p className="mt-1 text-sm text-text-muted">{MEAL_SLOT_LABELS[pickerTarget.mealSlot]} on {formatDayLabel(pickerTarget.date).weekday}</p>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPickerTarget(null)}>Close</Button>
          </div>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search 2,000+ recipes"
            className="mt-4"
            aria-label="Search recipes to plan"
          />
          <div className="mt-3 max-h-96 space-y-1 overflow-y-auto pr-1">
            {visibleChoices.map((recipe) => (
              <button
                type="button"
                key={recipe.id}
                onClick={() => selectRecipe(recipe)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-primary-soft/60"
              >
                <RecipeImage image={recipe.image} category={recipe.category} className="h-10 w-10 rounded-lg" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{recipe.title}</span>
                  <span className="block text-xs text-text-muted">{recipe.prepMinutes + recipe.cookMinutes} min · {recipe.servings} servings</span>
                </span>
                <Plus size={16} className="shrink-0 text-primary" />
              </button>
            ))}
            {visibleChoices.length === 0 && <p className="px-2 py-8 text-center text-sm text-text-muted">No recipes match that search.</p>}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={clearOpen}
        title="Clear the entire meal plan?"
        body="This removes every scheduled meal across all weeks. This can't be undone."
        confirmLabel="Clear plan"
        danger
        onConfirm={() => {
          clear();
          setClearOpen(false);
        }}
        onCancel={() => setClearOpen(false)}
      />
    </div>
  );
}

function MealSlotCard({
  entry,
  recipe,
  mealSlot,
  onPick,
  onRemove,
  onSetServings,
}: {
  entry?: MealPlanEntry;
  recipe?: Recipe;
  mealSlot: MealSlot;
  onPick: () => void;
  onRemove: () => void;
  onSetServings: (servings: number) => void;
}) {
  if (!entry || !recipe) {
    return (
      <button type="button" onClick={onPick} className="flex min-h-16 w-full flex-col items-start justify-center rounded-lg border border-dashed border-border px-2 text-left hover:border-primary hover:bg-primary-soft/40">
        <span className="text-[11px] font-medium uppercase tracking-wide text-text-muted">{MEAL_SLOT_LABELS[mealSlot]}</span>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary"><Plus size={13} /> Add meal</span>
      </button>
    );
  }

  return (
    <div className="group rounded-lg border border-border bg-surface p-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">{MEAL_SLOT_LABELS[mealSlot]}</p>
      <Link to={`/recipes/${recipe.id}`} className="mt-1 block line-clamp-2 text-xs font-semibold leading-snug hover:text-primary">{recipe.title}</Link>
      <div className="mt-2 flex items-center gap-1 text-[11px] text-text-muted">
        <button type="button" aria-label={`Decrease servings for ${recipe.title}`} onClick={() => onSetServings(Math.max(1, entry.servings - 1))} className="flex h-6 w-6 items-center justify-center rounded text-text-muted hover:bg-primary-soft"><Minus size={12} /></button>
        <span className="min-w-10 text-center">{entry.servings} servings</span>
        <button type="button" aria-label={`Increase servings for ${recipe.title}`} onClick={() => onSetServings(entry.servings + 1)} className="flex h-6 w-6 items-center justify-center rounded text-text-muted hover:bg-primary-soft"><Plus size={12} /></button>
      </div>
      <div className="mt-2 flex gap-1">
        <button type="button" aria-label={`Change ${MEAL_SLOT_LABELS[mealSlot]} recipe`} onClick={onPick} className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-primary-soft hover:text-primary"><Pencil size={13} /></button>
        <button type="button" aria-label={`Remove ${recipe.title}`} onClick={onRemove} className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-primary-soft hover:text-red-600"><Trash2 size={13} /></button>
      </div>
    </div>
  );
}
