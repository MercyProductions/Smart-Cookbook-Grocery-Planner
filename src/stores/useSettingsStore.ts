import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: ThemePreference;
  defaultServings: number;
  setTheme: (theme: ThemePreference) => void;
  setDefaultServings: (servings: number) => void;
  reset: () => void;
}

const DEFAULT_SETTINGS = {
  theme: 'light' as ThemePreference,
  defaultServings: 4,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setTheme: (theme) => set({ theme }),
      setDefaultServings: (defaultServings) => set({ defaultServings: Math.max(1, defaultServings) }),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'cookbook.settings.v1',
      version: 2,
      partialize: (state) => ({
        theme: state.theme,
        defaultServings: state.defaultServings,
      }),
      migrate: (persisted) => {
        const state = persisted as Partial<SettingsState> | undefined;
        return {
          // Earlier installs followed the operating system, which could make the app
          // feel disconnected from the intentionally light public experience.
          theme: state?.theme === 'dark' ? 'dark' : 'light',
          defaultServings:
            typeof state?.defaultServings === 'number' && Number.isFinite(state.defaultServings)
              ? Math.max(1, state.defaultServings)
              : DEFAULT_SETTINGS.defaultServings,
        };
      },
    },
  ),
);
