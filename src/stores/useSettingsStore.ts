import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: ThemePreference;
  defaultServings: number;
  setTheme: (theme: ThemePreference) => void;
  setDefaultServings: (servings: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      defaultServings: 4,
      setTheme: (theme) => set({ theme }),
      setDefaultServings: (defaultServings) => set({ defaultServings }),
    }),
    { name: 'cookbook.settings.v1' },
  ),
);
