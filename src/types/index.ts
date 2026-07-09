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
  name: string;              // canonical, lowercase — see vocabulary.ts
  quantity: number;          // 0 allowed only when unit === 'to-taste'
  unit: Unit;
  groceryCategory: GroceryCategory;
  note?: string;              // "finely chopped", "room temperature"
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
  emoji: string;              // '🥞'
  url?: string;
}

export interface NutritionInfo {   // per serving, all optional
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
}

export interface MealPlanEntry {
  recipeId: string;
  servings: number;          // user-chosen; may differ from recipe.servings
}

// Derived — never persisted. Produced by buildGroceryList().
export interface GroceryItem {
  key: string;                // stable identity: `${name}|${unitFamily}`
  name: string;                // canonical ingredient name
  quantity: number;            // summed, in display unit
  unit: Unit;                  // chosen display unit
  category: GroceryCategory;
  sourceRecipes: string[];     // recipe titles contributing to this line
  isCustom: false;
}

// Persisted in useGroceryStore.
export interface CustomGroceryItem {
  key: string;                // `custom-${uuid}`
  name: string;                // free text, as typed
  quantity?: number;
  unit?: Unit;
  category: GroceryCategory;   // user picks, default 'other'
  isCustom: true;
}

// What the Grocery List page renders (after overlaying store state):
export type GroceryLine = (GroceryItem | CustomGroceryItem) & { checked: boolean };
