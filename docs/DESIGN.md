# Design System & UX Direction

Goal: warm, appetizing, premium. Think "modern cooking app" (Mela, Crouton, NYT Cooking) — not admin dashboard. Every surface should look intentional in both light and dark mode.

## 1. Design tokens (`src/index.css`, Tailwind v4 `@theme`)

### Color

Warm neutral base + terracotta primary + sage accent.

```css
@theme {
  /* light mode values; dark mode overrides below */
  --color-primary: #c2410c;        /* terracotta — buttons, active nav, links */
  --color-primary-hover: #9a3412;
  --color-primary-soft: #ffedd5;   /* badges, selected states */
  --color-accent: #4d7c0f;         /* sage — success, "in meal plan", checked items */
  --color-surface: #fffbf7;        /* page background (warm white, not pure #fff) */
  --color-card: #ffffff;
  --color-border: #f0e7dd;
  --color-text: #292524;
  --color-text-muted: #78716c;
}
```

Dark mode: class strategy (`.dark` on `<html>`, toggled by `useSettingsStore`; `'system'` follows `prefers-color-scheme` via a media listener). Dark values: surface `#1c1917`, card `#292524`, border `#3f3a36`, text `#f5f5f4`, muted `#a8a29e`, primary lightened to `#fb923c`, primary-soft `#431407`, accent `#a3e635`-tinted. Verify every page in both themes — no hardcoded grays/whites outside tokens.

Category gradients for recipe image placeholders (emoji centered at ~3rem on a soft two-stop gradient, distinct hue per category): breakfast amber, lunch lime, dinner rose, dessert violet, snack cyan. Define once in `RecipeImage` component.

### Typography & shape

- Font: system stack (`ui-sans-serif, system-ui, ...`) — fast, no font loading states. Headings `font-semibold tracking-tight`.
- Radii: cards `rounded-2xl`, buttons/inputs `rounded-lg`, pills `rounded-full`.
- Shadows: cards `shadow-sm` at rest, `shadow-md` + `-translate-y-0.5` on hover with `transition-all duration-200`.
- Spacing: page padding `px-4 md:px-8`, section gaps `space-y-8`, card grid `gap-5`.

## 2. Motion

CSS-only. Rules: 150–250ms, `ease-out`, animate transform/opacity only.
- Card hover lift (above), button `active:scale-[0.98]`.
- Page content fade-slide-in: single `@keyframes fade-up` (opacity 0→1, translateY 8px→0, 250ms) applied to page root.
- Checking a grocery item: strike-through + fade to muted over 200ms; row reflows into the Completed group.
- Badge count changes: brief scale pop (1 → 1.2 → 1, 200ms).
- Respect `prefers-reduced-motion: reduce` — disable transforms globally in one media query.

## 3. Key screens

### Dashboard (`/`)
- Greeting header ("What sounds good today?"), search box that navigates to `/recipes?q=...` on submit.
- 3 stat tiles: recipes in meal plan, grocery items left, favorites — each links to its page.
- "Featured" row: 4 random-but-stable-per-day recipes (seeded by date string).
- Category quick-links (5 pills with emoji) into pre-filtered library.
- If meal plan is non-empty: "Your meal plan" strip with mini-cards + "View grocery list →" CTA.

### Recipe Library (`/recipes`)
- Sticky FilterBar under the header (surface-colored, bottom border).
- Responsive grid: 1 col mobile / 2 sm / 3 lg / 4 xl.
- Result count ("18 recipes"); filters show active state clearly; "Clear filters" appears only when something is active.

### Recipe Detail (`/recipes/:id`)
- Two-column ≥lg: left = sticky info card (image, meta chips for prep/cook/total/difficulty, servings stepper, Add to Meal Plan primary button, heart favorite secondary button); right = ingredients (quantities re-render live as servings change) then numbered instructions with generous line-height. No separate "add ingredients only" action — the grocery list is always derived from the meal plan (see PLAN.md §7), so adding a recipe's ingredients means adding it to the meal plan.
- Nutrition placeholder card: 4 small tiles (calories/protein/carbs/fat), "—" when absent, caption "Nutrition estimates coming soon".
- Similar recipes: 4 cards under the main content.
- Custom recipes: Edit + Delete buttons; seed recipes: "Duplicate & edit".

### Meal Plan (`/meal-plan`)
- List of wide cards: thumbnail, title, servings stepper (min 1, step matches whole numbers), per-recipe remove (X), link to detail.
- Header actions: "Clear all" (confirmation modal) + primary "View grocery list".
- Footer summary line: "3 recipes · 14 servings".

### Grocery List (`/grocery-list`)
- Toolbar: progress ("6 of 18 done") with a thin progress bar, Add item button, overflow menu (Clear completed, Restore removed items, Reset list).
- Category sections with aisle icon + name; unchecked rows first, checked rows collapse into a muted "Completed (n)" cluster at each section's bottom.
- Row: checkbox (large tap target, whole row clickable), quantity + unit in tabular-nums, name, source-recipe names in small muted text ("Pancakes, Banana bread"), trash icon on hover/swipe-reveal-free (always visible on touch).
- Add-item form inline at top when open: name, optional qty+unit, category select (default Other).

### Recipe Editor (`/recipes/new`, edit)
- Sections: Basics (title, description, category, tags multi-select, difficulty, times, servings, emoji picker from a curated ~30-emoji food set), Ingredients (dynamic rows: name input with vocabulary autocomplete, qty, unit select, category auto-filled from vocabulary when matched, note), Instructions (dynamic textarea list with add/remove/move up/down).
- Validation on submit: title required, ≥1 ingredient with name+unit, ≥1 instruction, times ≥ 0, servings ≥ 1. Inline error messages under fields, focus first invalid.
- Sticky bottom bar: Cancel / Save. Unsaved-changes guard via confirm dialog on nav away.

## 4. Empty states (exact copy)

| Surface | Icon | Heading | Body | CTA |
|---|---|---|---|---|
| Library, no results | 🔍 (SearchX) | No recipes found | Try a different search or clear your filters. | Clear filters |
| Meal Plan | 🍽 (UtensilsCrossed) | Nothing planned yet | Browse recipes and add whatever sounds good. | Browse recipes |
| Grocery List | 🧺 (ShoppingBasket) | Your list is empty | Add recipes to your meal plan and ingredients appear here automatically. | Go to meal plan |
| Favorites | ♥ (Heart) | No favorites yet | Tap the heart on any recipe to save it here. | Browse recipes |

## 5. Loading & feedback states

- Data is local/synchronous, so real loading is instant — but add a skeleton pass anyway for perceived polish: on Library and Dashboard, render skeleton cards (pulsing rounded blocks) for ~300ms on first mount before the grid fades in. Cheap and makes it feel like a product.
- Zustand `persist` hydration: gate app render on store hydration (all-local, effectively instant; prevents a light-theme/empty-state flash).
- Feedback: small toast (self-built, bottom-center, auto-dismiss 2.5s) for "Added to meal plan", "Recipe saved", "Item added". One toast component, single queue, no library.

## 6. Accessibility & responsiveness checklist

- All interactive elements are real `<button>`/`<a>`/`<input>` with visible `focus-visible` rings (primary color).
- Checkbox rows: `<label>`-wrapped, keyboard-toggleable.
- Modals: focus trap, Esc to close, `aria-modal`.
- Color contrast ≥ 4.5:1 for text in both themes (the muted text tokens above pass on their surfaces — keep it that way).
- Test at 375px, 768px, 1280px. No horizontal scroll anywhere; bottom tab bar leaves safe-area padding (`env(safe-area-inset-bottom)`).
