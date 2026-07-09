# Cookbook + Groceries

A polished cookbook and recipe app: browse recipes, build a meal plan, and auto-generate a combined grocery list. No backend, no auth — everything persists to localStorage.

**You (Sonnet) are the builder. The full plan was authored by Fable 5 (the architect) and lives in `docs/`. Read all four docs before writing any code:**

- [docs/PLAN.md](docs/PLAN.md) — architecture, tech stack, user flows, component structure
- [docs/DATA_MODELS.md](docs/DATA_MODELS.md) — TypeScript models and the grocery list aggregation algorithm (the most delicate logic in the app — follow it exactly)
- [docs/DESIGN.md](docs/DESIGN.md) — visual system, tokens, dark mode, empty/loading states
- [docs/BUILD_PHASES.md](docs/BUILD_PHASES.md) — the phase-by-phase build order with acceptance criteria per phase

## Tech stack (decided — do not substitute)

- Vite + React 19 + TypeScript (strict)
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin, CSS-first config)
- React Router v7 (library mode, `BrowserRouter`)
- Zustand v5 with `persist` middleware for all localStorage persistence
- `lucide-react` for icons
- No other runtime dependencies without checking `docs/PLAN.md` § "Dependencies" first

## Working rules

- Build strictly in phase order (`docs/BUILD_PHASES.md`). Finish a phase's acceptance criteria before starting the next.
- Every piece of persisted state goes through a Zustand store with `persist` — never call `localStorage` directly from components.
- All types live in `src/types/index.ts`. All pure logic (aggregation, unit conversion, scaling, filtering) lives in `src/lib/` as pure functions with no store imports, so it stays testable.
- Seed recipes use the canonical ingredient names and units listed in `docs/DATA_MODELS.md` § "Ingredient vocabulary" — this is what makes grocery merging work.
- Verify in the browser after each phase: run the dev server, click through the acceptance criteria, check the console for errors.

## When you're unsure

If a product or design decision comes up that the docs don't cover, **do not guess**. Stop and ask the user, phrased so they can relay it to Fable (the architect): state the question, the options, and your recommended default in one or two sentences. Examples of things worth asking about: changing the data model, adding a dependency, deviating from the grocery aggregation rules, cutting a feature for time. Things NOT worth asking about: exact pixel values, icon choices, copy text — use the design doc and good judgment.
