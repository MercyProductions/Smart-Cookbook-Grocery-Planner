# Project Plan — Cookbook + Groceries

Authored by Fable 5 (architect). Executed by Sonnet (builder).

## 1. What we're building

A single-page web app that feels like a real product:

1. **Browse** a library of 2,000+ seeded recipes with search, dietary filters, and infinite scrolling.
2. **Plan** recipes in dated breakfast, lunch, and dinner slots, adjusting servings per meal.
3. **Generate** a grocery list automatically from the meal plan — duplicate ingredients merged, quantities summed, grouped by store aisle.
4. **Shop** with a checkable, editable grocery list that can exclude pantry staples and survives reloads.
5. **Cook** in a focused step-by-step mode, then use local history and recommendations to decide the next meal.
6. **Manage** recipes: favorite them, and add/edit/delete custom recipes through an in-app editor.

No backend. No auth. All persistence via localStorage (through Zustand `persist`).

## Current implementation note

The current app includes a 2,237-recipe catalog with infinite scrolling, a week-based calendar planner, custom grocery date ranges, pantry exclusions, editable shopping lines with source details, cooking mode, local meal history, and Pick for me recommendations.

## 2. Tech stack and rationale

| Choice | Why |
|---|---|
| Vite + React 19 + TypeScript strict | Fast dev loop, best-documented ecosystem, strict types catch data-model mistakes early |
| Tailwind CSS v4 | Design-token-driven styling, trivial dark mode, no CSS file sprawl |
| React Router v7 (library mode) | Real URLs per page (shareable/back-button friendly) without framework overhead |
| Zustand v5 + `persist` | Tiny, no-boilerplate state; `persist` middleware gives us localStorage saving + hydration for free |
| lucide-react | Consistent icon set, tree-shakeable |

### Dependencies (complete list)

Runtime: `react`, `react-dom`, `react-router-dom`, `zustand`, `lucide-react`.
Dev: `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss`, `@tailwindcss/vite`, `vitest` (for the grocery-logic unit tests in Phase 4).

Nothing else without asking. Specifically NOT: framer-motion (CSS transitions are enough), no component library (we build our own small `ui/` kit per DESIGN.md), no date library.

## 3. Folder structure

```
src/
  main.tsx               # Router + providers
  App.tsx                # AppShell + route table
  index.css              # Tailwind import + design tokens (see DESIGN.md)
  types/
    index.ts             # ALL shared types (see DATA_MODELS.md)
  data/
    recipes.ts           # core seed recipes plus the expanded catalog
    expandedRecipes.ts   # first expanded breakfast, lunch, dinner, dessert, and snack recipes
    moreRecipes.ts       # additional breakfast, lunch, and dinner recipes
    generatedRecipes.ts  # deterministic recipe atlas combining curated flavors and formats
    vocabulary.ts        # canonical ingredient names, units, categories
  lib/
    grocery.ts           # buildGroceryList() — pure aggregation logic
    units.ts             # unit families, conversion factors, formatQuantity()
    scaling.ts           # scaleIngredient(ingredient, factor)
    filters.ts           # applyRecipeFilters(recipes, filterState)
    id.ts                # newId() — crypto.randomUUID wrapper
  stores/
    useRecipeStore.ts    # seed + custom recipes, add/edit/delete (persists custom only)
    useMealPlanStore.ts  # selected recipe ids + per-recipe servings
    useGroceryStore.ts   # checked keys, removed keys, custom items
    useFavoritesStore.ts # favorite recipe ids
    useSettingsStore.ts  # theme, default servings
  components/
    layout/              # AppShell, Sidebar, MobileTabBar, PageHeader, ThemeToggle
    ui/                  # Button, Card, Badge, Checkbox, Input, Select, Modal, EmptyState, Stepper
    recipes/             # RecipeCard, RecipeGrid, FilterBar, SearchBox, DifficultyBadge, TagPill, RecipeImage, SimilarRecipes
    mealplan/            # MealPlanCard, ServingsStepper
    grocery/             # GroceryCategoryGroup, GroceryItemRow, AddCustomItemForm, GroceryToolbar
    editor/              # RecipeForm, IngredientRowEditor, InstructionListEditor
  pages/
    DashboardPage.tsx
    RecipeLibraryPage.tsx
    RecipeDetailPage.tsx
    MealPlanPage.tsx
    GroceryListPage.tsx
    FavoritesPage.tsx
    RecipeEditorPage.tsx   # handles both /recipes/new and /recipes/:id/edit
    SettingsPage.tsx
```

## 4. Routes

| Path | Page | Notes |
|---|---|---|
| `/` | Dashboard | Hero, stats, quick actions, featured recipes |
| `/recipes` | Recipe Library | Grid + search + filters; filter state in URL query params |
| `/recipes/:id` | Recipe Detail | Full page (not modal — better for deep linking and mobile) |
| `/recipes/new` | Recipe Editor | Create mode |
| `/recipes/:id/edit` | Recipe Editor | Edit mode (custom recipes editable; seed recipes: "duplicate & edit") |
| `/meal-plan` | Meal Plan | Selected recipes with servings steppers |
| `/grocery-list` | Grocery List | Generated + custom items, grouped by aisle |
| `/favorites` | Favorites | Grid of favorited recipes |
| `/settings` | Settings | Theme, default servings, data reset |

Unknown routes render a friendly 404 with a link home.

## 5. Layout / navigation

- **Desktop (≥1024px):** persistent left sidebar (icon + label nav items, grocery-list item shows a count badge of unchecked items; meal-plan item shows selected-recipe count). Content area max-width ~1200px, centered.
- **Tablet/mobile (<1024px):** top bar with app name + theme toggle; bottom tab bar with 5 tabs: Home, Recipes, Meal Plan (badge), Groceries (badge), More (sheet linking to Favorites/Settings/Add Recipe).

## 6. User flows (the golden paths)

### Flow A — plan dinner and shop
1. Land on Dashboard → see featured recipes and a "Browse recipes" CTA.
2. Recipe Library → filter Category = Dinner, max time 30 min → click a card.
3. Recipe Detail → read ingredients/steps → adjust servings 4 → 6 → "Add to Meal Plan". Button flips to "In Meal Plan ✓" (idempotent; clicking again removes with confirmation styling, no dialog).
4. Repeat for 2–3 recipes. Meal Plan badge counts up.
5. Meal Plan page → review, tweak servings (grocery list updates live), remove one recipe.
6. Grocery List page → merged list grouped by aisle. Uncheck-style shopping: tap rows to check off; checked rows sink to a "Completed" group per category, styled struck-through.
7. Add a custom item ("paper towels", category Other). Reload the page → everything is still there.

### Flow B — save favorites for later
Browse → heart icon on any card or detail page → Favorites page shows them. Heart state visible everywhere the recipe appears.

### Flow C — add your own recipe
Add Recipe → form with dynamic ingredient rows (name gets autocomplete suggestions from the canonical vocabulary) and reorderable instruction steps → Save → appears in Library flagged with a subtle "My recipe" badge → can be edited/deleted later. Deleting asks for confirmation and also removes it from meal plan/favorites.

## 7. State architecture

Five stores, each small and single-purpose. Persistence keys are versioned (`cookbook.recipes.v1`, etc.) so future migrations are possible.

| Store | State | Persisted? |
|---|---|---|
| `useRecipeStore` | `customRecipes: Recipe[]`, `deletedSeedIds: string[]` (seed recipes come from `data/recipes.ts` at module load; the store exposes a combined `getAllRecipes()` selector) | custom + deletedSeedIds only |
| `useMealPlanStore` | `entries: { recipeId, servings }[]` | yes |
| `useGroceryStore` | `checkedKeys: string[]`, `removedKeys: string[]`, `customItems: CustomGroceryItem[]` | yes |
| `useFavoritesStore` | `favoriteIds: string[]` | yes |
| `useSettingsStore` | `theme: 'light' \| 'dark' \| 'system'`, `defaultServings: number` | yes |

**Key derived-state rule:** the grocery list itself is NEVER stored. It is derived on render: `buildGroceryList(mealPlanEntries, allRecipes)` → merged items, then the store's `checkedKeys`/`removedKeys` overlay onto it by stable item key, and `customItems` append. This means the list always reflects the current meal plan with zero sync bugs. Full algorithm in DATA_MODELS.md § 4.

**Referential integrity:** when a recipe is deleted, `useRecipeStore` also calls into meal-plan and favorites stores to remove its id. Pages defensively skip meal-plan entries whose recipeId no longer resolves.

## 8. Component structure highlights

- **RecipeCard**: image area (see DESIGN.md — gradient + emoji placeholder), category badge, title, meta row (⏱ total time · 🍽 servings · difficulty dot), heart toggle, "+ Meal Plan" quick-add on hover (always visible on touch).
- **FilterBar**: search input (debounced 200ms, matches title + ingredient names), category pills, dietary-tag multi-select, max-total-time select (Any/15/30/45/60), difficulty select, "Clear filters" link when any active. State syncs to URL query params so filtered views are shareable and back-button-friendly.
- **Modal**: used for delete confirmations and the mobile "More" sheet only. Recipe details are a page, not a modal (decision: deep-linking, scroll behavior, and mobile UX are all better).
- **EmptyState**: icon + heading + one-line body + primary CTA. Every list surface has one (see DESIGN.md § Empty states for the exact copy).
- **SimilarRecipes** (on detail page): same category first, then overlapping tags, exclude self, take 4.

## 9. Escalation protocol

If Sonnet hits a decision the docs don't cover — data-model change, new dependency, deviation from the grocery algorithm, feature cut — it stops and asks the user a single specific question with a recommended default, phrased so the user can relay it to Fable. It does not guess on those. Cosmetic micro-decisions (spacing, icon choice, copy) it decides itself per DESIGN.md.
