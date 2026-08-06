import {
  BookOpen,
  Heart,
  Home,
  Plus,
  PackageOpen,
  Settings,
  ShoppingBasket,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badgeKey?: 'mealPlan' | 'groceries';
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/recipes', label: 'Recipes', icon: BookOpen },
  { to: '/meal-plan', label: 'Meal Plan', icon: UtensilsCrossed, badgeKey: 'mealPlan' },
  { to: '/grocery-list', label: 'Groceries', icon: ShoppingBasket, badgeKey: 'groceries' },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { to: '/favorites', label: 'Favorites', icon: Heart },
  { to: '/pantry', label: 'Pantry', icon: PackageOpen },
  { to: '/recipes/new', label: 'Add Recipe', icon: Plus },
  { to: '/settings', label: 'Settings', icon: Settings },
];
