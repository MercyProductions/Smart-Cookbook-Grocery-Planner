import type { Allergy, Recipe } from '@/types';

export const ALLERGY_LABELS: Record<Allergy, string> = {
  peanuts: 'Peanuts',
  'tree-nuts': 'Tree nuts',
  milk: 'Milk and dairy',
  eggs: 'Eggs',
  'wheat-gluten': 'Wheat and gluten',
  soy: 'Soy',
  fish: 'Fish',
  shellfish: 'Shellfish',
  sesame: 'Sesame',
};

export const ALLERGIES = Object.keys(ALLERGY_LABELS) as Allergy[];

const ALLERGEN_PATTERNS: Record<Allergy, RegExp> = {
  peanuts: /\bpeanut(s)?\b/i,
  'tree-nuts': /\b(almond|cashew|walnut|pecan|pistachio|hazelnut|macadamia|brazil nut|nut)\b/i,
  milk: /\b(milk|butter|cheese|cream|yogurt|yoghurt|ghee|whey)\b/i,
  eggs: /\begg(s)?\b/i,
  'wheat-gluten': /\b(wheat|flour|bread|pasta|couscous|dough|barley|rye)\b/i,
  soy: /\bsoy(a)?\b|tofu|edamame|miso|tempeh/i,
  fish: /\b(fish|salmon|tuna|cod|anchovy|sardine|trout|tilapia)\b/i,
  shellfish: /\b(shrimp|prawn|crab|lobster|scallop|mussel|clam|oyster)\b/i,
  sesame: /\bsesame|tahini\b/i,
};

const PLANT_BASED_DAIRY_ALTERNATIVES = /\b(peanut|almond|cashew|coconut|oat|soy|rice|sunflower) (butter|milk|cream|yogurt)\b/i;

function recipeIsTaggedSafe(recipe: Recipe, allergy: Allergy): boolean {
  if (allergy === 'tree-nuts') return recipe.tags.includes('nut-free');
  if (allergy === 'milk') return recipe.tags.includes('dairy-free') || recipe.tags.includes('vegan');
  if (allergy === 'wheat-gluten') return recipe.tags.includes('gluten-free');
  return false;
}

export function recipeContainsAllergen(recipe: Recipe, allergy: Allergy): boolean {
  if (recipeIsTaggedSafe(recipe, allergy)) return false;
  return recipe.ingredients.some((ingredient) => {
    if (allergy === 'milk' && PLANT_BASED_DAIRY_ALTERNATIVES.test(ingredient.name)) return false;
    return ALLERGEN_PATTERNS[allergy].test(ingredient.name);
  });
}

export function getRecipeAllergenMatches(recipe: Recipe, allergies: Allergy[]): Allergy[] {
  return allergies.filter((allergy) => recipeContainsAllergen(recipe, allergy));
}
