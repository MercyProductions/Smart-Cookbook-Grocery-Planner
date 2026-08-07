import { BadgeCheck, ChefHat, ShieldCheck, SlidersHorizontal, Users } from 'lucide-react';
import type { CookingExperience, DietaryTag } from '@/types';
import { TAG_LABELS } from '@/lib/labels';
import { ALLERGIES, ALLERGY_LABELS } from '@/lib/allergens';
import { useAccountStore } from '@/stores/useAccountStore';
import { Input } from '@/components/ui/Input';
import { Stepper } from '@/components/ui/Stepper';

const DIETARY_PREFERENCES: DietaryTag[] = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'pescatarian',
  'keto',
  'paleo',
  'mediterranean',
  'high-protein',
  'low-carb',
];

const EXPERIENCE_OPTIONS: Array<{ value: CookingExperience; label: string; detail: string }> = [
  { value: 'beginner', label: 'Starting out', detail: 'Clear, unfussy recipes' },
  { value: 'comfortable', label: 'Comfortable', detail: 'A little more range' },
  { value: 'confident', label: 'Confident', detail: 'Bring on the projects' },
];

export default function AccountPage() {
  const displayName = useAccountStore((state) => state.displayName);
  const householdSize = useAccountStore((state) => state.householdSize);
  const cookingExperience = useAccountStore((state) => state.cookingExperience);
  const dietaryPreferences = useAccountStore((state) => state.dietaryPreferences);
  const allergies = useAccountStore((state) => state.allergies);
  const hideAllergenMatches = useAccountStore((state) => state.hideAllergenMatches);
  const setDisplayName = useAccountStore((state) => state.setDisplayName);
  const setHouseholdSize = useAccountStore((state) => state.setHouseholdSize);
  const setCookingExperience = useAccountStore((state) => state.setCookingExperience);
  const toggleDietaryPreference = useAccountStore((state) => state.toggleDietaryPreference);
  const toggleAllergy = useAccountStore((state) => state.toggleAllergy);
  const setHideAllergenMatches = useAccountStore((state) => state.setHideAllergenMatches);

  const initials = displayName.trim().slice(0, 1).toUpperCase() || 'C';

  return (
    <div className="pb-12">
      <section className="border-b border-border pb-8">
        <p className="text-sm font-semibold text-primary">Your personal kitchen</p>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-[48px] leading-none text-text sm:text-[58px]">Account</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-text-muted">The details that make every recipe suggestion feel more like it belongs in your kitchen.</p>
          </div>
          <div className="flex items-center gap-3 border border-border bg-card px-3 py-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white">{initials}</span>
            <span><span className="block text-sm font-semibold text-text">{displayName.trim() || 'Your Cookbook'}</span><span className="block text-xs text-text-muted">Personal kitchen profile</span></span>
          </div>
        </div>
      </section>

      <section className="grid border-b border-border py-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] lg:gap-12">
        <div>
          <div className="flex items-center gap-2 text-primary"><BadgeCheck size={18} /><span className="text-sm font-semibold">Kitchen profile</span></div>
          <h2 className="mt-3 font-display text-3xl text-text">Make the home page yours.</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-text-muted">Set a name and household size so planning starts from the right place.</p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 lg:mt-0 lg:border-l lg:border-border lg:pl-12">
          <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase text-text-muted">What should we call you?</span><Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your name" aria-label="Your name" /></label>
          <div><span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-text-muted"><Users size={13} /> Household size</span><Stepper value={householdSize} onChange={setHouseholdSize} min={1} max={20} label="Household size" /></div>
        </div>
      </section>

      <section className="grid border-b border-border py-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] lg:gap-12">
        <div>
          <div className="flex items-center gap-2 text-primary"><ShieldCheck size={18} /><span className="text-sm font-semibold">Food preferences</span></div>
          <h2 className="mt-3 font-display text-3xl text-text">Set the rules of the table.</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-text-muted">Dietary preferences become part of your recipe discovery. Allergies can be hidden from browsing and flagged anywhere a recipe is opened.</p>
        </div>
        <div className="mt-6 lg:mt-0 lg:border-l lg:border-border lg:pl-12">
          <p className="text-xs font-semibold uppercase text-text-muted">Dietary preferences</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DIETARY_PREFERENCES.map((tag) => {
              const active = dietaryPreferences.includes(tag);
              return <button key={tag} type="button" aria-pressed={active} onClick={() => toggleDietaryPreference(tag)} className={`rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${active ? 'border-primary bg-primary text-white' : 'border-border bg-card text-text-muted hover:border-text/25 hover:text-text'}`}>{TAG_LABELS[tag]}</button>;
            })}
          </div>

          <div className="mt-7 border-t border-border pt-6">
            <p className="text-xs font-semibold uppercase text-text-muted">Allergies and sensitivities</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ALLERGIES.map((allergy) => {
                const selected = allergies.includes(allergy);
                return (
                  <label key={allergy} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${selected ? 'border-primary bg-primary-soft text-text' : 'border-border bg-card text-text-muted hover:border-text/25'}`}>
                    <input type="checkbox" checked={selected} onChange={() => toggleAllergy(allergy)} className="h-4 w-4 rounded border-border accent-primary" />
                    <span className="font-medium">{ALLERGY_LABELS[allergy]}</span>
                  </label>
                );
              })}
            </div>
            <label className="mt-5 flex cursor-pointer items-start gap-3 border-t border-border pt-5">
              <input type="checkbox" checked={hideAllergenMatches} onChange={(event) => setHideAllergenMatches(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-border accent-primary" />
              <span><span className="block text-sm font-semibold text-text">Keep matches out of recipe browsing</span><span className="mt-1 block text-xs leading-5 text-text-muted">Recipes remain available through direct links, with a clear allergy check before you cook.</span></span>
            </label>
          </div>
        </div>
      </section>

      <section className="grid py-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] lg:gap-12">
        <div>
          <div className="flex items-center gap-2 text-primary"><SlidersHorizontal size={18} /><span className="text-sm font-semibold">Cooking style</span></div>
          <h2 className="mt-3 font-display text-3xl text-text">Choose your pace.</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-text-muted">This guides the tone of the home experience and helps keep recipe ideas within reach.</p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-2 lg:mt-0 lg:border-l lg:border-border lg:pl-12">
          {EXPERIENCE_OPTIONS.map((option) => {
            const active = cookingExperience === option.value;
            return (
              <button key={option.value} type="button" aria-pressed={active} onClick={() => setCookingExperience(option.value)} className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${active ? 'border-primary bg-primary-soft' : 'border-border bg-card hover:border-text/25'}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-primary text-white' : 'bg-surface text-text-muted'}`}><ChefHat size={17} /></span>
                <span><span className="block text-sm font-semibold text-text">{option.label}</span><span className="mt-0.5 block text-xs text-text-muted">{option.detail}</span></span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
