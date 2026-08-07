import { useState } from 'react';
import { Monitor, Moon, RotateCcw, Sun, Users, type LucideIcon } from 'lucide-react';
import type { ThemePreference } from '@/stores/useSettingsStore';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { useGroceryStore } from '@/stores/useGroceryStore';
import { useMealPlanStore } from '@/stores/useMealPlanStore';
import { useMealHistoryStore } from '@/stores/useMealHistoryStore';
import { usePantryStore } from '@/stores/usePantryStore';
import { useRecipeStore } from '@/stores/useRecipeStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useToastStore } from '@/stores/useToastStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Stepper } from '@/components/ui/Stepper';

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  { value: 'system', label: 'System', description: 'Follow this device.', icon: Monitor },
  { value: 'light', label: 'Light', description: 'Warm daytime palette.', icon: Sun },
  { value: 'dark', label: 'Dark', description: 'Low-light cooking mode.', icon: Moon },
];

export default function SettingsPage() {
  const theme = useSettingsStore((state) => state.theme);
  const defaultServings = useSettingsStore((state) => state.defaultServings);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const setDefaultServings = useSettingsStore((state) => state.setDefaultServings);
  const resetSettings = useSettingsStore((state) => state.reset);
  const resetRecipes = useRecipeStore((state) => state.reset);
  const resetMealPlan = useMealPlanStore((state) => state.reset);
  const resetGroceries = useGroceryStore((state) => state.reset);
  const resetPantry = usePantryStore((state) => state.reset);
  const resetHistory = useMealHistoryStore((state) => state.reset);
  const clearFavorites = useFavoritesStore((state) => state.clear);
  const resetAccount = useAccountStore((state) => state.reset);
  const showToast = useToastStore((state) => state.showToast);
  const [resetOpen, setResetOpen] = useState(false);

  function handleResetAll() {
    resetRecipes();
    resetMealPlan();
    resetGroceries();
    resetPantry();
    resetHistory();
    clearFavorites();
    resetAccount();
    resetSettings();
    setResetOpen(false);
    showToast('All data reset');
  }

  return (
    <div className="pb-10">
      <section className="border-b border-border pb-7">
        <p className="text-sm font-semibold text-primary">Make it yours</p>
        <h1 className="mt-1 font-display text-[45px] leading-none text-text">Settings</h1>
        <p className="mt-3 text-sm text-text-muted">Tune the defaults that shape your kitchen.</p>
      </section>

      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="font-display text-2xl">Theme</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;
                const active = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTheme(option.value)}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      active
                        ? 'border-primary bg-primary-soft text-text'
                        : 'border-border bg-card text-text hover:bg-primary-soft/60'
                    }`}
                  >
                    <Icon size={18} className="text-primary" />
                    <span className="mt-3 block text-sm font-semibold">{option.label}</span>
                    <span className="mt-1 block text-xs text-text-muted">{option.description}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl">Default Servings</h2>
                <p className="mt-1 text-sm text-text-muted">Used when you create a new custom recipe.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Users size={18} />
                </span>
                <Stepper
                  value={defaultServings}
                  onChange={setDefaultServings}
                  min={1}
                  max={20}
                  label="Default servings"
                />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-5 lg:self-start">
          <h2 className="font-display text-2xl">Local Data</h2>
          <p className="mt-2 text-sm text-text-muted">
            Recipes, favorites, meal plan, groceries, pantry staples, cooking history, and settings are stored on this device.
          </p>
          <Button variant="danger" className="mt-5 w-full" onClick={() => setResetOpen(true)}>
            <RotateCcw size={16} />
            Reset all data
          </Button>
        </Card>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset all data?"
        body="This clears custom recipes, favorites, meal plan, grocery list state, pantry staples, cooking history, and settings on this device. This can't be undone."
        confirmLabel="Reset all"
        danger
        onConfirm={handleResetAll}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}
