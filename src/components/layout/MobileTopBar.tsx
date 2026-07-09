import { ChefHat } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2">
        <ChefHat className="text-primary" size={20} />
        <span className="font-semibold tracking-tight">Cookbook</span>
      </div>
      <ThemeToggle />
    </header>
  );
}
