import type { Ingredient, Unit } from '@/types';
import { UNIT_LABELS } from './labels';

// Unit families for grocery-list merging. Units only merge within the same
// family — never across families (e.g. cups never merge with ml, even for
// the same ingredient). Compatible units convert to a shared base unit;
// each "own family" unit is a singleton with no conversion.
export type UnitFamily =
  | 'volume-us'
  | 'volume-metric'
  | 'weight-us'
  | 'weight-metric'
  | 'count'
  | 'clove'
  | 'can'
  | 'slice'
  | 'bunch'
  | 'pinch'
  | 'to-taste';

const UNIT_FAMILY: Record<Unit, UnitFamily> = {
  tsp: 'volume-us',
  tbsp: 'volume-us',
  cup: 'volume-us',
  ml: 'volume-metric',
  l: 'volume-metric',
  oz: 'weight-us',
  lb: 'weight-us',
  g: 'weight-metric',
  kg: 'weight-metric',
  unit: 'count',
  clove: 'clove',
  can: 'can',
  slice: 'slice',
  bunch: 'bunch',
  pinch: 'pinch',
  'to-taste': 'to-taste',
};

// How many of a family's base unit make up one of this unit.
const TO_BASE_FACTOR: Record<Unit, number> = {
  tsp: 1,
  tbsp: 3,
  cup: 48,
  ml: 1,
  l: 1000,
  oz: 1,
  lb: 16,
  g: 1,
  kg: 1000,
  unit: 1,
  clove: 1,
  can: 1,
  slice: 1,
  bunch: 1,
  pinch: 1,
  'to-taste': 1,
};

// Units within each family, smallest to largest.
const FAMILY_UNITS_ASCENDING: Record<UnitFamily, Unit[]> = {
  'volume-us': ['tsp', 'tbsp', 'cup'],
  'volume-metric': ['ml', 'l'],
  'weight-us': ['oz', 'lb'],
  'weight-metric': ['g', 'kg'],
  count: ['unit'],
  clove: ['clove'],
  can: ['can'],
  slice: ['slice'],
  bunch: ['bunch'],
  pinch: ['pinch'],
  'to-taste': ['to-taste'],
};

// Promote only when the resulting value is easy to read in a grocery aisle.
// For example, 3 tbsp should not become the less useful "0.2 cup".
const DISPLAY_MINIMUMS: Partial<Record<Unit, number>> = {
  tbsp: 1,
  cup: 0.25,
  l: 0.25,
  lb: 0.5,
  kg: 0.25,
};

export function getUnitFamily(unit: Unit): UnitFamily {
  return UNIT_FAMILY[unit];
}

// Converts a quantity in the given unit to its family's base unit.
export function toBaseUnits(quantity: number, unit: Unit): number {
  return quantity * TO_BASE_FACTOR[unit];
}

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

// Picks the display unit for a base-unit total: the largest unit in the
// family whose formatted value doesn't round down to "0" (so 24 base tsp of
// butter promotes to "½ cup" rather than "8 tbsp", but 2 tsp of baking
// powder doesn't get force-promoted to an unreadable "0 cup").
export function chooseDisplayUnit(baseQuantity: number, family: UnitFamily): { quantity: number; unit: Unit } {
  const units = FAMILY_UNITS_ASCENDING[family];

  for (let i = units.length - 1; i >= 0; i--) {
    const unit = units[i];
    const value = baseQuantity / TO_BASE_FACTOR[unit];
    if (value >= (DISPLAY_MINIMUMS[unit] ?? 1)) {
      return { quantity: value, unit };
    }
  }

  const smallest = units[0];
  return { quantity: baseQuantity / TO_BASE_FACTOR[smallest], unit: smallest };
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
