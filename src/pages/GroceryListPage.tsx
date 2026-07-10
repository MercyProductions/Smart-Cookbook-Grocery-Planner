import { useMemo, useState } from 'react';
import { ShoppingBasket } from 'lucide-react';
import type { GroceryCategory, GroceryLine } from '@/types';
import { buildGroceryList, overlayGroceryState } from '@/lib/grocery';
import { useMealPlanStore } from '@/stores/useMealPlanStore';
import { useGroceryStore } from '@/stores/useGroceryStore';
import { useAllRecipes } from '@/stores/useRecipeStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { GroceryToolbar } from '@/components/grocery/GroceryToolbar';
import { GroceryCategoryGroup } from '@/components/grocery/GroceryCategoryGroup';
import { AddCustomItemForm } from '@/components/grocery/AddCustomItemForm';

const CATEGORY_ORDER: GroceryCategory[] = [
  'produce',
  'meat-seafood',
  'dairy-eggs',
  'bakery',
  'pantry',
  'frozen',
  'spices',
  'beverages',
  'other',
];

export default function GroceryListPage() {
  const entries = useMealPlanStore((state) => state.entries);
  const checkedKeys = useGroceryStore((state) => state.checkedKeys);
  const removedKeys = useGroceryStore((state) => state.removedKeys);
  const customItems = useGroceryStore((state) => state.customItems);
  const toggleChecked = useGroceryStore((state) => state.toggleChecked);
  const removeGeneratedItem = useGroceryStore((state) => state.removeGeneratedItem);
  const removeCustomItem = useGroceryStore((state) => state.removeCustomItem);
  const restoreRemoved = useGroceryStore((state) => state.restoreRemoved);
  const clearCompleted = useGroceryStore((state) => state.clearCompleted);
  const reset = useGroceryStore((state) => state.reset);
  const addCustomItem = useGroceryStore((state) => state.addCustomItem);
  const allRecipes = useAllRecipes();

  const [showAddForm, setShowAddForm] = useState(false);

  const lines = useMemo(() => {
    const items = buildGroceryList(entries, allRecipes);
    return overlayGroceryState(items, { checkedKeys, removedKeys, customItems });
  }, [allRecipes, entries, checkedKeys, removedKeys, customItems]);

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

  if (total === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Grocery List</h1>
        <div className="mt-6">
          <EmptyState
            icon={ShoppingBasket}
            heading="Your list is empty"
            body="Add recipes to your meal plan and ingredients appear here automatically."
            action={{ label: 'Go to meal plan', to: '/meal-plan' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Grocery List</h1>

      <div className="mt-4">
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
