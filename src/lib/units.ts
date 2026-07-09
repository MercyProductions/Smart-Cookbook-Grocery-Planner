import type { Ingredient } from '@/types';
import { UNIT_LABELS } from './labels';

// Common cooking fractions, checked in descending order so the closest large
// fraction wins (e.g. 0.75 is checked before 0.5).
const FRACTIONS: Array<[value: number, glyph: string]> = [
  [0.75, '¾'],
  [2 / 3, '⅔'],
  [0.5, '½'],
  [1 / 3, '⅓'],
  [0.25, '¼'],
];

// Formats a quantity for display, preferring common cooking fractions
// (within 0.02 of the target) and otherwise rounding to 1 decimal place.
export function formatQuantity(quantity: number): string {
  if (quantity <= 0) return '0';

  const whole = Math.floor(quantity);
  const frac = quantity - whole;

  for (const [value, glyph] of FRACTIONS) {
    if (Math.abs(frac - value) <= 0.02) {
      return whole > 0 ? `${whole}${glyph}` : glyph;
    }
  }

  return `${Math.round(quantity * 10) / 10}`;
}

// Formats a full ingredient line for display, e.g. "2 cups flour" or
// "salt — to taste".
export function formatIngredientLine(ingredient: Ingredient): string {
  if (ingredient.unit === 'to-taste') {
    return `${ingredient.name} — to taste`;
  }

  const unitLabel = UNIT_LABELS[ingredient.unit];
  const label = ingredient.quantity > 1 ? unitLabel.plural : unitLabel.singular;
  const qtyText = formatQuantity(ingredient.quantity);

  return label ? `${qtyText} ${label} ${ingredient.name}` : `${qtyText} ${ingredient.name}`;
}
