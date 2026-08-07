import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Allergy, CookingExperience, DietaryTag } from '@/types';

interface AccountState {
  displayName: string;
  householdSize: number;
  cookingExperience: CookingExperience;
  dietaryPreferences: DietaryTag[];
  allergies: Allergy[];
  hideAllergenMatches: boolean;
  setDisplayName: (displayName: string) => void;
  setHouseholdSize: (householdSize: number) => void;
  setCookingExperience: (cookingExperience: CookingExperience) => void;
  toggleDietaryPreference: (tag: DietaryTag) => void;
  toggleAllergy: (allergy: Allergy) => void;
  setHideAllergenMatches: (hideAllergenMatches: boolean) => void;
  reset: () => void;
}

const DEFAULT_ACCOUNT = {
  displayName: '',
  householdSize: 2,
  cookingExperience: 'beginner' as CookingExperience,
  dietaryPreferences: [] as DietaryTag[],
  allergies: [] as Allergy[],
  hideAllergenMatches: true,
};

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      ...DEFAULT_ACCOUNT,
      setDisplayName: (displayName) => set({ displayName: displayName.slice(0, 40) }),
      setHouseholdSize: (householdSize) => set({ householdSize: Math.max(1, Math.min(20, householdSize)) }),
      setCookingExperience: (cookingExperience) => set({ cookingExperience }),
      toggleDietaryPreference: (tag) =>
        set((state) => ({
          dietaryPreferences: state.dietaryPreferences.includes(tag)
            ? state.dietaryPreferences.filter((item) => item !== tag)
            : [...state.dietaryPreferences, tag],
        })),
      toggleAllergy: (allergy) =>
        set((state) => ({
          allergies: state.allergies.includes(allergy)
            ? state.allergies.filter((item) => item !== allergy)
            : [...state.allergies, allergy],
        })),
      setHideAllergenMatches: (hideAllergenMatches) => set({ hideAllergenMatches }),
      reset: () => set(DEFAULT_ACCOUNT),
    }),
    {
      name: 'cookbook.account.v1',
      version: 1,
      partialize: (state) => ({
        displayName: state.displayName,
        householdSize: state.householdSize,
        cookingExperience: state.cookingExperience,
        dietaryPreferences: state.dietaryPreferences,
        allergies: state.allergies,
        hideAllergenMatches: state.hideAllergenMatches,
      }),
      migrate: (persisted) => ({ ...DEFAULT_ACCOUNT, ...(persisted as Partial<AccountState>) }),
    },
  ),
);
