import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, Plus, Save, Trash2, X } from 'lucide-react';
import type { DietaryTag, Difficulty, GroceryCategory, Ingredient, Recipe, RecipeCategory, Unit } from '@/types';
import { INGREDIENT_VOCABULARY, findVocabularyEntry } from '@/data/vocabulary';
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  GROCERY_CATEGORY_LABELS,
  TAG_LABELS,
  UNIT_LABELS,
} from '@/lib/labels';
import { newId } from '@/lib/id';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useToastStore } from '@/stores/useToastStore';
import { useRecipeById, useRecipeStore } from '@/stores/useRecipeStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as RecipeCategory[];
const TAGS = Object.keys(TAG_LABELS) as DietaryTag[];
const DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as Difficulty[];
const GROCERY_CATEGORIES = Object.keys(GROCERY_CATEGORY_LABELS) as GroceryCategory[];
const UNITS = Object.keys(UNIT_LABELS) as Unit[];
const FOOD_EMOJIS = [
  '\u{1F95E}',
  '\u{1F373}',
  '\u{1F957}',
  '\u{1F35D}',
  '\u{1F35B}',
  '\u{1F354}',
  '\u{1F355}',
  '\u{1F32E}',
  '\u{1F372}',
  '\u{1F35C}',
  '\u{1F363}',
  '\u{1F969}',
  '\u{1F41F}',
  '\u{1F990}',
  '\u{1F36A}',
  '\u{1F370}',
  '\u{1F967}',
  '\u{1F366}',
  '\u{1F34E}',
  '\u{1F34C}',
  '\u{1F951}',
  '\u{1FAD0}',
  '\u{1FAD1}',
  '\u{1F35E}',
  '\u{1F375}',
  '\u{1F37D}\uFE0F',
];

interface IngredientDraft {
  id: string;
  name: string;
  quantity: string;
  unit: Unit;
  groceryCategory: GroceryCategory;
  note: string;
}

interface RecipeFormState {
  title: string;
  description: string;
  category: RecipeCategory;
  cuisine: string;
  tags: DietaryTag[];
  difficulty: Difficulty;
  prepMinutes: string;
  cookMinutes: string;
  servings: string;
  emoji: string;
  ingredients: IngredientDraft[];
  instructions: string[];
  notes: string;
}

interface FormErrors {
  title?: string;
  ingredients?: string;
  instructions?: string;
  prepMinutes?: string;
  cookMinutes?: string;
  servings?: string;
}

function blankIngredient(): IngredientDraft {
  return {
    id: newId(),
    name: '',
    quantity: '1',
    unit: 'unit',
    groceryCategory: 'other',
    note: '',
  };
}

function recipeToForm(recipe: Recipe | undefined, defaultServings: number): RecipeFormState {
  return {
    title: recipe?.title ?? '',
    description: recipe?.description ?? '',
    category: recipe?.category ?? 'dinner',
    cuisine: recipe?.cuisine ?? '',
    tags: recipe?.tags ?? [],
    difficulty: recipe?.difficulty ?? 'easy',
    prepMinutes: String(recipe?.prepMinutes ?? 10),
    cookMinutes: String(recipe?.cookMinutes ?? 20),
    servings: String(recipe?.servings ?? defaultServings),
    emoji: recipe?.image.emoji ?? '\u{1F37D}\uFE0F',
    ingredients:
      recipe?.ingredients.map((ingredient) => ({
        id: newId(),
        name: ingredient.name,
        quantity: ingredient.unit === 'to-taste' ? '0' : String(ingredient.quantity),
        unit: ingredient.unit,
        groceryCategory: ingredient.groceryCategory,
        note: ingredient.note ?? '',
      })) ?? [blankIngredient()],
    instructions: recipe?.instructions.length ? [...recipe.instructions] : [''],
    notes: recipe?.notes ?? '',
  };
}

function parseNonNegative(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parsePositive(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : null;
}

function buildIngredients(drafts: IngredientDraft[]): Ingredient[] {
  return drafts
    .filter((ingredient) => ingredient.name.trim().length > 0)
    .map((ingredient) => {
      const name = ingredient.name.trim().toLowerCase();
      const match = findVocabularyEntry(name);
      const unit = ingredient.unit;
      return {
        name,
        quantity: unit === 'to-taste' ? 0 : Number(ingredient.quantity),
        unit,
        groceryCategory: match?.groceryCategory ?? ingredient.groceryCategory,
        ...(ingredient.note.trim() ? { note: ingredient.note.trim() } : {}),
      };
    });
}

function validateForm(form: RecipeFormState): FormErrors {
  const errors: FormErrors = {};
  const prepMinutes = parseNonNegative(form.prepMinutes);
  const cookMinutes = parseNonNegative(form.cookMinutes);
  const servings = parsePositive(form.servings);
  const filledIngredients = form.ingredients.filter((ingredient) => ingredient.name.trim().length > 0);
  const instructionCount = form.instructions.filter((step) => step.trim().length > 0).length;

  if (!form.title.trim()) errors.title = 'Title is required.';
  if (prepMinutes === null) errors.prepMinutes = 'Prep time must be 0 or more.';
  if (cookMinutes === null) errors.cookMinutes = 'Cook time must be 0 or more.';
  if (servings === null) errors.servings = 'Servings must be at least 1.';
  if (filledIngredients.length === 0) errors.ingredients = 'Add at least one ingredient.';
  if (
    filledIngredients.some(
      (ingredient) => ingredient.unit !== 'to-taste' && parseNonNegative(ingredient.quantity) === null,
    )
  ) {
    errors.ingredients = 'Ingredient quantities must be 0 or more.';
  }
  if (instructionCount === 0) errors.instructions = 'Add at least one instruction.';

  return errors;
}

export default function RecipeEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sourceRecipe = useRecipeById(id);
  const defaultServings = useSettingsStore((state) => state.defaultServings);
  const saveCustomRecipe = useRecipeStore((state) => state.saveCustomRecipe);
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const showToast = useToastStore((state) => state.showToast);
  const titleRef = useRef<HTMLInputElement>(null);

  const initialForm = useMemo(() => recipeToForm(sourceRecipe, defaultServings), [sourceRecipe, defaultServings]);
  const [form, setForm] = useState(initialForm);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isEditingCustom = Boolean(sourceRecipe?.isCustom);
  const isDuplicatingSeed = Boolean(sourceRecipe && !sourceRecipe.isCustom);
  const isBadEditRoute = Boolean(id && !sourceRecipe);

  useEffect(() => {
    setForm(initialForm);
    setDirty(false);
    setErrors({});
  }, [initialForm]);

  useEffect(() => {
    if (!dirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }

    function handleDocumentClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target || anchor.download || anchor.origin !== window.location.origin) return;
      if (anchor.pathname === window.location.pathname && anchor.search === window.location.search) return;

      if (!window.confirm('Discard unsaved recipe changes?')) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleDocumentClick, true);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [dirty]);

  function updateForm(patch: Partial<RecipeFormState>) {
    setForm((current) => ({ ...current, ...patch }));
    setDirty(true);
  }

  function toggleTag(tag: DietaryTag) {
    updateForm({
      tags: form.tags.includes(tag) ? form.tags.filter((item) => item !== tag) : [...form.tags, tag],
    });
  }

  function updateIngredient(idToUpdate: string, patch: Partial<IngredientDraft>) {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient) => {
        if (ingredient.id !== idToUpdate) return ingredient;
        const next = { ...ingredient, ...patch };
        if (patch.name !== undefined) {
          const match = findVocabularyEntry(patch.name.trim().toLowerCase());
          if (match) {
            next.groceryCategory = match.groceryCategory;
            next.unit = match.defaultUnit;
            next.quantity = match.defaultUnit === 'to-taste' ? '0' : next.quantity;
          }
        }
        if (patch.unit === 'to-taste') next.quantity = '0';
        return next;
      }),
    }));
    setDirty(true);
  }

  function removeIngredient(idToRemove: string) {
    setForm((current) => ({
      ...current,
      ingredients:
        current.ingredients.length === 1
          ? [blankIngredient()]
          : current.ingredients.filter((ingredient) => ingredient.id !== idToRemove),
    }));
    setDirty(true);
  }

  function updateInstruction(index: number, value: string) {
    setForm((current) => ({
      ...current,
      instructions: current.instructions.map((step, stepIndex) => (stepIndex === index ? value : step)),
    }));
    setDirty(true);
  }

  function moveInstruction(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= form.instructions.length) return;
    const next = [...form.instructions];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    updateForm({ instructions: next });
  }

  function focusFirstInvalid(nextErrors: FormErrors) {
    if (nextErrors.title) {
      titleRef.current?.focus();
      return;
    }

    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalid(nextErrors);
      return;
    }

    const now = new Date().toISOString();
    const recipeId = isEditingCustom && sourceRecipe ? sourceRecipe.id : newId();
    const savedRecipe: Recipe = {
      id: recipeId,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      ...(form.cuisine.trim() ? { cuisine: form.cuisine.trim() } : {}),
      tags: form.tags,
      prepMinutes: parseNonNegative(form.prepMinutes) ?? 0,
      cookMinutes: parseNonNegative(form.cookMinutes) ?? 0,
      servings: parsePositive(form.servings) ?? 1,
      difficulty: form.difficulty,
      image: { emoji: form.emoji },
      ingredients: buildIngredients(form.ingredients),
      instructions: form.instructions.map((step) => step.trim()).filter(Boolean),
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      isCustom: true,
      createdAt: isEditingCustom && sourceRecipe ? sourceRecipe.createdAt : now,
      updatedAt: now,
    };

    saveCustomRecipe(savedRecipe);
    setDirty(false);
    showToast(isEditingCustom ? 'Recipe updated' : 'Recipe saved');
    navigate(`/recipes/${savedRecipe.id}`);
  }

  function handleCancel() {
    if (dirty && !window.confirm('Discard unsaved recipe changes?')) return;
    navigate(sourceRecipe ? `/recipes/${sourceRecipe.id}` : '/recipes');
  }

  function handleDelete() {
    if (!sourceRecipe) return;
    deleteRecipe(sourceRecipe.id);
    setDirty(false);
    setDeleteOpen(false);
    showToast('Recipe deleted');
    navigate('/recipes');
  }

  if (isBadEditRoute) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-5xl">?</span>
        <h1 className="text-xl font-semibold tracking-tight">Recipe not found</h1>
        <p className="text-text-muted">This recipe may have been removed.</p>
        <Link
          to="/recipes"
          className="mt-2 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Back to recipes
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEditingCustom ? 'Edit Recipe' : isDuplicatingSeed ? 'Duplicate & Edit' : 'Add Recipe'}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {isDuplicatingSeed
              ? 'Save this seed recipe as your own editable copy.'
              : 'Build a recipe that can be filtered, favorited, planned, and merged into groceries.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            <X size={16} />
            Cancel
          </Button>
          <Button type="submit">
            <Save size={16} />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <Card className="p-5">
            <h2 className="text-lg font-semibold tracking-tight">Basics</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Title" error={errors.title} className="sm:col-span-2">
                <Input
                  ref={titleRef}
                  value={form.title}
                  onChange={(event) => updateForm({ title: event.target.value })}
                  aria-invalid={Boolean(errors.title)}
                  placeholder="Lemon herb chicken"
                />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea
                  value={form.description}
                  onChange={(event) => updateForm({ description: event.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                  placeholder="A short, appetizing summary."
                />
              </Field>
              <Field label="Category">
                <Select value={form.category} onChange={(event) => updateForm({ category: event.target.value as RecipeCategory })}>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Cuisine">
                <Input
                  value={form.cuisine}
                  onChange={(event) => updateForm({ cuisine: event.target.value })}
                  placeholder="e.g. Mexican, Italian, Korean"
                />
              </Field>
              <Field label="Difficulty">
                <Select value={form.difficulty} onChange={(event) => updateForm({ difficulty: event.target.value as Difficulty })}>
                  {DIFFICULTIES.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {DIFFICULTY_LABELS[difficulty]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Prep minutes" error={errors.prepMinutes}>
                <Input
                  type="number"
                  min={0}
                  value={form.prepMinutes}
                  onChange={(event) => updateForm({ prepMinutes: event.target.value })}
                  aria-invalid={Boolean(errors.prepMinutes)}
                />
              </Field>
              <Field label="Cook minutes" error={errors.cookMinutes}>
                <Input
                  type="number"
                  min={0}
                  value={form.cookMinutes}
                  onChange={(event) => updateForm({ cookMinutes: event.target.value })}
                  aria-invalid={Boolean(errors.cookMinutes)}
                />
              </Field>
              <Field label="Servings" error={errors.servings}>
                <Input
                  type="number"
                  min={1}
                  value={form.servings}
                  onChange={(event) => updateForm({ servings: event.target.value })}
                  aria-invalid={Boolean(errors.servings)}
                />
              </Field>
              <Field label="Emoji">
                <div className="flex flex-wrap gap-1.5">
                  {FOOD_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      aria-label={`Use ${emoji} emoji`}
                      aria-pressed={form.emoji === emoji}
                      onClick={() => updateForm({ emoji })}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-colors ${
                        form.emoji === emoji
                          ? 'border-primary bg-primary-soft'
                          : 'border-border bg-card hover:bg-primary-soft/60'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    aria-pressed={form.tags.includes(tag)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      form.tags.includes(tag)
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-card text-text-muted hover:bg-primary-soft/60'
                    }`}
                  >
                    {TAG_LABELS[tag]}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Recipe notes" className="mt-4">
              <textarea
                value={form.notes}
                onChange={(event) => updateForm({ notes: event.target.value })}
                rows={3}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                placeholder="Substitutions, serving ideas, or anything worth remembering."
              />
            </Field>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Ingredients</h2>
                {errors.ingredients && <p className="mt-1 text-xs text-red-600">{errors.ingredients}</p>}
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => updateForm({ ingredients: [...form.ingredients, blankIngredient()] })}
              >
                <Plus size={14} />
                Add
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {form.ingredients.map((ingredient) => (
                <div key={ingredient.id} className="rounded-xl border border-border bg-surface/60 p-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_96px_120px_160px_auto]">
                    <div>
                      <Input
                        list="ingredient-vocabulary"
                        value={ingredient.name}
                        onChange={(event) => updateIngredient(ingredient.id, { name: event.target.value })}
                        placeholder="ingredient name"
                        aria-invalid={Boolean(errors.ingredients && !ingredient.name.trim())}
                      />
                    </div>
                    <Input
                      type="number"
                      min={0}
                      step="0.25"
                      value={ingredient.quantity}
                      disabled={ingredient.unit === 'to-taste'}
                      onChange={(event) => updateIngredient(ingredient.id, { quantity: event.target.value })}
                      aria-label="Quantity"
                    />
                    <Select
                      value={ingredient.unit}
                      onChange={(event) => updateIngredient(ingredient.id, { unit: event.target.value as Unit })}
                      aria-label="Unit"
                    >
                      {UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {UNIT_LABELS[unit].singular || unit}
                        </option>
                      ))}
                    </Select>
                    <Select
                      value={ingredient.groceryCategory}
                      onChange={(event) =>
                        updateIngredient(ingredient.id, { groceryCategory: event.target.value as GroceryCategory })
                      }
                      aria-label="Grocery category"
                    >
                      {GROCERY_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {GROCERY_CATEGORY_LABELS[category]}
                        </option>
                      ))}
                    </Select>
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient.id)}
                      aria-label="Remove ingredient"
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted hover:bg-card hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <Input
                    value={ingredient.note}
                    onChange={(event) => updateIngredient(ingredient.id, { note: event.target.value })}
                    placeholder="optional note, e.g. finely chopped"
                    className="mt-3"
                  />
                </div>
              ))}
            </div>
            <datalist id="ingredient-vocabulary">
              {INGREDIENT_VOCABULARY.map((entry) => (
                <option key={entry.name} value={entry.name} />
              ))}
            </datalist>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Instructions</h2>
                {errors.instructions && <p className="mt-1 text-xs text-red-600">{errors.instructions}</p>}
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => updateForm({ instructions: [...form.instructions, ''] })}
              >
                <Plus size={14} />
                Add step
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {form.instructions.map((step, index) => (
                <div key={index} className="flex gap-3 rounded-xl border border-border bg-surface/60 p-3">
                  <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <textarea
                    value={step}
                    onChange={(event) => updateInstruction(index, event.target.value)}
                    rows={2}
                    aria-invalid={Boolean(errors.instructions && !step.trim())}
                    className="min-h-20 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                    placeholder="Describe this step."
                  />
                  <div className="flex flex-col gap-1">
                    <IconButton label="Move step up" disabled={index === 0} onClick={() => moveInstruction(index, -1)}>
                      <ArrowUp size={14} />
                    </IconButton>
                    <IconButton
                      label="Move step down"
                      disabled={index === form.instructions.length - 1}
                      onClick={() => moveInstruction(index, 1)}
                    >
                      <ArrowDown size={14} />
                    </IconButton>
                    <IconButton
                      label="Remove step"
                      onClick={() =>
                        updateForm({
                          instructions:
                            form.instructions.length === 1
                              ? ['']
                              : form.instructions.filter((_, stepIndex) => stepIndex !== index),
                        })
                      }
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-3xl">
                {form.emoji}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-1 font-semibold tracking-tight">{form.title || 'Untitled recipe'}</p>
                <p className="text-xs text-text-muted">
                  {(parseNonNegative(form.prepMinutes) ?? 0) + (parseNonNegative(form.cookMinutes) ?? 0)} min total
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-surface p-3 text-xs text-text-muted">
              Exact vocabulary matches fill aisle categories automatically, which keeps grocery merging tidy.
            </div>
            {isEditingCustom && (
              <Button type="button" variant="danger" className="mt-4 w-full" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={16} />
                Delete recipe
              </Button>
            )}
          </Card>
        </aside>
      </div>

      <div className="sticky bottom-0 mt-6 rounded-2xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur">
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Save size={16} />
            Save recipe
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete recipe?"
        body="This removes the recipe from your library, meal plan, and favorites. This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </form>
  );
}

function Field({
  label,
  error,
  className = '',
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-card hover:text-primary disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
