import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomGroceryItem } from '@/types';
import { newId } from '@/lib/id';

interface GroceryState {
  checkedKeys: string[];
  removedKeys: string[];
  customItems: CustomGroceryItem[];
  toggleChecked: (key: string) => void;
  removeGeneratedItem: (key: string) => void;
  restoreRemoved: () => void;
  addCustomItem: (item: Omit<CustomGroceryItem, 'key' | 'isCustom'>) => void;
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

      toggleChecked: (key) =>
        set((state) => ({
          checkedKeys: state.checkedKeys.includes(key)
            ? state.checkedKeys.filter((k) => k !== key)
            : [...state.checkedKeys, key],
        })),

      removeGeneratedItem: (key) =>
        set((state) => ({
          removedKeys: [...state.removedKeys, key],
          checkedKeys: state.checkedKeys.filter((k) => k !== key),
        })),

      restoreRemoved: () => set({ removedKeys: [] }),

      addCustomItem: (item) =>
        set((state) => ({
          customItems: [...state.customItems, { ...item, key: `custom-${newId()}`, isCustom: true }],
        })),

      removeCustomItem: (key) =>
        set((state) => ({
          customItems: state.customItems.filter((item) => item.key !== key),
          checkedKeys: state.checkedKeys.filter((k) => k !== key),
        })),

      clearCompleted: () =>
        set((state) => {
          const customKeys = new Set(state.customItems.map((item) => item.key));
          const checkedGeneratedKeys = state.checkedKeys.filter((key) => !customKeys.has(key));
          return {
            customItems: state.customItems.filter((item) => !state.checkedKeys.includes(item.key)),
            removedKeys: Array.from(new Set([...state.removedKeys, ...checkedGeneratedKeys])),
            checkedKeys: [],
          };
        }),

      reset: () => set({ checkedKeys: [], removedKeys: [], customItems: [] }),
    }),
    {
      name: 'cookbook.grocery.v1',
      version: 1,
      partialize: (state) => ({
        checkedKeys: state.checkedKeys,
        removedKeys: state.removedKeys,
        customItems: state.customItems,
      }),
      migrate: (persisted) => {
        const state = persisted as Partial<GroceryState> | undefined;
        return {
          checkedKeys: Array.isArray(state?.checkedKeys) ? state.checkedKeys.filter(Boolean) : [],
          removedKeys: Array.isArray(state?.removedKeys) ? state.removedKeys.filter(Boolean) : [],
          customItems: Array.isArray(state?.customItems) ? state.customItems : [],
        };
      },
    },
  ),
);
