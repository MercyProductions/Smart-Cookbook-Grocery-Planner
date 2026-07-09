import type { Ingredient } from '@/types';

export function scaleIngredient(ingredient: Ingredient, factor: number): Ingredient {
  if (ingredient.unit === 'to-taste') return ingredient;
  return { ...ingredient, quantity: ingredient.quantity * factor };
}
