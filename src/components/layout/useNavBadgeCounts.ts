import { buildGroceryList, excludePantryItems, overlayGroceryState } from '@/lib/grocery';
import { addDays, entryMatchesDateRange, startOfWeek, todayKey } from '@/lib/dates';
import { useMealPlanStore } from '@/stores/useMealPlanStore';
import { useGroceryStore } from '@/stores/useGroceryStore';
import { useAllRecipes } from '@/stores/useRecipeStore';
import { usePantryStore } from '@/stores/usePantryStore';
import type { NavItem } from './navItems';

export function useNavBadgeCounts(): Partial<Record<NonNullable<NavItem['badgeKey']>, number>> {
  const mealPlanCount = useMealPlanStore((state) => state.entries.length);

  const entries = useMealPlanStore((state) => state.entries);
  const checkedKeys = useGroceryStore((state) => state.checkedKeys);
  const removedKeys = useGroceryStore((state) => state.removedKeys);
  const customItems = useGroceryStore((state) => state.customItems);
  const itemOverrides = useGroceryStore((state) => state.itemOverrides);
  const excludePantry = useGroceryStore((state) => state.excludePantry);
  const pantryItems = usePantryStore((state) => state.items);
  const allRecipes = useAllRecipes();

  const weekStart = startOfWeek(todayKey());
  const currentWeekEntries = entries.filter((entry) => entryMatchesDateRange(entry, weekStart, addDays(weekStart, 6)));
  const generated = buildGroceryList(currentWeekEntries, allRecipes);
  const items = excludePantry ? excludePantryItems(generated, pantryItems.map((item) => item.name)) : generated;
  const lines = overlayGroceryState(items, { checkedKeys, removedKeys, customItems, itemOverrides });
  const groceriesCount = lines.filter((line) => !line.checked).length;

  return { mealPlan: mealPlanCount, groceries: groceriesCount };
}
