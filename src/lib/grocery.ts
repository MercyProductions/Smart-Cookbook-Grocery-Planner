import type { CustomGroceryItem, GroceryCategory, GroceryItem, GroceryLine, MealPlanEntry, Recipe } from '@/types';
import { scaleIngredient } from './scaling';
import { chooseDisplayUnit, getUnitFamily, toBaseUnits, type UnitFamily } from './units';

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

interface GroupAccumulator {
  name: string;
  family: UnitFamily;
  category: GroceryCategory;
  baseQuantity: number;
  sourceRecipes: Set<string>;
}

// Merges ingredients across the meal plan into a grocery list. Same
// ingredient + compatible unit family -> summed into one line. Same
// ingredient + incompatible units (e.g. cups vs ml) -> separate lines,
// since we never guess a cross-family conversion.
export function buildGroceryList(entries: MealPlanEntry[], recipes: Recipe[]): GroceryItem[] {
  const groups = new Map<string, GroupAccumulator>();

  for (const entry of entries) {
    const recipe = recipes.find((r) => r.id === entry.recipeId);
    if (!recipe) continue;

    const factor = entry.servings / recipe.servings;

    for (const ingredient of recipe.ingredients) {
      const scaled = scaleIngredient(ingredient, factor);
      const family = getUnitFamily(scaled.unit);
      const key = `${scaled.name}|${family}`;

      let group = groups.get(key);
      if (!group) {
        group = {
          name: scaled.name,
          family,
          category: scaled.groceryCategory,
          baseQuantity: 0,
          sourceRecipes: new Set(),
        };
        groups.set(key, group);
      }

      group.baseQuantity += toBaseUnits(scaled.quantity, scaled.unit);
      group.sourceRecipes.add(recipe.title);
    }
  }

  const items: GroceryItem[] = Array.from(groups.entries()).map(([key, group]) => {
    const { quantity, unit } = chooseDisplayUnit(group.baseQuantity, group.family);
    return {
      key,
      name: group.name,
      quantity,
      unit,
      category: group.category,
      sourceRecipes: Array.from(group.sourceRecipes).sort(),
      isCustom: false,
    };
  });

  return items.sort((a, b) => {
    const categoryDiff = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (categoryDiff !== 0) return categoryDiff;
    return a.name.localeCompare(b.name);
  });
}

interface GroceryOverlayState {
  checkedKeys: string[];
  removedKeys: string[];
  customItems: CustomGroceryItem[];
}

// Overlays persisted check/remove/custom-item state onto a freshly generated
// grocery list. The list itself is never persisted — this keeps it always in
// sync with the current meal plan.
export function overlayGroceryState(items: GroceryItem[], state: GroceryOverlayState): GroceryLine[] {
  const visible = items.filter((item) => !state.removedKeys.includes(item.key));

  return [
    ...visible.map((item) => ({ ...item, checked: state.checkedKeys.includes(item.key) })),
    ...state.customItems.map((item) => ({ ...item, checked: state.checkedKeys.includes(item.key) })),
  ];
}
