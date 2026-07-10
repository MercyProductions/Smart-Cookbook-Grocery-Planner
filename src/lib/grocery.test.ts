import { describe, expect, test } from 'vitest';
import type { MealPlanEntry, Recipe } from '@/types';
import { buildGroceryList } from './grocery';
import { formatQuantity } from './units';

function makeRecipe(overrides: Pick<Recipe, 'id' | 'title' | 'servings' | 'ingredients'>): Recipe {
  return {
    description: '',
    category: 'dinner',
    tags: [],
    prepMinutes: 0,
    cookMinutes: 0,
    difficulty: 'easy',
    image: { emoji: '🍽️' },
    instructions: [],
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function entry(recipeId: string, servings: number): MealPlanEntry {
  return { recipeId, servings };
}

describe('buildGroceryList', () => {
  test('merges the same ingredient in compatible units and sums quantities', () => {
    const recipeA = makeRecipe({
      id: 'a',
      title: 'Recipe A',
      servings: 4,
      ingredients: [{ name: 'all-purpose flour', quantity: 2, unit: 'cup', groceryCategory: 'pantry' }],
    });
    const recipeB = makeRecipe({
      id: 'b',
      title: 'Recipe B',
      servings: 4,
      ingredients: [{ name: 'all-purpose flour', quantity: 1, unit: 'cup', groceryCategory: 'pantry' }],
    });

    const result = buildGroceryList([entry('a', 4), entry('b', 4)], [recipeA, recipeB]);

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(3);
    expect(result[0].unit).toBe('cup');
    expect(result[0].sourceRecipes).toEqual(['Recipe A', 'Recipe B']);
  });

  test('keeps the same ingredient in incompatible units as separate lines', () => {
    const recipeA = makeRecipe({
      id: 'a',
      title: 'Recipe A',
      servings: 2,
      ingredients: [{ name: 'milk', quantity: 1, unit: 'cup', groceryCategory: 'dairy-eggs' }],
    });
    const recipeB = makeRecipe({
      id: 'b',
      title: 'Recipe B',
      servings: 2,
      ingredients: [{ name: 'milk', quantity: 500, unit: 'ml', groceryCategory: 'dairy-eggs' }],
    });

    const result = buildGroceryList([entry('a', 2), entry('b', 2)], [recipeA, recipeB]);

    expect(result).toHaveLength(2);
    expect(new Set(result.map((item) => item.key)).size).toBe(2);
    expect(result.every((item) => item.name === 'milk')).toBe(true);
  });

  test('scales ingredient quantities by the servings ratio', () => {
    const recipe = makeRecipe({
      id: 'a',
      title: 'Recipe A',
      servings: 4,
      ingredients: [{ name: 'egg', quantity: 2, unit: 'unit', groceryCategory: 'dairy-eggs' }],
    });

    const result = buildGroceryList([entry('a', 6)], [recipe]);

    expect(result[0].quantity).toBe(3); // 2 * (6/4)
  });

  test('promotes to the largest compatible unit and formats as a fraction', () => {
    const recipeA = makeRecipe({
      id: 'a',
      title: 'Recipe A',
      servings: 4,
      ingredients: [{ name: 'unsalted butter', quantity: 4, unit: 'tbsp', groceryCategory: 'dairy-eggs' }],
    });
    const recipeB = makeRecipe({
      id: 'b',
      title: 'Recipe B',
      servings: 4,
      ingredients: [{ name: 'unsalted butter', quantity: 4, unit: 'tbsp', groceryCategory: 'dairy-eggs' }],
    });

    const result = buildGroceryList([entry('a', 4), entry('b', 4)], [recipeA, recipeB]);

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(0.5);
    expect(result[0].unit).toBe('cup');
    expect(formatQuantity(result[0].quantity)).toBe('½');
  });

  test('merges to-taste ingredients from multiple recipes into a single line', () => {
    const recipes = ['a', 'b', 'c'].map((id, index) =>
      makeRecipe({
        id,
        title: `Recipe ${index + 1}`,
        servings: 4,
        ingredients: [{ name: 'salt', quantity: 0, unit: 'to-taste', groceryCategory: 'spices' }],
      }),
    );

    const result = buildGroceryList(
      recipes.map((recipe) => entry(recipe.id, 4)),
      recipes,
    );

    expect(result).toHaveLength(1);
    expect(result[0].unit).toBe('to-taste');
    expect(result[0].sourceRecipes).toEqual(['Recipe 1', 'Recipe 2', 'Recipe 3']);
  });

  test('skips meal plan entries that reference a deleted recipe without crashing', () => {
    const recipe = makeRecipe({
      id: 'a',
      title: 'Recipe A',
      servings: 4,
      ingredients: [{ name: 'egg', quantity: 1, unit: 'unit', groceryCategory: 'dairy-eggs' }],
    });

    expect(() => buildGroceryList([entry('a', 4), entry('deleted-recipe', 2)], [recipe])).not.toThrow();

    const result = buildGroceryList([entry('a', 4), entry('deleted-recipe', 2)], [recipe]);
    expect(result).toHaveLength(1);
  });

  test('sorts by grocery category order, then alphabetically within category', () => {
    const recipe = makeRecipe({
      id: 'a',
      title: 'Recipe A',
      servings: 1,
      ingredients: [
        { name: 'zucchini', quantity: 1, unit: 'unit', groceryCategory: 'produce' },
        { name: 'apple', quantity: 1, unit: 'unit', groceryCategory: 'produce' },
        { name: 'egg', quantity: 1, unit: 'unit', groceryCategory: 'dairy-eggs' },
        { name: 'salt', quantity: 0, unit: 'to-taste', groceryCategory: 'spices' },
      ],
    });

    const result = buildGroceryList([entry('a', 1)], [recipe]);

    expect(result.map((item) => item.name)).toEqual(['apple', 'zucchini', 'egg', 'salt']);
  });
});
