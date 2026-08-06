# Build Phases

Execute strictly in order. Each phase ends with its acceptance criteria verified in the browser (dev server, click through, console clean). Commit at the end of each phase with a message like `Phase 2: recipe library`.

## Phase 0 — Repo hygiene (5 min)

- `git init`, add a `.gitignore` (node, dist, .env).
- Initial commit of the docs.

## Phase 1 — Project setup & data

1. Scaffold: `npm create vite@latest . -- --template react-ts` (app lives at repo root).
2. Install deps per PLAN.md § Dependencies; wire Tailwind v4 via `@tailwindcss/vite`; add design tokens from DESIGN.md to `index.css`.
3. `tsconfig`: strict true, path alias `@/* → src/*` (also in `vite.config.ts`).
4. Create `src/types/index.ts` exactly per DATA_MODELS.md §1–2.
5. Create `src/data/vocabulary.ts` (~60 canonical ingredients) then `src/data/recipes.ts`, the curated expansions, and the generated recipe atlas (the 2,000+ seed recipes described in DATA_MODELS.md §5). This is the longest single task in the phase — take the time to make the recipes real.
6. Routing skeleton: `AppShell` (sidebar + mobile tab bar per PLAN.md §5), all 9 routes rendering placeholder pages, 404 route, theme toggle working end-to-end (settings store + `.dark` class + persistence).

**Accept:** dev server runs; can navigate all routes on desktop and mobile widths; dark mode toggles and survives reload; `tsc --noEmit` passes.

## Phase 2 — Recipe library & detail

1. `ui/` primitives as needed: Button, Card, Badge, Input, Select, EmptyState.
2. RecipeCard + RecipeGrid + RecipeImage (category gradients per DESIGN.md).
3. FilterBar: debounced search (title + ingredient name match), category pills, tag multi-select, max-time, difficulty, clear-filters; state ↔ URL query params. Filtering logic as pure `applyRecipeFilters()` in `src/lib/filters.ts`.
4. Recipe Detail page per DESIGN.md §3, including servings stepper with live ingredient-quantity re-rendering (`scaleIngredient` + `formatQuantity` from `src/lib/`), nutrition placeholder, SimilarRecipes. Meal-plan/heart buttons can be visually present but inert until Phases 3/5 — render them disabled-styled or wire to console for now, your choice.
5. Skeleton loading pass on Library (DESIGN.md §5).

**Accept:** search "chicken" filters correctly by both title and ingredients; combined filters work; URL reflects filters and survives reload/back; every recipe's detail page renders with correct scaled quantities at different servings; no-results empty state shows with working Clear filters.

## Phase 3 — Meal plan (selection system)

1. `useMealPlanStore` with `persist` (add/remove/setServings/clear, entries per DATA_MODELS.md).
2. Wire "Add to Meal Plan" on card quick-add + detail page (idempotent toggle, toast feedback, badge state "In Meal Plan ✓").
3. Meal Plan page per DESIGN.md: cards, steppers, remove, clear-all with confirm modal, summary footer, empty state.
4. Nav badges (sidebar + tab bar) showing selected count.

**Accept:** add 3 recipes, adjust servings, reload — state intact; remove and clear-all work; badges update live; adding same recipe twice doesn't duplicate.

## Phase 4 — Grocery list generator (the core)

1. **First:** `src/lib/units.ts` + `src/lib/grocery.ts` per DATA_MODELS.md §4, plus `grocery.test.ts` with the 7 specified tests. `npx vitest run` green before any UI.
2. `useGroceryStore` (checkedKeys/removedKeys/customItems) + the overlay selector.
3. Grocery List page per DESIGN.md §3: category sections, check-off with completed clustering, progress bar, remove line, add custom item form, toolbar actions (Clear completed / Restore removed / Reset list), empty state.
4. Nav badge = unchecked item count.

**Accept:** all unit tests pass (paste output); with 2 flour recipes in the plan the list shows one summed flour line naming both recipes; the ml-milk seed recipe produces a separate milk line; checks/removals/custom items survive reload; editing meal-plan servings updates quantities live; Reset list clears grocery state but leaves the meal plan alone.

## Phase 5 — Favorites & recipe management

1. `useFavoritesStore`; heart toggles on card/detail; Favorites page with empty state.
2. `useRecipeStore` (customRecipes + deletedSeedIds, combined `getAllRecipes()` used everywhere recipes are read).
3. Recipe Editor page per DESIGN.md §3: full form, vocabulary autocomplete on ingredient names (auto-fill grocery category on match), dynamic instruction list, validation, unsaved-changes guard. Create + edit modes; "Duplicate & edit" for seed recipes.
4. Delete (custom recipes, confirm modal) with referential cleanup: removed from meal plan + favorites; grocery list re-derives automatically.
5. "My recipe" badge on custom recipe cards.

**Accept:** create a recipe with 3 ingredients → appears in library, filterable, addable to meal plan, its ingredients merge into the grocery list; edit it → changes propagate; delete it → gone everywhere, no console errors; validation blocks empty title / zero ingredients; favorites survive reload.

## Phase 6 — Dashboard, settings & polish

1. Dashboard per DESIGN.md §3 (stats, featured-by-day, category pills, meal-plan strip).
2. Settings page: theme radio (light/dark/system), default servings, "Reset all data" (confirm modal → clears all persisted stores).
3. Polish pass with DESIGN.md open: motion rules, reduced-motion query, focus-visible rings, toasts everywhere they're specified, both themes on every page, 375/768/1280px sweep, empty states verified verbatim, favicon + `<title>`s per page.
4. Run the full testing checklist below; fix everything found; `tsc --noEmit` + `vitest run` + production `vite build` all clean.

**Accept:** the testing checklist passes end to end.

## Testing checklist (manual QA — run at the end, in both themes)

**Flows**
- [ ] Golden path: browse → filter → detail → add 3 recipes at varied servings → meal plan review → grocery list correct → check items while "shopping" → add custom item → reload → all intact.
- [ ] Merge demo: two flour recipes sum; ml + cup milk stay separate lines.
- [ ] Favorites: heart on card, on detail, un-heart from Favorites page.
- [ ] Custom recipe full lifecycle (create/edit/delete + propagation into plan, list, favorites).
- [ ] Clear-alls: meal plan clear, grocery reset, settings reset-all — each scoped correctly, each behind a confirm.

**Edge cases**
- [ ] Meal plan entry referencing a deleted custom recipe → no crash, entry dropped.
- [ ] Servings stepper at min (1); very large servings (20) → quantities format sanely.
- [ ] `to-taste` ingredients render "to taste", no NaN anywhere.
- [ ] Direct URL loads: `/recipes/:id` for a bad id → friendly not-found; filtered library URL cold-load.
- [ ] Fresh browser profile (empty localStorage) → sensible defaults everywhere, no hydration flash.
- [ ] localStorage from a previous phase present → app doesn't crash on shape drift (persist `version` + migrate or reset).

**Quality gates**
- [ ] `tsc --noEmit`, `vitest run`, `vite build` all pass — paste outputs.
- [ ] Console clean (no errors/warnings) across a full click-through.
- [ ] Keyboard-only pass: tab through library → open detail → add to plan → check a grocery item.
- [ ] No horizontal scroll at 375px; tab bar respects safe-area.

## Shipped revamp features

- Date-based breakfast, lunch, and dinner planning with week navigation and date-range grocery generation.
- Pantry exclusions, editable grocery quantities and notes, and expandable recipe contribution tracking.
- Step-by-step cooking mode, local cooking history, recently cooked meals, and pantry-aware Pick for me suggestions.

## Future upgrade ideas (v2+)

1. Real unit-conversion preferences (metric to US) with explicit user opt-in.
2. Recipe import from URL (schema.org/Recipe scraping).
3. Real nutrition data (per-ingredient database or API) replacing the placeholder.
4. Share, print, and export grocery lists; recipe sharing links.
5. PWA offline support and an install prompt.
6. Accounts and cloud sync.
7. Cooking timers and optional wake-lock support.
8. Smart ingredient parsing for pasted recipes and richer pantry-based suggestions.
