import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import DashboardPage from '@/pages/DashboardPage';
import RecipeLibraryPage from '@/pages/RecipeLibraryPage';
import RecipeDetailPage from '@/pages/RecipeDetailPage';
import RecipeEditorPage from '@/pages/RecipeEditorPage';
import MealPlanPage from '@/pages/MealPlanPage';
import GroceryListPage from '@/pages/GroceryListPage';
import PantryPage from '@/pages/PantryPage';
import CookingModePage from '@/pages/CookingModePage';
import FavoritesPage from '@/pages/FavoritesPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/recipes" element={<RecipeLibraryPage />} />
        <Route path="/recipes/new" element={<RecipeEditorPage />} />
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        <Route path="/recipes/:id/cook" element={<CookingModePage />} />
        <Route path="/recipes/:id/edit" element={<RecipeEditorPage />} />
        <Route path="/meal-plan" element={<MealPlanPage />} />
        <Route path="/grocery-list" element={<GroceryListPage />} />
        <Route path="/pantry" element={<PantryPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
