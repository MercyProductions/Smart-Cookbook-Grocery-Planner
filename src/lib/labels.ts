import type { DietaryTag, Difficulty, GroceryCategory, RecipeCategory, Unit } from '@/types';

export const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  dessert: 'Dessert',
  snack: 'Snack',
};

export const CATEGORY_EMOJI: Record<RecipeCategory, string> = {
  breakfast: '🍳',
  lunch: '🥪',
  dinner: '🍽️',
  dessert: '🍰',
  snack: '🥨',
};

export const TAG_LABELS: Record<DietaryTag, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'gluten-free': 'Gluten-Free',
  'dairy-free': 'Dairy-Free',
  'high-protein': 'High-Protein',
  'low-carb': 'Low-Carb',
  healthy: 'Healthy',
  'comfort-food': 'Comfort Food',
  quick: 'Quick',
  pescatarian: 'Pescatarian',
  keto: 'Keto',
  paleo: 'Paleo',
  mediterranean: 'Mediterranean',
  'kid-friendly': 'Kid-Friendly',
  'meal-prep': 'Meal Prep',
  'one-pot': 'One Pot',
  'budget-friendly': 'Budget-Friendly',
  'air-fryer': 'Air Fryer',
  'high-fiber': 'High-Fiber',
  'nut-free': 'Nut-Free',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const DIFFICULTY_DOT_CLASSES: Record<Difficulty, string> = {
  easy: 'bg-emerald-500',
  medium: 'bg-amber-500',
  hard: 'bg-rose-500',
};

export const UNIT_LABELS: Record<Unit, { singular: string; plural: string }> = {
  tsp: { singular: 'tsp', plural: 'tsp' },
  tbsp: { singular: 'tbsp', plural: 'tbsp' },
  cup: { singular: 'cup', plural: 'cups' },
  ml: { singular: 'ml', plural: 'ml' },
  l: { singular: 'l', plural: 'l' },
  oz: { singular: 'oz', plural: 'oz' },
  lb: { singular: 'lb', plural: 'lb' },
  g: { singular: 'g', plural: 'g' },
  kg: { singular: 'kg', plural: 'kg' },
  unit: { singular: '', plural: '' },
  clove: { singular: 'clove', plural: 'cloves' },
  can: { singular: 'can', plural: 'cans' },
  slice: { singular: 'slice', plural: 'slices' },
  bunch: { singular: 'bunch', plural: 'bunches' },
  pinch: { singular: 'pinch', plural: 'pinches' },
  'to-taste': { singular: '', plural: '' },
};

export const GROCERY_CATEGORY_LABELS: Record<GroceryCategory, string> = {
  produce: 'Produce',
  'meat-seafood': 'Meat & Seafood',
  'dairy-eggs': 'Dairy & Eggs',
  bakery: 'Bakery',
  pantry: 'Pantry',
  'pasta-rice': 'Pasta & Rice',
  'canned-goods': 'Canned Goods',
  frozen: 'Frozen',
  spices: 'Spices',
  condiments: 'Condiments',
  beverages: 'Beverages',
  household: 'Household',
  other: 'Other',
};
