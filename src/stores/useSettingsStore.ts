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
  theme: 'system' as ThemePreference,
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
      version: 1,
      partialize: (state) => ({
        theme: state.theme,
        defaultServings: state.defaultServings,
      }),
      migrate: (persisted) => {
        const state = persisted as Partial<SettingsState> | undefined;
        return {
          theme:
            state?.theme === 'light' || state?.theme === 'dark' || state?.theme === 'system'
              ? state.theme
              : DEFAULT_SETTINGS.theme,
          defaultServings:
            typeof state?.defaultServings === 'number' && Number.isFinite(state.defaultServings)
              ? Math.max(1, state.defaultServings)
              : DEFAULT_SETTINGS.defaultServings,
        };
      },
    },
  ),
);
