import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomGroceryItem, GroceryItemOverride } from '@/types';
import { newId } from '@/lib/id';

interface GroceryState {
  checkedKeys: string[];
  removedKeys: string[];
  customItems: CustomGroceryItem[];
  itemOverrides: Record<string, GroceryItemOverride>;
  excludePantry: boolean;
  toggleChecked: (key: string) => void;
  removeGeneratedItem: (key: string) => void;
  restoreRemoved: () => void;
  addCustomItem: (item: Omit<CustomGroceryItem, 'key' | 'isCustom'>) => void;
  updateGeneratedItem: (key: string, patch: GroceryItemOverride) => void;
  updateCustomItem: (key: string, patch: Partial<Omit<CustomGroceryItem, 'key' | 'isCustom'>>) => void;
  setExcludePantry: (exclude: boolean) => void;
  removeCustomItem: (key: string) => void;
  clearCompleted: () => void;
  reset: () => void;
}

export const useGroceryStore = create<GroceryState>()(
  persist(
    (set) => ({
      checkedKeys: [],
      removedKeys: [],
      customItems: [],
      itemOverrides: {},
      excludePantry: false,

      toggleChecked: (key) =>
        set((state) => ({
          checkedKeys: state.checkedKeys.includes(key)
            ? state.checkedKeys.filter((item) => item !== key)
            : [...state.checkedKeys, key],
        })),

      removeGeneratedItem: (key) =>
        set((state) => {
          const { [key]: _, ...itemOverrides } = state.itemOverrides;
          return {
            removedKeys: Array.from(new Set([...state.removedKeys, key])),
            checkedKeys: state.checkedKeys.filter((item) => item !== key),
            itemOverrides,
          };
        }),

      restoreRemoved: () => set({ removedKeys: [] }),

      addCustomItem: (item) =>
        set((state) => ({
          customItems: [...state.customItems, { ...item, key: `custom-${newId()}`, isCustom: true }],
        })),

      updateGeneratedItem: (key, patch) =>
        set((state) => ({
          itemOverrides: { ...state.itemOverrides, [key]: { ...state.itemOverrides[key], ...patch } },
        })),

      updateCustomItem: (key, patch) =>
        set((state) => ({
          customItems: state.customItems.map((item) => (item.key === key ? { ...item, ...patch } : item)),
        })),

      setExcludePantry: (excludePantry) => set({ excludePantry }),

      removeCustomItem: (key) =>
        set((state) => ({
          customItems: state.customItems.filter((item) => item.key !== key),
          checkedKeys: state.checkedKeys.filter((item) => item !== key),
        })),

      clearCompleted: () =>
        set((state) => {
          const customKeys = new Set(state.customItems.map((item) => item.key));
          const checkedGeneratedKeys = state.checkedKeys.filter((key) => !customKeys.has(key));
          const itemOverrides = Object.fromEntries(
            Object.entries(state.itemOverrides).filter(([key]) => !checkedGeneratedKeys.includes(key)),
          );
          return {
            customItems: state.customItems.filter((item) => !state.checkedKeys.includes(item.key)),
            removedKeys: Array.from(new Set([...state.removedKeys, ...checkedGeneratedKeys])),
            checkedKeys: [],
            itemOverrides,
          };
        }),

      reset: () => set({ checkedKeys: [], removedKeys: [], customItems: [], itemOverrides: {} }),
    }),
    {
      name: 'cookbook.grocery.v1',
      version: 2,
      partialize: (state) => ({
        checkedKeys: state.checkedKeys,
        removedKeys: state.removedKeys,
        customItems: state.customItems,
        itemOverrides: state.itemOverrides,
        excludePantry: state.excludePantry,
      }),
      migrate: (persisted) => {
        const state = persisted as Partial<GroceryState> | undefined;
        return {
          checkedKeys: Array.isArray(state?.checkedKeys) ? state.checkedKeys.filter(Boolean) : [],
          removedKeys: Array.isArray(state?.removedKeys) ? state.removedKeys.filter(Boolean) : [],
          customItems: Array.isArray(state?.customItems) ? state.customItems : [],
          itemOverrides: state?.itemOverrides && typeof state.itemOverrides === 'object' ? state.itemOverrides : {},
          excludePantry: Boolean(state?.excludePantry),
        };
      },
    },
  ),
);
