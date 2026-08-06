import type { DietaryTag, Difficulty, Ingredient, Recipe, RecipeCategory, Unit } from '@/types';
import { findVocabularyEntry } from './vocabulary';

type Spec = ReturnType<typeof ingredient>;
type Method = 'assemble' | 'blender' | 'bowl' | 'griddle' | 'oven' | 'skillet' | 'stovetop' | 'pasta' | 'soup';

interface FlavorProfile {
  key: string;
  label: string;
  emoji: string;
  ingredients: Spec[];
  tags: DietaryTag[];
}

interface RecipeFormat {
  key: string;
  label: string;
  category: RecipeCategory;
  emoji: string;
  method: Method;
  baseIngredients: Spec[];
  tags: DietaryTag[];
  time: readonly [number, number];
  servings: number;
  difficulty: Difficulty;
  blurb: string;
}

function ingredient(name: string, quantity: number, unit: Unit, note?: string): readonly [string, number, Unit, string?] {
  return [name, quantity, unit, note];
}

function flavor(
  key: string,
  label: string,
  emoji: string,
  ingredients: Spec[],
  tags: DietaryTag[] = [],
): FlavorProfile {
  return { key, label, emoji, ingredients, tags };
}

function format(
  key: string,
  label: string,
  category: RecipeCategory,
  emoji: string,
  method: Method,
  baseIngredients: Spec[],
  tags: DietaryTag[],
  time: readonly [number, number],
  servings: number,
  difficulty: Difficulty,
  blurb: string,
): RecipeFormat {
  return { key, label, category, emoji, method, baseIngredients, tags, time, servings, difficulty, blurb };
}

function mergeSpecs(specs: Spec[]): Spec[] {
  const merged = new Map<string, { name: string; quantity: number; unit: Unit; note?: string }>();
  for (const [name, quantity, unit, note] of specs) {
    const key = `${name}|${unit}`;
    const current = merged.get(key);
    if (current) current.quantity += quantity;
    else merged.set(key, { name, quantity, unit, ...(note ? { note } : {}) });
  }
  return Array.from(merged.values()).map(({ name, quantity, unit, note }) => ingredient(name, quantity, unit, note));
}

function toIngredient([name, quantity, unit, note]: Spec): Ingredient {
  const vocabulary = findVocabularyEntry(name);
  if (!vocabulary) throw new Error(`Unknown ingredient "${name}" in generated recipe atlas.`);
  return {
    name,
    quantity,
    unit,
    groceryCategory: vocabulary.groceryCategory,
    ...(note ? { note } : {}),
  };
}

function uniqueTags(...tagSets: DietaryTag[][]): DietaryTag[] {
  return Array.from(new Set(tagSets.flat()));
}

function instructions(method: Method, flavorName: string, formatLabel: string): string[] {
  const ingredients = `${flavorName.toLowerCase()} ingredients`;
  switch (method) {
    case 'assemble':
      return [`Prepare the ${ingredients} and arrange the base for this ${formatLabel.toLowerCase()}.`, `Layer or toss everything together until evenly distributed.`, `Season to taste and serve immediately or chill for later.`];
    case 'blender':
      return [`Add the base and ${ingredients} to a blender.`, 'Blend until smooth, adding a splash of liquid if needed.', 'Taste, adjust the seasoning, and serve cold.'];
    case 'bowl':
      return ['Cook the grain base according to its package directions.', `Prepare the ${ingredients} until tender and flavorful.`, `Build the ${formatLabel.toLowerCase()} with the grain, main, and toppings.`];
    case 'griddle':
      return [`Whisk the base ingredients together with the ${ingredients}.`, 'Cook portions on a lightly greased griddle until golden on both sides.', 'Serve warm with the toppings or sauce of your choice.'];
    case 'oven':
      return [`Heat the oven to 400°F and combine the base with the ${ingredients}.`, 'Arrange everything in a greased baking dish or sheet pan.', 'Bake until browned, tender, and cooked through.'];
    case 'skillet':
      return [`Heat a large skillet and cook the main ${ingredients} until browned or tender.`, 'Add the base ingredients and stir until everything is hot and well coated.', `Finish the ${formatLabel.toLowerCase()} with fresh seasoning and serve.`];
    case 'stovetop':
      return [`Combine the base ingredients in a saucepan and bring them to a gentle simmer.`, `Stir in the ${ingredients} and cook until tender and flavorful.`, 'Taste, adjust the seasoning, and serve hot.'];
    case 'pasta':
      return [`Cook the pasta or grain base until tender and reserve a little cooking water.`, `Cook the ${ingredients} in a skillet until ready.`, 'Toss everything together, loosening with cooking water as needed, and serve.'];
    case 'soup':
      return [`Sauté the aromatic base ingredients in a large pot.`, `Add the ${ingredients} and enough broth or liquid to cover; simmer until tender.`, 'Taste, finish with herbs or lemon, and serve hot.'];
  }
}

function generatedRecipe(formatSpec: RecipeFormat, profile: FlavorProfile): Recipe {
  const specs = mergeSpecs([...formatSpec.baseIngredients, ...profile.ingredients]);
  return {
    id: `generated-${formatSpec.category}-${formatSpec.key}-${profile.key}`,
    title: `${profile.label} ${formatSpec.label}`,
    description: `${formatSpec.blurb} Built around ${profile.label.toLowerCase()} flavors for another easy choice in the library.`,
    category: formatSpec.category,
    tags: uniqueTags(formatSpec.tags, profile.tags),
    prepMinutes: formatSpec.time[0],
    cookMinutes: formatSpec.time[1],
    servings: formatSpec.servings,
    difficulty: formatSpec.difficulty,
    image: { emoji: profile.emoji || formatSpec.emoji },
    ingredients: specs.map(toIngredient),
    instructions: instructions(formatSpec.method, profile.label, formatSpec.label),
    isCustom: false,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  };
}

const SWEET_BREAKFAST_FLAVORS: FlavorProfile[] = [
  flavor('apple-cinnamon', 'Apple Cinnamon', '🍎', [ingredient('apple', 1, 'unit'), ingredient('ground cinnamon', 1, 'tsp')], ['vegetarian', 'healthy', 'high-fiber']),
  flavor('berry-almond', 'Berry Almond', '🫐', [ingredient('frozen mixed berries', 1, 'cup'), ingredient('almonds', 0.25, 'cup')], ['vegetarian', 'healthy']),
  flavor('banana-peanut-butter', 'Banana Peanut Butter', '🍌', [ingredient('banana', 1, 'unit'), ingredient('peanut butter', 2, 'tbsp')], ['vegetarian', 'high-protein', 'kid-friendly']),
  flavor('pumpkin-spice', 'Pumpkin Spice', '🎃', [ingredient('pumpkin puree', 0.5, 'cup'), ingredient('ground cinnamon', 1, 'tsp'), ingredient('ground nutmeg', 0.25, 'tsp')], ['vegetarian', 'comfort-food']),
  flavor('peach-maple', 'Peach Maple', '🍑', [ingredient('peach', 1, 'unit'), ingredient('maple syrup', 1, 'tbsp')], ['vegetarian', 'kid-friendly']),
  flavor('orange-cranberry', 'Orange Cranberry', '🍊', [ingredient('orange juice', 0.5, 'cup'), ingredient('dried cranberries', 0.25, 'cup')], ['vegetarian', 'healthy']),
  flavor('chocolate-banana', 'Chocolate Banana', '🍫', [ingredient('banana', 1, 'unit'), ingredient('chocolate chips', 2, 'tbsp')], ['vegetarian', 'kid-friendly', 'comfort-food']),
  flavor('coconut-mango', 'Coconut Mango', '🥭', [ingredient('mango', 1, 'unit'), ingredient('coconut milk', 0.5, 'can')], ['vegetarian', 'dairy-free']),
  flavor('lemon-blueberry', 'Lemon Blueberry', '🍋', [ingredient('frozen mixed berries', 1, 'cup'), ingredient('lemon', 0.5, 'unit')], ['vegetarian', 'healthy']),
  flavor('pear-walnut', 'Pear Walnut', '🍐', [ingredient('pear', 1, 'unit'), ingredient('walnuts', 0.25, 'cup')], ['vegetarian', 'healthy', 'high-fiber']),
  flavor('raisin-cinnamon', 'Raisin Cinnamon', '🍇', [ingredient('raisins', 0.25, 'cup'), ingredient('ground cinnamon', 1, 'tsp')], ['vegetarian', 'budget-friendly']),
  flavor('honey-yogurt', 'Honey Yogurt', '🍯', [ingredient('plain greek yogurt', 0.5, 'cup'), ingredient('honey', 1, 'tbsp')], ['vegetarian', 'high-protein']),
  flavor('apple-cranberry', 'Apple Cranberry', '🍏', [ingredient('apple', 1, 'unit'), ingredient('dried cranberries', 0.25, 'cup')], ['vegetarian', 'high-fiber']),
  flavor('coconut-chocolate', 'Coconut Chocolate', '🥥', [ingredient('shredded coconut', 0.25, 'cup'), ingredient('chocolate chips', 2, 'tbsp')], ['vegetarian', 'dairy-free']),
  flavor('cinnamon-peach', 'Cinnamon Peach', '🍑', [ingredient('peach', 1, 'unit'), ingredient('ground cinnamon', 1, 'tsp')], ['vegetarian', 'comfort-food']),
  flavor('blueberry-vanilla', 'Blueberry Vanilla', '🫐', [ingredient('frozen mixed berries', 1, 'cup'), ingredient('vanilla extract', 1, 'tsp')], ['vegetarian', 'kid-friendly']),
  flavor('banana-walnut', 'Banana Walnut', '🍌', [ingredient('banana', 1, 'unit'), ingredient('walnuts', 0.25, 'cup')], ['vegetarian', 'high-fiber']),
  flavor('maple-almond', 'Maple Almond', '🥜', [ingredient('maple syrup', 1, 'tbsp'), ingredient('almonds', 0.25, 'cup')], ['vegetarian', 'healthy']),
];

const SAVORY_BREAKFAST_FLAVORS: FlavorProfile[] = [
  flavor('spinach-feta', 'Spinach Feta', '🥬', [ingredient('spinach', 0.25, 'bunch'), ingredient('feta cheese', 0.25, 'cup')], ['vegetarian', 'high-protein']),
  flavor('mushroom-cheddar', 'Mushroom Cheddar', '🍄', [ingredient('mushroom', 5, 'oz'), ingredient('cheddar cheese', 0.25, 'cup')], ['vegetarian', 'comfort-food']),
  flavor('tomato-basil', 'Tomato Basil', '🍅', [ingredient('tomato', 1, 'unit'), ingredient('fresh basil', 0.25, 'bunch'), ingredient('mozzarella cheese', 0.25, 'cup')], ['vegetarian', 'mediterranean']),
  flavor('southwest-bean', 'Southwest Bean', '🌽', [ingredient('canned black beans', 0.5, 'can'), ingredient('frozen corn', 0.5, 'cup'), ingredient('salsa', 0.25, 'cup')], ['vegetarian', 'high-fiber', 'budget-friendly']),
  flavor('bacon-potato', 'Bacon Potato', '🥓', [ingredient('bacon', 2, 'oz'), ingredient('russet potato', 1, 'unit')], ['high-protein', 'comfort-food']),
  flavor('salmon-cucumber', 'Salmon Cucumber', '🐟', [ingredient('salmon fillet', 0.25, 'lb'), ingredient('cucumber', 0.5, 'unit'), ingredient('lemon', 0.5, 'unit')], ['pescatarian', 'high-protein']),
  flavor('sausage-pepper', 'Sausage Pepper', '🌶️', [ingredient('turkey sausage', 0.25, 'lb'), ingredient('red bell pepper', 0.5, 'unit')], ['high-protein', 'quick']),
  flavor('avocado-lime', 'Avocado Lime', '🥑', [ingredient('avocado', 0.5, 'unit'), ingredient('lime', 0.5, 'unit'), ingredient('tomato', 0.5, 'unit')], ['vegetarian', 'healthy']),
  flavor('broccoli-cheddar', 'Broccoli Cheddar', '🥦', [ingredient('broccoli', 0.5, 'unit'), ingredient('cheddar cheese', 0.25, 'cup')], ['vegetarian', 'kid-friendly']),
  flavor('sweet-potato-kale', 'Sweet Potato Kale', '🍠', [ingredient('sweet potato', 1, 'unit'), ingredient('kale', 0.25, 'bunch')], ['vegetarian', 'high-fiber', 'healthy']),
  flavor('greek-tomato', 'Greek Tomato', '🫒', [ingredient('tomato', 1, 'unit'), ingredient('feta cheese', 0.25, 'cup'), ingredient('dried oregano', 0.5, 'tsp')], ['vegetarian', 'mediterranean']),
  flavor('zucchini-herb', 'Zucchini Herb', '🥒', [ingredient('zucchini', 0.5, 'unit'), ingredient('parmesan cheese', 0.25, 'cup'), ingredient('dried oregano', 0.5, 'tsp')], ['vegetarian', 'healthy']),
  flavor('black-bean-salsa', 'Black Bean Salsa', '🌮', [ingredient('canned black beans', 0.5, 'can'), ingredient('salsa', 0.25, 'cup'), ingredient('cheddar cheese', 0.25, 'cup')], ['vegetarian', 'high-fiber']),
  flavor('turkey-cheddar', 'Turkey Cheddar', '🥪', [ingredient('deli turkey', 2, 'oz'), ingredient('cheddar cheese', 0.25, 'cup'), ingredient('tomato', 0.5, 'unit')], ['high-protein', 'kid-friendly']),
  flavor('chicken-tomato', 'Chicken Tomato', '🍗', [ingredient('chicken breast', 0.25, 'lb'), ingredient('tomato', 0.5, 'unit'), ingredient('mozzarella cheese', 0.25, 'cup')], ['high-protein']),
  flavor('garlic-mushroom', 'Garlic Mushroom', '🍄', [ingredient('mushroom', 5, 'oz'), ingredient('garlic', 2, 'clove'), ingredient('parmesan cheese', 0.25, 'cup')], ['vegetarian', 'quick']),
  flavor('garden-veggie', 'Garden Veggie', '🥕', [ingredient('carrot', 1, 'unit'), ingredient('spinach', 0.25, 'bunch'), ingredient('red bell pepper', 0.5, 'unit')], ['vegetarian', 'healthy']),
  flavor('cottage-spinach', 'Cottage Spinach', '🥚', [ingredient('cottage cheese', 0.5, 'cup'), ingredient('spinach', 0.25, 'bunch'), ingredient('black pepper', 0, 'to-taste')], ['vegetarian', 'high-protein']),
];

const BREAKFAST_SWEET_FORMATS: RecipeFormat[] = [
  format('oatmeal-bowl', 'Oatmeal Bowl', 'breakfast', '🥣', 'stovetop', [ingredient('rolled oats', 1, 'cup'), ingredient('milk', 1.5, 'cup')], ['quick'], [5, 8], 2, 'easy', 'A cozy breakfast bowl that is warm, filling, and easy to customize.'),
  format('smoothie', 'Breakfast Smoothie', 'breakfast', '🥤', 'blender', [ingredient('almond milk', 1, 'cup')], ['quick', 'healthy'], [5, 0], 2, 'easy', 'A fast blended breakfast for mornings when you want something light and refreshing.'),
  format('pancakes', 'Pancakes', 'breakfast', '🥞', 'griddle', [ingredient('all-purpose flour', 1, 'cup'), ingredient('baking powder', 1, 'tsp'), ingredient('egg', 1, 'unit'), ingredient('milk', 0.75, 'cup')], ['comfort-food', 'kid-friendly'], [10, 12], 3, 'easy', 'A familiar griddle breakfast with a soft center and golden edges.'),
  format('baked-oats', 'Baked Oats', 'breakfast', '🍎', 'oven', [ingredient('rolled oats', 1, 'cup'), ingredient('milk', 1, 'cup'), ingredient('egg', 1, 'unit')], ['healthy', 'meal-prep'], [10, 30], 4, 'easy', 'A make-ahead breakfast that eats like a soft, fruit-filled cake.'),
  format('yogurt-bowl', 'Yogurt Bowl', 'breakfast', '🍓', 'assemble', [ingredient('plain greek yogurt', 1, 'cup')], ['quick', 'high-protein'], [5, 0], 2, 'easy', 'A cool, creamy breakfast bowl with plenty of texture and fresh flavor.'),
  format('sweet-toast', 'Breakfast Toast', 'breakfast', '🍞', 'assemble', [ingredient('bread', 2, 'slice')], ['quick', 'kid-friendly'], [5, 3], 1, 'easy', 'A quick breakfast toast that turns pantry staples into something satisfying.'),
];

const BREAKFAST_SAVORY_FORMATS: RecipeFormat[] = [
  format('scramble', 'Scramble', 'breakfast', '🍳', 'skillet', [ingredient('egg', 3, 'unit'), ingredient('olive oil', 1, 'tbsp')], ['quick', 'high-protein'], [8, 8], 2, 'easy', 'A fast skillet breakfast with fluffy eggs and savory mix-ins.'),
  format('frittata', 'Frittata', 'breakfast', '🥚', 'oven', [ingredient('egg', 6, 'unit'), ingredient('olive oil', 1, 'tbsp')], ['high-protein', 'meal-prep'], [10, 22], 4, 'medium', 'An oven-finished egg dish that slices cleanly for breakfast or brunch.'),
  format('breakfast-wrap', 'Breakfast Wrap', 'breakfast', '🌯', 'skillet', [ingredient('tortilla', 2, 'unit'), ingredient('egg', 3, 'unit')], ['quick', 'high-protein'], [8, 10], 2, 'easy', 'A warm handheld breakfast built for busy mornings.'),
  format('pita-pizza', 'Breakfast Pita Pizza', 'breakfast', '🍕', 'oven', [ingredient('pita bread', 2, 'unit'), ingredient('egg', 2, 'unit'), ingredient('mozzarella cheese', 0.5, 'cup')], ['kid-friendly'], [10, 15], 2, 'easy', 'A fun open-faced breakfast with crisp edges and a melty topping.'),
  format('breakfast-sandwich', 'Breakfast Sandwich', 'breakfast', '🥪', 'skillet', [ingredient('english muffin', 2, 'unit'), ingredient('egg', 2, 'unit'), ingredient('cheddar cheese', 2, 'slice')], ['quick', 'kid-friendly'], [8, 10], 2, 'easy', 'A portable breakfast sandwich with a warm, savory center.'),
  format('breakfast-hash', 'Breakfast Hash', 'breakfast', '🥔', 'skillet', [ingredient('russet potato', 2, 'unit'), ingredient('egg', 2, 'unit'), ingredient('olive oil', 2, 'tbsp')], ['one-pot', 'comfort-food'], [10, 25], 3, 'easy', 'A crisp skillet hash that turns a few ingredients into a complete breakfast.'),
];

const LUNCH_FLAVORS: FlavorProfile[] = [
  flavor('lemon-herb-chicken', 'Lemon Herb Chicken', '🍋', [ingredient('chicken breast', 0.5, 'lb'), ingredient('lemon', 1, 'unit'), ingredient('garlic', 2, 'clove'), ingredient('dried oregano', 1, 'tsp')], ['high-protein', 'healthy']),
  flavor('honey-garlic-chicken', 'Honey Garlic Chicken', '🍯', [ingredient('chicken breast', 0.5, 'lb'), ingredient('honey', 2, 'tbsp'), ingredient('garlic', 2, 'clove')], ['high-protein', 'kid-friendly']),
  flavor('buffalo-chicken', 'Buffalo Chicken', '🌶️', [ingredient('chicken breast', 0.5, 'lb'), ingredient('hot sauce', 2, 'tbsp'), ingredient('plain greek yogurt', 0.25, 'cup')], ['high-protein', 'quick']),
  flavor('chicken-caesar', 'Chicken Caesar', '🥬', [ingredient('chicken breast', 0.5, 'lb'), ingredient('romaine lettuce', 1, 'unit'), ingredient('parmesan cheese', 0.25, 'cup'), ingredient('lemon', 0.5, 'unit')], ['high-protein', 'quick']),
  flavor('greek-chicken', 'Greek Chicken', '🫒', [ingredient('chicken breast', 0.5, 'lb'), ingredient('cucumber', 0.5, 'unit'), ingredient('tomato', 1, 'unit'), ingredient('feta cheese', 0.25, 'cup')], ['high-protein', 'mediterranean']),
  flavor('teriyaki-chicken', 'Teriyaki Chicken', '🍚', [ingredient('chicken breast', 0.5, 'lb'), ingredient('soy sauce', 2, 'tbsp'), ingredient('honey', 1, 'tbsp'), ingredient('ginger', 0.25, 'oz')], ['high-protein', 'meal-prep']),
  flavor('turkey-avocado', 'Turkey Avocado', '🥑', [ingredient('deli turkey', 3, 'oz'), ingredient('avocado', 0.5, 'unit'), ingredient('tomato', 1, 'unit')], ['high-protein', 'quick']),
  flavor('turkey-bacon', 'Turkey Bacon', '🥓', [ingredient('deli turkey', 3, 'oz'), ingredient('bacon', 2, 'oz'), ingredient('romaine lettuce', 0.5, 'unit')], ['high-protein', 'comfort-food']),
  flavor('tuna-lemon', 'Lemon Tuna', '🐟', [ingredient('canned tuna', 1, 'can'), ingredient('lemon', 0.5, 'unit'), ingredient('cucumber', 0.5, 'unit'), ingredient('mayonnaise', 1, 'tbsp')], ['pescatarian', 'high-protein']),
  flavor('tuna-tomato', 'Tomato Tuna', '🍅', [ingredient('canned tuna', 1, 'can'), ingredient('tomato', 1, 'unit'), ingredient('red onion', 0.25, 'unit')], ['pescatarian', 'quick']),
  flavor('salmon-cucumber', 'Salmon Cucumber', '🐟', [ingredient('salmon fillet', 0.5, 'lb'), ingredient('cucumber', 0.5, 'unit'), ingredient('lemon', 0.5, 'unit')], ['pescatarian', 'high-protein', 'healthy']),
  flavor('shrimp-lime', 'Lime Shrimp', '🍤', [ingredient('shrimp', 0.5, 'lb'), ingredient('lime', 1, 'unit'), ingredient('jalapeno', 0.5, 'unit')], ['pescatarian', 'high-protein', 'quick']),
  flavor('shrimp-garlic', 'Garlic Shrimp', '🍤', [ingredient('shrimp', 0.5, 'lb'), ingredient('garlic', 3, 'clove'), ingredient('lemon', 0.5, 'unit')], ['pescatarian', 'high-protein']),
  flavor('beef-fajita', 'Beef Fajita', '🥩', [ingredient('beef steak', 0.5, 'lb'), ingredient('red bell pepper', 1, 'unit'), ingredient('yellow onion', 0.5, 'unit'), ingredient('lime', 0.5, 'unit')], ['high-protein', 'quick']),
  flavor('beef-taco', 'Beef Taco', '🌮', [ingredient('ground beef', 0.5, 'lb'), ingredient('tomato', 1, 'unit'), ingredient('cheddar cheese', 0.25, 'cup'), ingredient('ground cumin', 1, 'tsp')], ['high-protein', 'kid-friendly']),
  flavor('chickpea-mediterranean', 'Mediterranean Chickpea', '🥗', [ingredient('canned chickpeas', 1, 'can'), ingredient('cucumber', 0.5, 'unit'), ingredient('tomato', 1, 'unit'), ingredient('feta cheese', 0.25, 'cup')], ['vegetarian', 'high-fiber', 'mediterranean']),
  flavor('chickpea-tahini', 'Lemon Tahini Chickpea', '🧆', [ingredient('canned chickpeas', 1, 'can'), ingredient('tahini', 2, 'tbsp'), ingredient('lemon', 0.5, 'unit'), ingredient('garlic', 1, 'clove')], ['vegan', 'vegetarian', 'high-fiber']),
  flavor('black-bean-corn', 'Black Bean Corn', '🌽', [ingredient('canned black beans', 1, 'can'), ingredient('frozen corn', 0.75, 'cup'), ingredient('salsa', 0.5, 'cup'), ingredient('avocado', 0.5, 'unit')], ['vegan', 'vegetarian', 'high-fiber']),
  flavor('tofu-ginger', 'Ginger Tofu', '🥢', [ingredient('tofu', 0.5, 'lb'), ingredient('soy sauce', 2, 'tbsp'), ingredient('ginger', 0.25, 'oz'), ingredient('carrot', 1, 'unit')], ['vegan', 'vegetarian', 'high-protein']),
  flavor('lentil-tomato', 'Tomato Lentil', '🍲', [ingredient('lentils', 1, 'cup'), ingredient('canned diced tomatoes', 1, 'can'), ingredient('yellow onion', 0.5, 'unit'), ingredient('dried oregano', 0.5, 'tsp')], ['vegan', 'vegetarian', 'high-fiber']),
  flavor('caprese', 'Caprese', '🍅', [ingredient('mozzarella cheese', 0.5, 'cup'), ingredient('tomato', 2, 'unit'), ingredient('fresh basil', 0.25, 'bunch')], ['vegetarian', 'mediterranean']),
  flavor('egg-salad', 'Egg Salad', '🥚', [ingredient('egg', 3, 'unit'), ingredient('mayonnaise', 2, 'tbsp'), ingredient('dijon mustard', 1, 'tsp'), ingredient('celery', 1, 'unit')], ['vegetarian', 'high-protein']),
  flavor('sweet-potato-bean', 'Sweet Potato Bean', '🍠', [ingredient('sweet potato', 1, 'unit'), ingredient('canned black beans', 1, 'can'), ingredient('avocado', 0.5, 'unit'), ingredient('lime', 0.5, 'unit')], ['vegan', 'vegetarian', 'high-fiber']),
  flavor('curry-chickpea', 'Curry Chickpea', '🍛', [ingredient('canned chickpeas', 1, 'can'), ingredient('coconut milk', 0.5, 'can'), ingredient('curry powder', 1, 'tsp'), ingredient('spinach', 0.25, 'bunch')], ['vegan', 'vegetarian', 'dairy-free']),
  flavor('mediterranean-salmon', 'Mediterranean Salmon', '🐟', [ingredient('salmon fillet', 0.5, 'lb'), ingredient('cucumber', 0.5, 'unit'), ingredient('tomato', 1, 'unit'), ingredient('feta cheese', 0.25, 'cup')], ['pescatarian', 'healthy', 'mediterranean']),
  flavor('crispy-cod', 'Crispy Cod', '🐟', [ingredient('cod fillet', 0.5, 'lb'), ingredient('panko breadcrumbs', 0.5, 'cup'), ingredient('lemon', 0.5, 'unit'), ingredient('cabbage', 0.25, 'unit')], ['pescatarian', 'high-protein']),
  flavor('bacon-garden', 'Bacon Garden', '🥓', [ingredient('bacon', 2, 'oz'), ingredient('romaine lettuce', 1, 'unit'), ingredient('tomato', 1, 'unit'), ingredient('cucumber', 0.5, 'unit')], ['quick']),
  flavor('garden-veggie', 'Garden Veggie', '🥕', [ingredient('zucchini', 0.5, 'unit'), ingredient('mushroom', 4, 'oz'), ingredient('spinach', 0.25, 'bunch'), ingredient('tomato', 1, 'unit')], ['vegetarian', 'healthy']),
  flavor('broccoli-cheddar', 'Broccoli Cheddar', '🥦', [ingredient('broccoli', 1, 'unit'), ingredient('cheddar cheese', 0.5, 'cup'), ingredient('yellow onion', 0.25, 'unit')], ['vegetarian', 'kid-friendly']),
  flavor('corn-avocado', 'Corn Avocado', '🌽', [ingredient('frozen corn', 1, 'cup'), ingredient('avocado', 0.5, 'unit'), ingredient('canned black beans', 0.5, 'can'), ingredient('tomato', 1, 'unit')], ['vegan', 'vegetarian', 'healthy']),
  flavor('apple-walnut-chicken', 'Apple Walnut Chicken', '🍎', [ingredient('chicken breast', 0.5, 'lb'), ingredient('apple', 1, 'unit'), ingredient('walnuts', 0.25, 'cup'), ingredient('plain greek yogurt', 0.25, 'cup')], ['high-protein', 'meal-prep']),
  flavor('peanut-tofu', 'Peanut Tofu', '🥜', [ingredient('tofu', 0.5, 'lb'), ingredient('peanut butter', 2, 'tbsp'), ingredient('soy sauce', 2, 'tbsp'), ingredient('carrot', 1, 'unit')], ['vegan', 'vegetarian', 'high-protein']),
];

const LUNCH_FORMATS: RecipeFormat[] = [
  format('salad', 'Salad', 'lunch', '🥗', 'assemble', [ingredient('romaine lettuce', 1, 'unit')], ['quick', 'healthy'], [10, 0], 2, 'easy', 'A fresh lunch salad with plenty of contrast and an easy dressing.'),
  format('wrap', 'Wrap', 'lunch', '🌯', 'assemble', [ingredient('tortilla', 2, 'unit')], ['quick'], [10, 0], 2, 'easy', 'A portable lunch with a soft tortilla and a satisfying filling.'),
  format('pita', 'Pita Pocket', 'lunch', '🥙', 'assemble', [ingredient('pita bread', 2, 'unit')], ['quick'], [10, 0], 2, 'easy', 'A warm pita pocket that keeps lunch simple and handheld.'),
  format('rice-bowl', 'Rice Bowl', 'lunch', '🍚', 'bowl', [ingredient('white rice', 1, 'cup')], ['meal-prep'], [10, 18], 2, 'easy', 'A balanced bowl with a reliable grain base and flavorful toppings.'),
  format('quinoa-bowl', 'Quinoa Bowl', 'lunch', '🥣', 'bowl', [ingredient('quinoa', 1, 'cup')], ['healthy', 'meal-prep'], [10, 18], 2, 'easy', 'A protein-friendly grain bowl that holds up well for meal prep.'),
  format('pasta-salad', 'Pasta Salad', 'lunch', '🍝', 'pasta', [ingredient('pasta', 8, 'oz')], ['meal-prep'], [10, 12], 3, 'easy', 'A chilled pasta lunch with bright mix-ins and a simple dressing.'),
  format('soup', 'Soup', 'lunch', '🍲', 'soup', [ingredient('vegetable broth', 3, 'cup')], ['one-pot', 'budget-friendly'], [12, 30], 4, 'easy', 'A comforting soup that turns the flavor profile into a warm, spoonable meal.'),
  format('quesadilla', 'Quesadilla', 'lunch', '🫓', 'skillet', [ingredient('tortilla', 2, 'unit'), ingredient('cheddar cheese', 0.5, 'cup')], ['quick', 'kid-friendly'], [8, 10], 2, 'easy', 'A crisp, melty lunch that is ready from the skillet in minutes.'),
  format('sandwich', 'Sandwich', 'lunch', '🥪', 'assemble', [ingredient('bread', 4, 'slice')], ['quick', 'kid-friendly'], [8, 5], 2, 'easy', 'A familiar sandwich format with a fresh, flavorful center.'),
  format('flatbread', 'Flatbread', 'lunch', '🍕', 'oven', [ingredient('pita bread', 2, 'unit'), ingredient('mozzarella cheese', 0.5, 'cup')], ['quick'], [10, 12], 2, 'easy', 'An easy oven-baked flatbread with crisp edges and a warm topping.'),
  format('lettuce-cups', 'Lettuce Cups', 'lunch', '🥬', 'skillet', [ingredient('romaine lettuce', 1, 'unit')], ['low-carb', 'quick'], [10, 12], 2, 'easy', 'A light lunch with crisp lettuce leaves and a savory filling.'),
  format('tacos', 'Tacos', 'lunch', '🌮', 'skillet', [ingredient('tortilla', 6, 'unit')], ['quick', 'kid-friendly'], [10, 15], 3, 'easy', 'A flexible taco lunch that is easy to customize at the table.'),
  format('noodle-bowl', 'Noodle Bowl', 'lunch', '🍜', 'pasta', [ingredient('rice noodles', 6, 'oz')], ['quick', 'meal-prep'], [10, 15], 2, 'easy', 'A slurpable noodle lunch with bright vegetables and savory sauce.'),
  format('stuffed-potato', 'Stuffed Potato', 'lunch', '🥔', 'oven', [ingredient('russet potato', 2, 'unit')], ['comfort-food', 'budget-friendly'], [8, 45], 2, 'easy', 'A fluffy baked potato turned into a complete, comforting lunch.'),
  format('grain-skillet', 'Grain Skillet', 'lunch', '🍳', 'skillet', [ingredient('quinoa', 1, 'cup')], ['one-pot', 'meal-prep'], [10, 18], 2, 'easy', 'A quick one-pan lunch with a hearty grain base.'),
  format('pinwheels', 'Pinwheels', 'lunch', '🌯', 'assemble', [ingredient('tortilla', 2, 'unit')], ['quick', 'kid-friendly'], [10, 0], 2, 'easy', 'A snackable lunch format that is easy to pack and share.'),
];

const DINNER_FLAVORS: FlavorProfile[] = [
  flavor('lemon-herb-chicken', 'Lemon Herb Chicken', '🍋', [ingredient('chicken breast', 1, 'lb'), ingredient('lemon', 1, 'unit'), ingredient('garlic', 3, 'clove'), ingredient('dried oregano', 1, 'tsp')], ['high-protein', 'healthy']),
  flavor('honey-garlic-chicken', 'Honey Garlic Chicken', '🍯', [ingredient('chicken breast', 1, 'lb'), ingredient('honey', 3, 'tbsp'), ingredient('garlic', 4, 'clove')], ['high-protein', 'kid-friendly']),
  flavor('teriyaki-chicken', 'Teriyaki Chicken', '🍚', [ingredient('chicken breast', 1, 'lb'), ingredient('soy sauce', 4, 'tbsp'), ingredient('honey', 2, 'tbsp'), ingredient('ginger', 0.5, 'oz')], ['high-protein', 'meal-prep']),
  flavor('tikka-chicken', 'Chicken Tikka', '🍛', [ingredient('chicken breast', 1, 'lb'), ingredient('plain greek yogurt', 0.5, 'cup'), ingredient('curry powder', 2, 'tsp'), ingredient('canned diced tomatoes', 1, 'can')], ['high-protein', 'comfort-food']),
  flavor('fajita-chicken', 'Chicken Fajita', '🌮', [ingredient('chicken breast', 1, 'lb'), ingredient('red bell pepper', 1, 'unit'), ingredient('yellow onion', 1, 'unit'), ingredient('lime', 1, 'unit')], ['high-protein', 'quick']),
  flavor('greek-chicken', 'Greek Chicken', '🫒', [ingredient('chicken breast', 1, 'lb'), ingredient('tomato', 2, 'unit'), ingredient('feta cheese', 0.5, 'cup'), ingredient('dried oregano', 1, 'tsp')], ['high-protein', 'mediterranean']),
  flavor('tomato-basil-chicken', 'Tomato Basil Chicken', '🍅', [ingredient('chicken breast', 1, 'lb'), ingredient('tomato', 2, 'unit'), ingredient('fresh basil', 0.25, 'bunch'), ingredient('mozzarella cheese', 0.5, 'cup')], ['high-protein', 'mediterranean']),
  flavor('coconut-lime-chicken', 'Coconut Lime Chicken', '🥥', [ingredient('chicken breast', 1, 'lb'), ingredient('coconut milk', 1, 'can'), ingredient('lime', 2, 'unit'), ingredient('ginger', 0.5, 'oz')], ['high-protein', 'dairy-free']),
  flavor('orange-chicken', 'Sticky Orange Chicken', '🍊', [ingredient('chicken breast', 1, 'lb'), ingredient('orange juice', 1, 'cup'), ingredient('soy sauce', 2, 'tbsp'), ingredient('honey', 2, 'tbsp')], ['high-protein', 'kid-friendly']),
  flavor('chicken-parmesan', 'Chicken Parmesan', '🍝', [ingredient('chicken breast', 1, 'lb'), ingredient('breadcrumbs', 0.75, 'cup'), ingredient('marinara sauce', 2, 'cup'), ingredient('mozzarella cheese', 0.75, 'cup')], ['high-protein', 'comfort-food']),
  flavor('beef-taco', 'Beef Taco', '🌮', [ingredient('ground beef', 1, 'lb'), ingredient('canned diced tomatoes', 1, 'can'), ingredient('chili powder', 2, 'tsp'), ingredient('ground cumin', 1, 'tsp')], ['high-protein', 'kid-friendly']),
  flavor('beef-stroganoff', 'Beef Stroganoff', '🍄', [ingredient('ground beef', 1, 'lb'), ingredient('mushroom', 10, 'oz'), ingredient('sour cream', 0.75, 'cup'), ingredient('onion powder', 1, 'tsp')], ['high-protein', 'comfort-food']),
  flavor('beef-chili', 'Beef Chili', '🌶️', [ingredient('ground beef', 1, 'lb'), ingredient('canned black beans', 1, 'can'), ingredient('canned diced tomatoes', 2, 'can'), ingredient('chili powder', 2, 'tsp')], ['high-protein', 'high-fiber', 'one-pot']),
  flavor('garlic-steak', 'Garlic Steak', '🥩', [ingredient('beef steak', 1, 'lb'), ingredient('garlic', 4, 'clove'), ingredient('unsalted butter', 3, 'tbsp'), ingredient('dried rosemary', 1, 'tsp')], ['high-protein', 'keto']),
  flavor('beef-shepherd', 'Shepherd Beef', '🥧', [ingredient('ground beef', 1, 'lb'), ingredient('russet potato', 4, 'unit'), ingredient('carrot', 2, 'unit'), ingredient('frozen peas', 1, 'cup')], ['high-protein', 'comfort-food']),
  flavor('stuffed-pepper-beef', 'Stuffed Pepper Beef', '🫑', [ingredient('ground beef', 1, 'lb'), ingredient('red bell pepper', 4, 'unit'), ingredient('white rice', 1, 'cup'), ingredient('cheddar cheese', 0.5, 'cup')], ['high-protein', 'meal-prep']),
  flavor('korean-style-beef', 'Ginger Soy Beef', '🥢', [ingredient('ground beef', 1, 'lb'), ingredient('soy sauce', 3, 'tbsp'), ingredient('ginger', 0.5, 'oz'), ingredient('green onion', 0.25, 'bunch')], ['high-protein', 'quick']),
  flavor('apple-pork', 'Apple Pork', '🍏', [ingredient('pork chop', 1.25, 'lb'), ingredient('apple', 2, 'unit'), ingredient('yellow onion', 1, 'unit'), ingredient('ground cinnamon', 0.5, 'tsp')], ['high-protein', 'comfort-food']),
  flavor('pork-taco', 'Pork Taco', '🌮', [ingredient('pork chop', 1.25, 'lb'), ingredient('cabbage', 0.5, 'unit'), ingredient('lime', 1, 'unit'), ingredient('ground cumin', 1, 'tsp')], ['high-protein', 'quick']),
  flavor('pork-fried-rice', 'Pork Fried Rice', '🍚', [ingredient('ground pork', 1, 'lb'), ingredient('white rice', 2, 'cup'), ingredient('egg', 2, 'unit'), ingredient('soy sauce', 3, 'tbsp')], ['high-protein', 'one-pot']),
  flavor('sausage-peppers', 'Sausage Peppers', '🌶️', [ingredient('turkey sausage', 1, 'lb'), ingredient('red bell pepper', 2, 'unit'), ingredient('yellow onion', 1, 'unit'), ingredient('canned diced tomatoes', 1, 'can')], ['high-protein', 'budget-friendly']),
  flavor('lemon-salmon', 'Lemon Salmon', '🐟', [ingredient('salmon fillet', 1, 'lb'), ingredient('lemon', 1, 'unit'), ingredient('garlic', 3, 'clove'), ingredient('asparagus', 1, 'bunch')], ['pescatarian', 'healthy', 'high-protein']),
  flavor('honey-salmon', 'Honey Salmon', '🍯', [ingredient('salmon fillet', 1, 'lb'), ingredient('honey', 3, 'tbsp'), ingredient('soy sauce', 2, 'tbsp'), ingredient('ginger', 0.5, 'oz')], ['pescatarian', 'high-protein']),
  flavor('tomato-cod', 'Tomato Cod', '🍅', [ingredient('cod fillet', 1, 'lb'), ingredient('canned diced tomatoes', 1, 'can'), ingredient('garlic', 3, 'clove'), ingredient('dried oregano', 1, 'tsp')], ['pescatarian', 'mediterranean', 'healthy']),
  flavor('crispy-cod', 'Crispy Cod', '🐟', [ingredient('cod fillet', 1, 'lb'), ingredient('panko breadcrumbs', 1, 'cup'), ingredient('lemon', 1, 'unit'), ingredient('cabbage', 0.5, 'unit')], ['pescatarian', 'kid-friendly']),
  flavor('shrimp-scampi', 'Shrimp Scampi', '🍤', [ingredient('shrimp', 1, 'lb'), ingredient('garlic', 5, 'clove'), ingredient('lemon', 1, 'unit'), ingredient('unsalted butter', 4, 'tbsp')], ['pescatarian', 'quick']),
  flavor('shrimp-coconut', 'Coconut Shrimp', '🥥', [ingredient('shrimp', 1, 'lb'), ingredient('coconut milk', 1, 'can'), ingredient('lime', 1, 'unit'), ingredient('ginger', 0.5, 'oz')], ['pescatarian', 'dairy-free']),
  flavor('shrimp-garlic', 'Garlic Shrimp', '🍤', [ingredient('shrimp', 1, 'lb'), ingredient('garlic', 5, 'clove'), ingredient('red pepper flakes', 1, 'pinch'), ingredient('lemon', 1, 'unit')], ['pescatarian', 'quick']),
  flavor('tofu-stir-fry', 'Ginger Tofu', '🥢', [ingredient('tofu', 1, 'lb'), ingredient('broccoli', 2, 'unit'), ingredient('soy sauce', 4, 'tbsp'), ingredient('ginger', 0.5, 'oz')], ['vegan', 'vegetarian', 'high-protein']),
  flavor('tofu-curry', 'Coconut Tofu Curry', '🍛', [ingredient('tofu', 1, 'lb'), ingredient('coconut milk', 1, 'can'), ingredient('curry powder', 2, 'tsp'), ingredient('spinach', 0.5, 'bunch')], ['vegan', 'vegetarian', 'dairy-free']),
  flavor('chickpea-curry', 'Chickpea Curry', '🍛', [ingredient('canned chickpeas', 2, 'can'), ingredient('coconut milk', 1, 'can'), ingredient('sweet potato', 1, 'unit'), ingredient('curry powder', 2, 'tsp')], ['vegan', 'vegetarian', 'high-fiber']),
  flavor('lentil-bolognese', 'Lentil Bolognese', '🍝', [ingredient('lentils', 1.5, 'cup'), ingredient('pasta', 12, 'oz'), ingredient('canned diced tomatoes', 2, 'can'), ingredient('mushroom', 6, 'oz')], ['vegan', 'vegetarian', 'high-fiber']),
  flavor('black-bean-enchilada', 'Black Bean Enchilada', '🌮', [ingredient('canned black beans', 2, 'can'), ingredient('tortilla', 8, 'unit'), ingredient('salsa', 2, 'cup'), ingredient('cheddar cheese', 1, 'cup')], ['vegetarian', 'high-fiber', 'budget-friendly']),
  flavor('cauliflower-curry', 'Cauliflower Curry', '🥦', [ingredient('cauliflower', 1, 'unit'), ingredient('canned chickpeas', 1, 'can'), ingredient('coconut milk', 1, 'can'), ingredient('turmeric', 1, 'tsp')], ['vegan', 'vegetarian', 'high-fiber']),
  flavor('eggplant-parmesan', 'Eggplant Parmesan', '🍆', [ingredient('eggplant', 2, 'unit'), ingredient('breadcrumbs', 1, 'cup'), ingredient('marinara sauce', 2, 'cup'), ingredient('mozzarella cheese', 1, 'cup')], ['vegetarian', 'comfort-food']),
  flavor('mushroom-garlic', 'Mushroom Garlic', '🍄', [ingredient('mushroom', 16, 'oz'), ingredient('garlic', 4, 'clove'), ingredient('parmesan cheese', 0.5, 'cup'), ingredient('fresh basil', 0.25, 'bunch')], ['vegetarian', 'quick']),
  flavor('veggie-fajita', 'Vegetable Fajita', '🫑', [ingredient('red bell pepper', 2, 'unit'), ingredient('zucchini', 2, 'unit'), ingredient('yellow onion', 1, 'unit'), ingredient('lime', 1, 'unit')], ['vegan', 'vegetarian', 'healthy']),
  flavor('sweet-potato-black-bean', 'Sweet Potato Black Bean', '🍠', [ingredient('sweet potato', 2, 'unit'), ingredient('canned black beans', 1, 'can'), ingredient('avocado', 1, 'unit'), ingredient('lime', 1, 'unit')], ['vegan', 'vegetarian', 'high-fiber']),
  flavor('tomato-basil-pasta', 'Tomato Basil Pasta', '🍝', [ingredient('pasta', 12, 'oz'), ingredient('canned diced tomatoes', 1, 'can'), ingredient('fresh basil', 0.5, 'bunch'), ingredient('parmesan cheese', 0.5, 'cup')], ['vegetarian', 'budget-friendly']),
  flavor('turkey-chili', 'Turkey Chili', '🌶️', [ingredient('ground turkey', 1, 'lb'), ingredient('canned black beans', 1, 'can'), ingredient('canned diced tomatoes', 2, 'can'), ingredient('frozen corn', 1, 'cup')], ['high-protein', 'high-fiber', 'one-pot']),
  flavor('chicken-noodle', 'Chicken Noodle', '🍜', [ingredient('chicken breast', 1, 'lb'), ingredient('pasta', 8, 'oz'), ingredient('chicken broth', 5, 'cup'), ingredient('carrot', 2, 'unit')], ['high-protein', 'comfort-food', 'one-pot']),
  flavor('beef-potato-stew', 'Beef Potato Stew', '🥘', [ingredient('beef steak', 1.25, 'lb'), ingredient('russet potato', 4, 'unit'), ingredient('carrot', 3, 'unit'), ingredient('chicken broth', 4, 'cup')], ['high-protein', 'comfort-food', 'one-pot']),
  flavor('vegetable-fried-rice', 'Vegetable Fried Rice', '🍚', [ingredient('white rice', 3, 'cup'), ingredient('egg', 2, 'unit'), ingredient('frozen peas', 1, 'cup'), ingredient('frozen corn', 1, 'cup')], ['vegetarian', 'quick', 'budget-friendly']),
];

const DINNER_FORMATS: RecipeFormat[] = [
  format('skillet', 'Skillet Dinner', 'dinner', '🍳', 'skillet', [ingredient('olive oil', 2, 'tbsp')], ['quick', 'one-pot'], [12, 25], 4, 'easy', 'A weeknight skillet dinner with bold flavor and minimal cleanup.'),
  format('rice-bowl', 'Rice Bowl', 'dinner', '🍚', 'bowl', [ingredient('white rice', 1.5, 'cup')], ['meal-prep'], [12, 25], 4, 'easy', 'A complete dinner bowl with a dependable rice base.'),
  format('quinoa-bowl', 'Quinoa Bowl', 'dinner', '🥣', 'bowl', [ingredient('quinoa', 1, 'cup')], ['healthy', 'meal-prep'], [12, 25], 4, 'easy', 'A balanced dinner bowl with grain, vegetables, and a satisfying centerpiece.'),
  format('pasta', 'Pasta', 'dinner', '🍝', 'pasta', [ingredient('pasta', 12, 'oz')], ['comfort-food', 'kid-friendly'], [12, 25], 4, 'easy', 'A familiar pasta dinner with a new flavor direction.'),
  format('baked-pasta', 'Baked Pasta', 'dinner', '🍝', 'oven', [ingredient('pasta', 12, 'oz'), ingredient('mozzarella cheese', 0.5, 'cup')], ['comfort-food', 'meal-prep'], [15, 35], 6, 'medium', 'A bubbling oven-baked pasta dinner made for leftovers.'),
  format('tacos', 'Tacos', 'dinner', '🌮', 'skillet', [ingredient('tortilla', 8, 'unit')], ['quick', 'kid-friendly'], [12, 18], 4, 'easy', 'A flexible taco dinner for mixing and matching toppings.'),
  format('enchiladas', 'Enchiladas', 'dinner', '🌯', 'oven', [ingredient('tortilla', 8, 'unit'), ingredient('salsa', 2, 'cup')], ['comfort-food', 'meal-prep'], [20, 35], 6, 'medium', 'A saucy baked dinner that reheats well for another night.'),
  format('curry', 'Curry', 'dinner', '🍛', 'stovetop', [ingredient('coconut milk', 1, 'can')], ['one-pot', 'meal-prep'], [12, 30], 4, 'easy', 'A fragrant one-pot dinner with a creamy sauce.'),
  format('stir-fry', 'Stir-Fry', 'dinner', '🥢', 'skillet', [ingredient('vegetable oil', 2, 'tbsp')], ['quick', 'one-pot'], [12, 18], 4, 'easy', 'A high-heat dinner with crisp vegetables and savory sauce.'),
  format('soup', 'Soup', 'dinner', '🍲', 'soup', [ingredient('chicken broth', 4, 'cup')], ['one-pot', 'comfort-food'], [15, 35], 5, 'easy', 'A warming dinner soup that fills the kitchen with familiar aromas.'),
  format('stew', 'Stew', 'dinner', '🥘', 'soup', [ingredient('chicken broth', 4, 'cup')], ['one-pot', 'comfort-food', 'meal-prep'], [20, 60], 6, 'medium', 'A slow-simmered dinner with tender ingredients and a rich broth.'),
  format('sheet-pan', 'Sheet-Pan Dinner', 'dinner', '🍗', 'oven', [ingredient('olive oil', 2, 'tbsp')], ['one-pot', 'meal-prep'], [12, 35], 4, 'easy', 'An oven-roasted dinner with crisp edges and easy cleanup.'),
  format('stuffed-peppers', 'Stuffed Peppers', 'dinner', '🫑', 'oven', [ingredient('red bell pepper', 4, 'unit'), ingredient('white rice', 1, 'cup')], ['meal-prep', 'gluten-free'], [20, 40], 4, 'medium', 'A colorful baked dinner with a hearty filling inside tender peppers.'),
  format('baked-potatoes', 'Loaded Baked Potatoes', 'dinner', '🥔', 'oven', [ingredient('russet potato', 4, 'unit')], ['comfort-food', 'budget-friendly'], [10, 45], 4, 'easy', 'A simple baked dinner that makes familiar ingredients feel special.'),
  format('flatbread', 'Dinner Flatbread', 'dinner', '🍕', 'oven', [ingredient('pita bread', 4, 'unit'), ingredient('mozzarella cheese', 1, 'cup')], ['quick', 'kid-friendly'], [12, 15], 4, 'easy', 'A crisp, cheesy flatbread dinner for a low-effort pizza night.'),
  format('lettuce-wraps', 'Lettuce Wraps', 'dinner', '🥬', 'skillet', [ingredient('romaine lettuce', 1, 'unit')], ['low-carb', 'quick'], [12, 20], 4, 'easy', 'A lighter dinner with crisp lettuce and a hot savory filling.'),
  format('fajita-bowl', 'Fajita Bowl', 'dinner', '🌶️', 'skillet', [ingredient('white rice', 1.5, 'cup')], ['meal-prep', 'quick'], [12, 22], 4, 'easy', 'A colorful bowl with sizzling vegetables and a satisfying main.'),
  format('grain-casserole', 'Grain Casserole', 'dinner', '🥘', 'oven', [ingredient('quinoa', 1, 'cup'), ingredient('cheddar cheese', 0.5, 'cup')], ['meal-prep', 'comfort-food'], [15, 35], 6, 'medium', 'A make-ahead casserole that turns grain and toppings into a complete dinner.'),
  format('pot-pie', 'Pot Pie', 'dinner', '🥧', 'oven', [ingredient('all-purpose flour', 1, 'cup'), ingredient('unsalted butter', 3, 'tbsp'), ingredient('chicken broth', 2, 'cup')], ['comfort-food', 'kid-friendly'], [20, 45], 6, 'medium', 'A cozy dinner with creamy filling and a golden topping.'),
  format('meatballs', 'Meatballs', 'dinner', '🍝', 'stovetop', [ingredient('breadcrumbs', 0.5, 'cup'), ingredient('egg', 1, 'unit')], ['high-protein', 'comfort-food'], [18, 28], 4, 'medium', 'Tender meatballs with a warm sauce and plenty of serving options.'),
  format('roast', 'Roasted Dinner', 'dinner', '🍗', 'oven', [ingredient('olive oil', 2, 'tbsp')], ['gluten-free', 'meal-prep'], [12, 40], 4, 'easy', 'A straightforward roasted dinner with caramelized edges.'),
  format('one-pot-rice', 'One-Pot Rice', 'dinner', '🍚', 'stovetop', [ingredient('white rice', 1.5, 'cup'), ingredient('chicken broth', 2.5, 'cup')], ['one-pot', 'budget-friendly'], [12, 35], 4, 'easy', 'A one-pot rice dinner that absorbs all the flavor as it cooks.'),
  format('noodle-bowl', 'Noodle Bowl', 'dinner', '🍜', 'pasta', [ingredient('rice noodles', 8, 'oz')], ['quick', 'dairy-free'], [12, 20], 4, 'easy', 'A saucy noodle dinner with vegetables and a flavorful main.'),
  format('dinner-salad', 'Dinner Salad', 'dinner', '🥗', 'assemble', [ingredient('romaine lettuce', 1, 'unit')], ['healthy', 'low-carb'], [12, 18], 4, 'easy', 'A substantial salad with enough protein and texture to be dinner.'),
];

const TREAT_FLAVORS: FlavorProfile[] = [
  flavor('apple-cinnamon', 'Apple Cinnamon', '🍎', [ingredient('apple', 2, 'unit'), ingredient('ground cinnamon', 1, 'tsp')], ['vegetarian', 'comfort-food']),
  flavor('berry-oat', 'Berry Oat', '🫐', [ingredient('frozen mixed berries', 2, 'cup'), ingredient('rolled oats', 0.75, 'cup')], ['vegetarian', 'healthy']),
  flavor('banana-chocolate', 'Banana Chocolate', '🍌', [ingredient('banana', 2, 'unit'), ingredient('chocolate chips', 0.5, 'cup')], ['vegetarian', 'kid-friendly']),
  flavor('peach-maple', 'Peach Maple', '🍑', [ingredient('peach', 3, 'unit'), ingredient('maple syrup', 2, 'tbsp')], ['vegetarian', 'comfort-food']),
  flavor('pumpkin-spice', 'Pumpkin Spice', '🎃', [ingredient('pumpkin puree', 1, 'can'), ingredient('ground cinnamon', 2, 'tsp')], ['vegetarian', 'comfort-food']),
  flavor('lemon-berry', 'Lemon Berry', '🍋', [ingredient('lemon', 2, 'unit'), ingredient('frozen mixed berries', 1, 'cup')], ['vegetarian', 'quick']),
  flavor('chocolate-almond', 'Chocolate Almond', '🍫', [ingredient('cocoa powder', 0.5, 'cup'), ingredient('almonds', 0.5, 'cup'), ingredient('dark chocolate', 2, 'oz')], ['vegetarian']),
  flavor('coconut', 'Toasted Coconut', '🥥', [ingredient('shredded coconut', 1.5, 'cup'), ingredient('coconut milk', 0.5, 'can')], ['vegan', 'vegetarian', 'dairy-free']),
  flavor('orange-cranberry', 'Orange Cranberry', '🍊', [ingredient('orange juice', 0.75, 'cup'), ingredient('dried cranberries', 0.5, 'cup')], ['vegetarian']),
  flavor('peanut-butter', 'Peanut Butter', '🥜', [ingredient('peanut butter', 0.75, 'cup'), ingredient('honey', 2, 'tbsp')], ['vegetarian', 'high-protein']),
  flavor('vanilla-berry', 'Vanilla Berry', '🍓', [ingredient('vanilla extract', 1, 'tsp'), ingredient('frozen mixed berries', 1.5, 'cup')], ['vegetarian', 'kid-friendly']),
  flavor('walnut-raisin', 'Walnut Raisin', '🍇', [ingredient('walnuts', 0.5, 'cup'), ingredient('raisins', 0.5, 'cup'), ingredient('ground cinnamon', 0.5, 'tsp')], ['vegetarian', 'high-fiber']),
  flavor('chocolate-coconut', 'Chocolate Coconut', '🍫', [ingredient('chocolate chips', 0.5, 'cup'), ingredient('shredded coconut', 0.75, 'cup')], ['vegetarian', 'kid-friendly']),
  flavor('banana-walnut', 'Banana Walnut', '🍌', [ingredient('banana', 2, 'unit'), ingredient('walnuts', 0.5, 'cup')], ['vegetarian', 'high-fiber']),
  flavor('honey-yogurt', 'Honey Yogurt', '🍯', [ingredient('plain greek yogurt', 1.5, 'cup'), ingredient('honey', 2, 'tbsp')], ['vegetarian', 'high-protein']),
  flavor('cocoa-cherry-style', 'Cocoa Berry', '🍫', [ingredient('cocoa powder', 0.25, 'cup'), ingredient('frozen mixed berries', 1, 'cup')], ['vegetarian']),
  flavor('apple-walnut', 'Apple Walnut', '🍏', [ingredient('apple', 2, 'unit'), ingredient('walnuts', 0.5, 'cup')], ['vegetarian', 'high-fiber']),
  flavor('maple-pecan-style', 'Maple Almond', '🥜', [ingredient('maple syrup', 3, 'tbsp'), ingredient('almonds', 0.5, 'cup')], ['vegetarian']),
  flavor('lemon-coconut', 'Lemon Coconut', '🍋', [ingredient('lemon', 2, 'unit'), ingredient('shredded coconut', 0.75, 'cup')], ['vegetarian']),
  flavor('pumpkin-chocolate', 'Pumpkin Chocolate', '🎃', [ingredient('pumpkin puree', 0.75, 'cup'), ingredient('chocolate chips', 0.5, 'cup')], ['vegetarian', 'comfort-food']),
];

const DESSERT_FORMATS: RecipeFormat[] = [
  format('crumble', 'Crumble', 'dessert', '🫐', 'oven', [ingredient('all-purpose flour', 0.5, 'cup'), ingredient('rolled oats', 0.75, 'cup'), ingredient('unsalted butter', 0.5, 'cup')], ['comfort-food'], [12, 35], 6, 'easy', 'A warm fruit dessert with a crisp, buttery topping.'),
  format('baked-bars', 'Baked Bars', 'dessert', '🍰', 'oven', [ingredient('all-purpose flour', 1.5, 'cup'), ingredient('egg', 2, 'unit'), ingredient('granulated sugar', 0.75, 'cup')], ['comfort-food'], [15, 30], 12, 'easy', 'A sliceable dessert that is easy to share or pack.'),
  format('parfait', 'Dessert Parfait', 'dessert', '🍓', 'assemble', [ingredient('plain greek yogurt', 1.5, 'cup'), ingredient('graham cracker', 0.75, 'cup')], ['quick'], [10, 0], 4, 'easy', 'A cool layered dessert with creamy filling and crunchy texture.'),
  format('mug-cake', 'Mug Cake', 'dessert', '🍫', 'oven', [ingredient('all-purpose flour', 0.5, 'cup'), ingredient('milk', 0.5, 'cup'), ingredient('granulated sugar', 0.25, 'cup')], ['quick', 'kid-friendly'], [5, 3], 2, 'easy', 'A small-batch warm dessert for an instant sweet craving.'),
  format('cookies', 'Cookies', 'dessert', '🍪', 'oven', [ingredient('all-purpose flour', 1.5, 'cup'), ingredient('unsalted butter', 0.5, 'cup'), ingredient('granulated sugar', 0.75, 'cup'), ingredient('egg', 1, 'unit')], ['kid-friendly'], [12, 12], 18, 'easy', 'A dependable batch of crisp-edged, soft-centered cookies.'),
  format('pudding', 'Pudding', 'dessert', '🍮', 'stovetop', [ingredient('milk', 3, 'cup'), ingredient('granulated sugar', 0.5, 'cup'), ingredient('egg', 2, 'unit')], ['comfort-food'], [8, 20], 6, 'easy', 'A creamy stovetop dessert best served warm or chilled.'),
  format('frozen-treat', 'Frozen Treat', 'dessert', '🍨', 'blender', [ingredient('plain greek yogurt', 1.5, 'cup')], ['quick', 'healthy'], [10, 0], 4, 'easy', 'A cool, creamy freezer dessert with bright flavor.'),
];

const SNACK_FORMATS: RecipeFormat[] = [
  format('energy-bites', 'Energy Bites', 'snack', '⚡', 'assemble', [ingredient('rolled oats', 1, 'cup'), ingredient('peanut butter', 0.5, 'cup'), ingredient('honey', 2, 'tbsp')], ['quick', 'healthy'], [10, 0], 12, 'easy', 'A no-bake snack that keeps well for grab-and-go moments.'),
  format('snack-bars', 'Snack Bars', 'snack', '🍫', 'oven', [ingredient('rolled oats', 1.5, 'cup'), ingredient('honey', 0.25, 'cup'), ingredient('unsalted butter', 0.25, 'cup')], ['meal-prep'], [10, 20], 10, 'easy', 'A sturdy homemade snack bar for lunchboxes and road trips.'),
  format('dip', 'Snack Dip', 'snack', '🥣', 'assemble', [ingredient('plain greek yogurt', 1, 'cup')], ['quick', 'healthy'], [10, 0], 6, 'easy', 'A scoopable dip for vegetables, pita, or crackers.'),
  format('roasted-bites', 'Roasted Bites', 'snack', '🥔', 'oven', [ingredient('olive oil', 2, 'tbsp')], ['healthy'], [8, 28], 4, 'easy', 'A crisp roasted snack with bold seasoning and simple prep.'),
  format('smoothie-snack', 'Snack Smoothie', 'snack', '🥤', 'blender', [ingredient('almond milk', 1, 'cup')], ['quick', 'healthy'], [5, 0], 2, 'easy', 'A small blended snack when you want something cold and quick.'),
  format('quesadilla-bites', 'Quesadilla Bites', 'snack', '🧀', 'skillet', [ingredient('tortilla', 2, 'unit'), ingredient('cheddar cheese', 0.5, 'cup')], ['quick', 'kid-friendly'], [8, 8], 4, 'easy', 'Crisp, cheesy bites that are easy to dip and share.'),
  format('stuffed-bites', 'Stuffed Bites', 'snack', '🥒', 'oven', [ingredient('zucchini', 2, 'unit'), ingredient('breadcrumbs', 0.5, 'cup')], ['kid-friendly'], [12, 20], 4, 'easy', 'A warm snack with a crisp outside and savory filling.'),
];

const GENERATED_BREAKFASTS = [
  ...BREAKFAST_SWEET_FORMATS.flatMap((formatSpec) => SWEET_BREAKFAST_FLAVORS.map((profile) => generatedRecipe(formatSpec, profile))),
  ...BREAKFAST_SAVORY_FORMATS.flatMap((formatSpec) => SAVORY_BREAKFAST_FLAVORS.map((profile) => generatedRecipe(formatSpec, profile))),
];

const GENERATED_LUNCHES = LUNCH_FORMATS.flatMap((formatSpec) => LUNCH_FLAVORS.map((profile) => generatedRecipe(formatSpec, profile)));
const GENERATED_DINNERS = DINNER_FORMATS.flatMap((formatSpec) => DINNER_FLAVORS.map((profile) => generatedRecipe(formatSpec, profile)));
const GENERATED_TREATS = [...DESSERT_FORMATS, ...SNACK_FORMATS].flatMap((formatSpec) => TREAT_FLAVORS.map((profile) => generatedRecipe(formatSpec, profile)));

export const GENERATED_RECIPES: Recipe[] = [...GENERATED_BREAKFASTS, ...GENERATED_LUNCHES, ...GENERATED_DINNERS, ...GENERATED_TREATS];
