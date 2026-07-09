import { useMealPlanStore } from '@/stores/useMealPlanStore';
import type { NavItem } from './navItems';

export function useNavBadgeCounts(): Partial<Record<NonNullable<NavItem['badgeKey']>, number>> {
  const mealPlanCount = useMealPlanStore((state) => state.entries.length);
  return { mealPlan: mealPlanCount };
}
