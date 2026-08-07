import { describe, expect, test } from 'vitest';
import type { Recipe } from '@/types';
import { getRecipeAllergenMatches, recipeContainsAllergen } from './allergens';

function makeRecipe(overrides: Pick<Recipe, 'ingredients' | 'tags'>): Recipe {
  return {
    id: 'test-recipe',
    title: 'Test recipe',
    description: '',
    category: 'dinner',
    prepMinutes: 0,
    cookMinutes: 0,
    servings: 2,
    difficulty: 'easy',
    image: { emoji: 'dish' },
    instructions: [],
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('recipe allergen matching', () => {
  test('detects multiple selected allergen matches from ingredients', () => {
    const recipe = makeRecipe({
      tags: [],
      ingredients: [
        { name: 'peanut butter', quantity: 2, unit: 'tbsp', groceryCategory: 'pantry' },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', groceryCategory: 'condiments' },
      ],
    });

    expect(getRecipeAllergenMatches(recipe, ['peanuts', 'soy', 'milk'])).toEqual(['peanuts', 'soy']);
  });

  test('honors recipe tags that explicitly mark an allergen group safe', () => {
    const recipe = makeRecipe({
      tags: ['dairy-free', 'gluten-free', 'nut-free'],
      ingredients: [
        { name: 'coconut milk', quantity: 1, unit: 'cup', groceryCategory: 'pantry' },
        { name: 'gluten-free flour', quantity: 1, unit: 'cup', groceryCategory: 'pantry' },
      ],
    });

    expect(recipeContainsAllergen(recipe, 'milk')).toBe(false);
    expect(recipeContainsAllergen(recipe, 'wheat-gluten')).toBe(false);
    expect(recipeContainsAllergen(recipe, 'tree-nuts')).toBe(false);
  });

  test('does not confuse eggplant with eggs', () => {
    const recipe = makeRecipe({
      tags: [],
      ingredients: [{ name: 'eggplant', quantity: 1, unit: 'unit', groceryCategory: 'produce' }],
    });

    expect(recipeContainsAllergen(recipe, 'eggs')).toBe(false);
  });
});
