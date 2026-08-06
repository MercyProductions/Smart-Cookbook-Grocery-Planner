import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBasket } from 'lucide-react';
import type { GroceryCategory, GroceryLine, Unit } from '@/types';
import { buildGroceryList, excludePantryItems, overlayGroceryState } from '@/lib/grocery';
import { addDays, entryMatchesDateRange, startOfWeek, todayKey } from '@/lib/dates';
import { useMealPlanStore } from '@/stores/useMealPlanStore';
import { useGroceryStore } from '@/stores/useGroceryStore';
import { usePantryStore } from '@/stores/usePantryStore';
import { useAllRecipes } from '@/stores/useRecipeStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { GroceryToolbar } from '@/components/grocery/GroceryToolbar';
import { GroceryCategoryGroup } from '@/components/grocery/GroceryCategoryGroup';
import { AddCustomItemForm } from '@/components/grocery/AddCustomItemForm';
import { Button } from '@/components/ui/Button';

const CATEGORY_ORDER: GroceryCategory[] = [
  'produce', 'meat-seafood', 'dairy-eggs', 'bakery', 'pantry', 'pasta-rice',
  'canned-goods', 'frozen', 'spices', 'condiments', 'beverages', 'household', 'other',
];

export default function GroceryListPage() {
  const entries = useMealPlanStore((state) => state.entries);
  const checkedKeys = useGroceryStore((state) => state.checkedKeys);
  const removedKeys = useGroceryStore((state) => state.removedKeys);
  const customItems = useGroceryStore((state) => state.customItems);
  const itemOverrides = useGroceryStore((state) => state.itemOverrides);
  const excludePantry = useGroceryStore((state) => state.excludePantry);
  const setExcludePantry = useGroceryStore((state) => state.setExcludePantry);
  const toggleChecked = useGroceryStore((state) => state.toggleChecked);
  const removeGeneratedItem = useGroceryStore((state) => state.removeGeneratedItem);
  const removeCustomItem = useGroceryStore((state) => state.removeCustomItem);
  const updateGeneratedItem = useGroceryStore((state) => state.updateGeneratedItem);
  const updateCustomItem = useGroceryStore((state) => state.updateCustomItem);
  const restoreRemoved = useGroceryStore((state) => state.restoreRemoved);
  const clearCompleted = useGroceryStore((state) => state.clearCompleted);
  const reset = useGroceryStore((state) => state.reset);
  const addCustomItem = useGroceryStore((state) => state.addCustomItem);
  const pantryItems = usePantryStore((state) => state.items);
  const allRecipes = useAllRecipes();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showAddForm, setShowAddForm] = useState(false);

  const defaultStart = startOfWeek(todayKey());
  const from = searchParams.get('from') ?? defaultStart;
  const to = searchParams.get('to') ?? addDays(defaultStart, 6);
  const [rangeStart, setRangeStart] = useState(from);
  const [rangeEnd, setRangeEnd] = useState(to);
  useEffect(() => {
    setRangeStart(from);
    setRangeEnd(to);
  }, [from, to]);
  const scopedEntries = useMemo(
    () => entries.filter((entry) => entryMatchesDateRange(entry, from, to)),
    [entries, from, to],
  );
  const lines = useMemo(() => {
    const generated = buildGroceryList(scopedEntries, allRecipes);
    const visibleGenerated = excludePantry
      ? excludePantryItems(generated, pantryItems.map((item) => item.name))
      : generated;
    return overlayGroceryState(visibleGenerated, { checkedKeys, removedKeys, customItems, itemOverrides });
  }, [allRecipes, checkedKeys, customItems, excludePantry, itemOverrides, pantryItems, removedKeys, scopedEntries]);

  const total = lines.length;
  const completed = lines.filter((line) => line.checked).length;
  const byCategory = new Map<GroceryCategory, GroceryLine[]>();
  for (const line of lines) {
    const list = byCategory.get(line.category) ?? [];
    list.push(line);
    byCategory.set(line.category, list);
  }

  function handleRemove(line: GroceryLine) {
    if (line.isCustom) removeCustomItem(line.key);
    else removeGeneratedItem(line.key);
  }

  function handleUpdate(line: GroceryLine, patch: { quantity?: number; unit?: Unit; note?: string }) {
    if (line.isCustom) updateCustomItem(line.key, patch);
    else updateGeneratedItem(line.key, patch);
  }

  function applyDateRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextStart = String(formData.get('from') ?? '');
    const nextEnd = String(formData.get('to') ?? '');
    if (!nextStart || !nextEnd || nextStart > nextEnd) return;
    navigate(`/grocery-list?from=${nextStart}&to=${nextEnd}`);
  }

  if (total === 0) {
    return (
      <div>
        <p className="text-sm font-semibold text-primary">Shop with a plan</p>
        <h1 className="mt-1 font-display text-[42px] leading-none text-text">Grocery List</h1>
        <p className="mt-3 text-sm text-text-muted">For planned meals from {from} through {to}.</p>
        <div className="mt-6">
          <EmptyState
            icon={ShoppingBasket}
            heading="Your list is empty"
            body="Plan a few meals for this week and their ingredients will appear here automatically."
            action={{ label: 'Plan this week', to: '/meal-plan' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="border-b border-border pb-5">
        <p className="text-sm font-semibold text-primary">Shop with a plan</p>
        <h1 className="mt-1 font-display text-[42px] leading-none text-text">Grocery List</h1>
        <p className="mt-3 text-sm text-text-muted">Everything for the meals you&apos;ve set out to make.</p>
      </section>
      <form onSubmit={applyDateRange} className="mt-5 flex flex-wrap items-end gap-2 text-sm">
        <label className="text-xs font-medium text-text-muted">From<input name="from" type="date" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} className="mt-1 block h-9 rounded-lg border border-border bg-card px-2 text-sm text-text" /></label>
        <label className="text-xs font-medium text-text-muted">To<input name="to" type="date" value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} className="mt-1 block h-9 rounded-lg border border-border bg-card px-2 text-sm text-text" /></label>
        <Button type="submit" size="sm">Update</Button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <label className="inline-flex items-center gap-2 text-text-muted">
          <input type="checkbox" checked={excludePantry} onChange={(event) => setExcludePantry(event.target.checked)} className="h-4 w-4 rounded border-border text-primary" />
          Exclude pantry items
        </label>
        <Link to="/pantry" className="font-medium text-primary hover:text-primary-hover">Manage pantry ({pantryItems.length})</Link>
      </div>

      <div className="mt-6">
        <GroceryToolbar
          total={total}
          completed={completed}
          showAddForm={showAddForm}
          onToggleAddForm={() => setShowAddForm((value) => !value)}
          onClearCompleted={clearCompleted}
          onRestoreRemoved={restoreRemoved}
          onReset={reset}
          hasRemoved={removedKeys.length > 0}
        />

        {showAddForm && (
          <AddCustomItemForm
            onAdd={(item) => {
              addCustomItem(item);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        <div className="space-y-6">
          {CATEGORY_ORDER.filter((category) => byCategory.has(category)).map((category) => (
            <GroceryCategoryGroup
              key={category}
              category={category}
              lines={byCategory.get(category)!}
              onToggle={toggleChecked}
              onRemove={handleRemove}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
