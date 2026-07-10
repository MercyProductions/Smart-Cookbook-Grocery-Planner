import { buildGroceryList, overlayGroceryState } from '@/lib/grocery';
import { useMealPlanStore } from '@/stores/useMealPlanStore';
import { useGroceryStore } from '@/stores/useGroceryStore';
import { useAllRecipes } from '@/stores/useRecipeStore';
import type { NavItem } from './navItems';

export function useNavBadgeCounts(): Partial<Record<NonNullable<NavItem['badgeKey']>, number>> {
  const mealPlanCount = useMealPlanStore((state) => state.entries.length);

  const entries = useMealPlanStore((state) => state.entries);
  const checkedKeys = useGroceryStore((state) => state.checkedKeys);
  const removedKeys = useGroceryStore((state) => state.removedKeys);
  const customItems = useGroceryStore((state) => state.customItems);
  const allRecipes = useAllRecipes();

  const items = buildGroceryList(entries, allRecipes);
  const lines = overlayGroceryState(items, { checkedKeys, removedKeys, customItems });
  const groceriesCount = lines.filter((line) => !line.checked).length;

  return { mealPlan: mealPlanCount, groceries: groceriesCount };
}
