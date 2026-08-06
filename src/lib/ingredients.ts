const INGREDIENT_ALIASES: Record<string, string> = {
  'extra lean ground beef': 'ground beef',
  'extra-lean ground beef': 'ground beef',
  'lean ground beef': 'ground beef',
  'ground chuck': 'ground beef',
  'yellow onions': 'onion',
  'white onions': 'onion',
  'red onions': 'red onion',
  'large eggs': 'egg',
  'fresh garlic': 'garlic',
  'fresh ginger': 'ginger',
};

// Normalization is deliberately conservative: only clear aliases are merged.
// Everything else stays distinct so a grocery list never makes a risky guess.
export function normalizeIngredientName(value: string): string {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ');
  return INGREDIENT_ALIASES[cleaned] ?? cleaned;
}

export function pantryHasIngredient(pantryNames: Iterable<string>, ingredientName: string): boolean {
  const normalized = normalizeIngredientName(ingredientName);
  for (const pantryName of pantryNames) {
    if (normalizeIngredientName(pantryName) === normalized) return true;
  }
  return false;
}
