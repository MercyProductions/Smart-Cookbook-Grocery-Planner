import { Monitor, Moon, Sun } from 'lucide-react';
import { useSettingsStore, type ThemePreference } from '@/stores/useSettingsStore';

const CYCLE: ThemePreference[] = ['light', 'dark', 'system'];

const ICONS: Record<ThemePreference, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const LABELS: Record<ThemePreference, string> = {
  light: 'Light theme',
  dark: 'Dark theme',
  system: 'System theme',
};

export function ThemeToggle() {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const Icon = ICONS[theme];

  function handleClick() {
    const nextIndex = (CYCLE.indexOf(theme) + 1) % CYCLE.length;
    setTheme(CYCLE[nextIndex]);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`${LABELS[theme]} — click to change`}
      title={LABELS[theme]}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-text transition-colors hover:bg-primary-soft active:scale-[0.98]"
    >
      <Icon size={18} />
    </button>
  );
}
