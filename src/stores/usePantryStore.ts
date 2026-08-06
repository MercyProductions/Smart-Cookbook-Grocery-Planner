import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PantryItem } from '@/types';
import { normalizeIngredientName } from '@/lib/ingredients';

interface PantryState {
  items: PantryItem[];
  addItem: (item: PantryItem) => void;
  removeItem: (name: string) => void;
  reset: () => void;
}

function cleanPantryItems(value: unknown): PantryItem[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((item) => {
    if (!item || typeof item.name !== 'string') return [];
    const name = normalizeIngredientName(item.name);
    if (!name || seen.has(name)) return [];
    seen.add(name);
    return [{ name, ...(typeof item.category === 'string' ? { category: item.category } : {}) }];
  });
}

export const usePantryStore = create<PantryState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const name = normalizeIngredientName(item.name);
          if (!name || state.items.some((existing) => normalizeIngredientName(existing.name) === name)) return state;
          return { items: [...state.items, { ...item, name }].sort((a, b) => a.name.localeCompare(b.name)) };
        }),
      removeItem: (name) =>
        set((state) => ({ items: state.items.filter((item) => normalizeIngredientName(item.name) !== name) })),
      reset: () => set({ items: [] }),
    }),
    {
      name: 'cookbook.pantry.v1',
      version: 1,
      partialize: (state) => ({ items: state.items }),
      migrate: (persisted) => ({ items: cleanPantryItems((persisted as Partial<PantryState> | undefined)?.items) }),
    },
  ),
);
