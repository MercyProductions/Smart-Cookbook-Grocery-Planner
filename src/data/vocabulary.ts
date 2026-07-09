import type { GroceryCategory, Unit } from '@/types';

export interface VocabularyEntry {
  name: string;
  groceryCategory: GroceryCategory;
  defaultUnit: Unit;
}

// Canonical ingredient list. Every seed recipe ingredient name must match one
// of these exactly (lowercase, singular, no adjectives) so grocery-list
// merging works. The recipe editor uses this list for autocomplete.
export const INGREDIENT_VOCABULARY: VocabularyEntry[] = [
  // produce
  { name: 'yellow onion', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'red onion', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'garlic', groceryCategory: 'produce', defaultUnit: 'clove' },
  { name: 'red bell pepper', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'carrot', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'celery', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'broccoli', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'spinach', groceryCategory: 'produce', defaultUnit: 'bunch' },
  { name: 'tomato', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'cucumber', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'lemon', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'lime', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'avocado', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'russet potato', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'sweet potato', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'mushroom', groceryCategory: 'produce', defaultUnit: 'oz' },
  { name: 'green onion', groceryCategory: 'produce', defaultUnit: 'bunch' },
  { name: 'cilantro', groceryCategory: 'produce', defaultUnit: 'bunch' },
  { name: 'fresh basil', groceryCategory: 'produce', defaultUnit: 'bunch' },
  { name: 'banana', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'apple', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'zucchini', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'jalapeno', groceryCategory: 'produce', defaultUnit: 'unit' },
  { name: 'ginger', groceryCategory: 'produce', defaultUnit: 'oz' },
  { name: 'romaine lettuce', groceryCategory: 'produce', defaultUnit: 'unit' },

  // meat & seafood
  { name: 'chicken breast', groceryCategory: 'meat-seafood', defaultUnit: 'lb' },
  { name: 'chicken thigh', groceryCategory: 'meat-seafood', defaultUnit: 'lb' },
  { name: 'whole chicken', groceryCategory: 'meat-seafood', defaultUnit: 'unit' },
  { name: 'ground beef', groceryCategory: 'meat-seafood', defaultUnit: 'lb' },
  { name: 'ground turkey', groceryCategory: 'meat-seafood', defaultUnit: 'lb' },
  { name: 'salmon fillet', groceryCategory: 'meat-seafood', defaultUnit: 'lb' },
  { name: 'shrimp', groceryCategory: 'meat-seafood', defaultUnit: 'lb' },
  { name: 'bacon', groceryCategory: 'meat-seafood', defaultUnit: 'oz' },

  // dairy & eggs
  { name: 'egg', groceryCategory: 'dairy-eggs', defaultUnit: 'unit' },
  { name: 'milk', groceryCategory: 'dairy-eggs', defaultUnit: 'cup' },
  { name: 'unsalted butter', groceryCategory: 'dairy-eggs', defaultUnit: 'cup' },
  { name: 'cheddar cheese', groceryCategory: 'dairy-eggs', defaultUnit: 'cup' },
  { name: 'mozzarella cheese', groceryCategory: 'dairy-eggs', defaultUnit: 'cup' },
  { name: 'parmesan cheese', groceryCategory: 'dairy-eggs', defaultUnit: 'cup' },
  { name: 'cream cheese', groceryCategory: 'dairy-eggs', defaultUnit: 'oz' },
  { name: 'plain greek yogurt', groceryCategory: 'dairy-eggs', defaultUnit: 'cup' },

  // bakery
  { name: 'bread', groceryCategory: 'bakery', defaultUnit: 'slice' },
  { name: 'burger bun', groceryCategory: 'bakery', defaultUnit: 'unit' },
  { name: 'tortilla', groceryCategory: 'bakery', defaultUnit: 'unit' },
  { name: 'pita bread', groceryCategory: 'bakery', defaultUnit: 'unit' },

  // pantry
  { name: 'all-purpose flour', groceryCategory: 'pantry', defaultUnit: 'cup' },
  { name: 'granulated sugar', groceryCategory: 'pantry', defaultUnit: 'cup' },
  { name: 'brown sugar', groceryCategory: 'pantry', defaultUnit: 'cup' },
  { name: 'baking powder', groceryCategory: 'pantry', defaultUnit: 'tsp' },
  { name: 'baking soda', groceryCategory: 'pantry', defaultUnit: 'tsp' },
  { name: 'olive oil', groceryCategory: 'pantry', defaultUnit: 'tbsp' },
  { name: 'vegetable oil', groceryCategory: 'pantry', defaultUnit: 'tbsp' },
  { name: 'soy sauce', groceryCategory: 'pantry', defaultUnit: 'tbsp' },
  { name: 'honey', groceryCategory: 'pantry', defaultUnit: 'tbsp' },
  { name: 'maple syrup', groceryCategory: 'pantry', defaultUnit: 'tbsp' },
  { name: 'vanilla extract', groceryCategory: 'pantry', defaultUnit: 'tsp' },
  { name: 'rolled oats', groceryCategory: 'pantry', defaultUnit: 'cup' },
  { name: 'white rice', groceryCategory: 'pantry', defaultUnit: 'cup' },
  { name: 'pasta', groceryCategory: 'pantry', defaultUnit: 'oz' },
  { name: 'canned diced tomatoes', groceryCategory: 'pantry', defaultUnit: 'can' },
  { name: 'canned black beans', groceryCategory: 'pantry', defaultUnit: 'can' },
  { name: 'canned chickpeas', groceryCategory: 'pantry', defaultUnit: 'can' },
  { name: 'coconut milk', groceryCategory: 'pantry', defaultUnit: 'can' },
  { name: 'peanut butter', groceryCategory: 'pantry', defaultUnit: 'tbsp' },
  { name: 'chocolate chips', groceryCategory: 'pantry', defaultUnit: 'cup' },
  { name: 'breadcrumbs', groceryCategory: 'pantry', defaultUnit: 'cup' },
  { name: 'tahini', groceryCategory: 'pantry', defaultUnit: 'tbsp' },
  { name: 'quinoa', groceryCategory: 'pantry', defaultUnit: 'cup' },
  { name: 'chicken broth', groceryCategory: 'pantry', defaultUnit: 'cup' },
  { name: 'almonds', groceryCategory: 'pantry', defaultUnit: 'cup' },
  { name: 'walnuts', groceryCategory: 'pantry', defaultUnit: 'cup' },
  { name: 'dried cranberries', groceryCategory: 'pantry', defaultUnit: 'cup' },
  { name: 'graham cracker', groceryCategory: 'pantry', defaultUnit: 'cup' },

  // frozen
  { name: 'frozen peas', groceryCategory: 'frozen', defaultUnit: 'cup' },
  { name: 'frozen corn', groceryCategory: 'frozen', defaultUnit: 'cup' },
  { name: 'frozen mixed berries', groceryCategory: 'frozen', defaultUnit: 'cup' },

  // spices
  { name: 'salt', groceryCategory: 'spices', defaultUnit: 'to-taste' },
  { name: 'black pepper', groceryCategory: 'spices', defaultUnit: 'to-taste' },
  { name: 'garlic powder', groceryCategory: 'spices', defaultUnit: 'tsp' },
  { name: 'onion powder', groceryCategory: 'spices', defaultUnit: 'tsp' },
  { name: 'paprika', groceryCategory: 'spices', defaultUnit: 'tsp' },
  { name: 'ground cumin', groceryCategory: 'spices', defaultUnit: 'tsp' },
  { name: 'chili powder', groceryCategory: 'spices', defaultUnit: 'tsp' },
  { name: 'dried oregano', groceryCategory: 'spices', defaultUnit: 'tsp' },
  { name: 'ground cinnamon', groceryCategory: 'spices', defaultUnit: 'tsp' },
  { name: 'red pepper flakes', groceryCategory: 'spices', defaultUnit: 'pinch' },
  { name: 'italian seasoning', groceryCategory: 'spices', defaultUnit: 'tsp' },

  // beverages
  { name: 'orange juice', groceryCategory: 'beverages', defaultUnit: 'cup' },
];

export function findVocabularyEntry(name: string): VocabularyEntry | undefined {
  const lower = name.toLowerCase();
  return INGREDIENT_VOCABULARY.find((entry) => entry.name === lower);
}
