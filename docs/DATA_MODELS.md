# Data Models & Grocery List Logic

All types live in `src/types/index.ts` exactly as specified here. The grocery aggregation algorithm (§4) is the most delicate logic in the app — implement it as pure functions in `src/lib/` and unit-test it before wiring UI.

## 1. Core types

```ts
export type RecipeCategory =
  | 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack';

export type DietaryTag =
  | 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free'
  | 'high-protein' | 'low-carb' | 'healthy' | 'comfort-food' | 'quick';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GroceryCategory =
  | 'produce' | 'meat-seafood' | 'dairy-eggs' | 'bakery'
  | 'pantry' | 'frozen' | 'spices' | 'beverages' | 'other';

// Units — closed set. Anything not listed uses 'unit' (a countable) or 'to-taste'.
export type Unit =
  // volume (US)
  | 'tsp' | 'tbsp' | 'cup'
  // volume (metric)
  | 'ml' | 'l'
  // weight (US)
  | 'oz' | 'lb'
  // weight (metric)
  | 'g' | 'kg'
  // countables & specials
  | 'unit' | 'clove' | 'can' | 'slice' | 'bunch' | 'pinch' | 'to-taste';

export interface Ingredient {
  name: string;              // canonical, lowercase — see §3
  quantity: number;          // 0 allowed only when unit === 'to-taste'
  unit: Unit;
  groceryCategory: GroceryCategory;
  note?: string;             // "finely chopped", "room temperature"
}

export interface Recipe {
  id: string;                // seed: 'seed-pancakes'; custom: crypto.randomUUID()
  title: string;
  description: string;       // 1–2 sentences
  category: RecipeCategory;
  tags: DietaryTag[];
  prepMinutes: number;
  cookMinutes: number;
  servings: number;          // servings the ingredient quantities are written for
  difficulty: Difficulty;
  image: RecipeImage;
  ingredients: Ingredient[];
  instructions: string[];    // one string per step, imperative voice
  nutrition?: NutritionInfo; // placeholder — optional, render "—" when absent
  isCustom: boolean;         // true for user-created recipes
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
}

// No external images. Placeholder = emoji on a category-tinted gradient.
// `url` supported for future/custom use; render it with the gradient as fallback.
export interface RecipeImage {
  emoji: string;             // '🥞'
  url?: string;
}

export interface NutritionInfo {   // per serving, all optional
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
}
```

## 2. Meal plan & grocery types

```ts
export interface MealPlanEntry {
  recipeId: string;
  servings: number;          // user-chosen; may differ from recipe.servings
}

// Derived — never persisted. Produced by buildGroceryList().
export interface GroceryItem {
  key: string;               // stable identity: `${name}|${unitFamily}` (see §4)
  name: string;              // canonical ingredient name
  quantity: number;          // summed, in display unit
  unit: Unit;                // chosen display unit (see §4 step 5)
  category: GroceryCategory;
  sourceRecipes: string[];   // recipe titles contributing to this line
  isCustom: false;
}

// Persisted in useGroceryStore.
export interface CustomGroceryItem {
  key: string;               // `custom-${uuid}`
  name: string;              // free text, as typed
  quantity?: number;
  unit?: Unit;
  category: GroceryCategory; // user picks, default 'other'
  isCustom: true;
}

// What the Grocery List page renders (after overlaying store state):
export type GroceryLine = (GroceryItem | CustomGroceryItem) & { checked: boolean };
```

## 3. Ingredient vocabulary (`src/data/vocabulary.ts`)

Merging only works if seed recipes spell ingredients identically. Define one canonical list and build every seed recipe from it. Rules:

- lowercase, singular, no adjectives in the name (put prep in `note`): `"yellow onion"` not `"Onions, diced"`.
- Each vocabulary entry fixes the ingredient's `groceryCategory` and its *preferred unit* so recipes stay consistent (e.g., flour in `cup`, chicken breast in `lb`, olive oil in `tbsp`).
- Export it as `INGREDIENT_VOCABULARY: { name, groceryCategory, defaultUnit }[]` — the recipe editor uses it for autocomplete, and seed data imports from it.

Seed vocabulary should cover ~60 ingredients across all grocery categories: staples (all-purpose flour, sugar, butter, egg, milk, olive oil, salt, black pepper, garlic, yellow onion…), proteins, produce, dairy, pantry, spices. Deliberately reuse staples across many seed recipes so the merge behavior is visible immediately.

## 4. Grocery list generation — the algorithm

`buildGroceryList(entries: MealPlanEntry[], recipes: Recipe[]): GroceryItem[]` in `src/lib/grocery.ts`. Pure function. Steps:

**Step 1 — Scale.** For each entry, resolve the recipe (skip silently if the id no longer exists). Scale factor = `entry.servings / recipe.servings`. Each ingredient's quantity × factor. `to-taste` items pass through unscaled with quantity 0.

**Step 2 — Assign unit family.** In `src/lib/units.ts`:

```ts
type UnitFamily = 'volume-us' | 'volume-metric' | 'weight-us' | 'weight-metric'
                | 'count' | 'clove' | 'can' | 'slice' | 'bunch' | 'pinch' | 'to-taste';
```

- `tsp/tbsp/cup` → `volume-us` (base: tsp; tbsp = 3 tsp, cup = 48 tsp)
- `ml/l` → `volume-metric` (base: ml; l = 1000)
- `oz/lb` → `weight-us` (base: oz; lb = 16)
- `g/kg` → `weight-metric` (base: g; kg = 1000)
- every countable/special unit is its own family.

**No cross-family conversion, ever.** Never convert cups↔ml, oz↔g, or "1 unit onion"↔"1 cup onion". This is the safety rule from the spec: wrong merges are worse than unmerged lines.

**Step 3 — Group.** Group key = `${ingredient.name}|${unitFamily}`. Same ingredient in compatible units merges; same ingredient in incompatible units yields separate lines (e.g., `milk|volume-us` and `milk|volume-metric` appear as two lines — correct and clearly distinct because each shows its own unit).

**Step 4 — Sum.** Convert each contribution to the family's base unit, sum. Collect contributing recipe titles (deduped) into `sourceRecipes`. `to-taste` lines don't sum quantities; they just merge into one line rendered as "to taste".

**Step 5 — Choose display unit.** Convert the base-unit total up to the largest unit in the family whose *formatted* value doesn't round down to `"0"` (not simply "largest unit ≥ 1" — that rule force-promotes small quantities into unreadable results, e.g. 2 tsp baking powder becoming "0 cup"; scan from the largest unit down and stop at the first one whose `formatQuantity()` output isn't `"0"`). Examples: 52 tsp → 1.08 cup → display `1.1 cup`; 24 tsp (from merged tbsp) → 0.5 cup → display `½ cup` (this is intentional — promotion can legitimately land below 1 when the result is a clean fraction); 2 tsp stays `2 tsp` (promoting to cup would round to "0"). Countables keep their unit. Round with `formatQuantity()`:
- Render common cooking fractions when within 0.02 of ¼ ⅓ ½ ⅔ ¾: `0.5` → "½", `1.5` → "1½".
- Otherwise round to 1 decimal; strip trailing `.0`.

**Step 6 — Sort.** Group by `groceryCategory` in fixed aisle order: produce, meat-seafood, dairy-eggs, bakery, pantry, frozen, spices, beverages, other. Alphabetical within category.

### Overlaying persisted state (in the Grocery List page / a selector)

1. `items = buildGroceryList(entries, recipes)`
2. Drop items whose `key` is in `removedKeys`.
3. Append `customItems`.
4. `checked = checkedKeys.includes(item.key)`.

Because generated keys are stable (`name|family`), check-offs survive reloads AND meal-plan edits. Accepted quirk (do not "fix"): if a checked ingredient's total grows because a new recipe was added, it stays checked. Removing a generated line adds its key to `removedKeys`; the toolbar's "Restore removed items" clears that array. "Clear completed" removes checked custom items and adds checked generated keys to `removedKeys`. "Clear list" empties the meal plan? **No** — it resets `checkedKeys`, `removedKeys`, `customItems` only; the meal plan is only edited on the Meal Plan page.

### Unit tests (Vitest, `src/lib/grocery.test.ts`) — write these BEFORE the grocery UI

1. Two recipes, 2 cups + 1 cup flour → one line "3 cup flour" with both source titles.
2. 1 cup milk + 500 ml milk → two separate lines.
3. Scaling: recipe written for 4 servings, entry.servings 6 → quantities × 1.5.
4. 4 tbsp + 4 tbsp butter → "½ cup butter" (display-unit promotion + fraction).
5. `to-taste` salt from 3 recipes → single "salt — to taste" line.
6. Entry with a deleted recipeId → skipped, no crash.
7. Category ordering and alphabetical order within a category.

## 5. Seed data requirements (`src/data/recipes.ts`)

- 24 recipes: 4 breakfast, 4 lunch, 8 dinner, 4 dessert, 4 snack.
- Every dietary tag used by ≥ 2 recipes; difficulties roughly 10 easy / 10 medium / 4 hard; total times spread from 10 to 90 minutes.
- Realistic ingredients and real, numbered instructions (5–10 steps) — no lorem ipsum; this is what makes the app feel like a product.
- At least 6 pairs of recipes sharing a staple with compatible units, and one deliberate incompatible-unit pair (e.g., one recipe using `ml` milk) so both merge behaviors demo out of the box.
- `createdAt`/`updatedAt`: use plausible fixed ISO dates, `isCustom: false`, ids like `seed-honey-garlic-salmon`.
