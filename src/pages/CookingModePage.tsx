import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, ListChecks, X } from 'lucide-react';
import { formatIngredientLine } from '@/lib/units';
import { useRecipeById } from '@/stores/useRecipeStore';
import { useMealHistoryStore } from '@/stores/useMealHistoryStore';
import { useToastStore } from '@/stores/useToastStore';
import { Button } from '@/components/ui/Button';

export default function CookingModePage() {
  const { id } = useParams();
  const recipe = useRecipeById(id);
  const navigate = useNavigate();
  const recordCookedMeal = useMealHistoryStore((state) => state.recordCookedMeal);
  const showToast = useToastStore((state) => state.showToast);
  const [stepIndex, setStepIndex] = useState(0);

  if (!recipe) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-3xl">Recipe not found</h1>
        <Link to="/recipes" className="mt-3 inline-block text-sm font-medium text-primary">Back to recipes</Link>
      </div>
    );
  }

  const activeRecipe = recipe;
  const instructions = activeRecipe.instructions.length > 0
    ? activeRecipe.instructions
    : ['This recipe does not have saved instructions yet. Review the ingredients and cook to your preference.'];
  const step = instructions[stepIndex];
  const isLastStep = stepIndex === instructions.length - 1;

  function finishCooking() {
    recordCookedMeal(activeRecipe.id, activeRecipe.servings);
    showToast(`${activeRecipe.title} added to your cooking history`);
    navigate(`/recipes/${activeRecipe.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Cooking mode</p>
          <h1 className="mt-1 font-display text-[38px] leading-none">{activeRecipe.title}</h1>
        </div>
        <Link to={`/recipes/${activeRecipe.id}`} aria-label="Exit cooking mode" className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-text-muted hover:bg-primary-soft"><X size={18} /></Link>
      </div>

      <div className="mt-8 border-y border-border py-5">
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>Step {stepIndex + 1} of {instructions.length}</span>
          <span>{Math.round(((stepIndex + 1) / instructions.length) * 100)}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-soft">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${((stepIndex + 1) / instructions.length) * 100}%` }} />
        </div>
        <p className="mt-8 font-display text-[31px] leading-[1.25] sm:text-[38px]">{step}</p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => setStepIndex((value) => Math.max(0, value - 1))} disabled={stepIndex === 0}>
          <ChevronLeft size={17} />Previous
        </Button>
        {isLastStep ? (
          <Button onClick={finishCooking}><Check size={17} />Finish cooking</Button>
        ) : (
          <Button onClick={() => setStepIndex((value) => Math.min(instructions.length - 1, value + 1))}>Next<ChevronRight size={17} /></Button>
        )}
      </div>

      <details className="mt-8 border-t border-border pt-5">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium"><ListChecks size={16} />Ingredients</summary>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {activeRecipe.ingredients.map((ingredient, index) => <li key={`${ingredient.name}-${index}`} className="text-sm text-text-muted">{formatIngredientLine(ingredient)}</li>)}
        </ul>
      </details>
    </div>
  );
}
