import { BookOpenText } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white"><BookOpenText size={15} /></span>
        <span className="font-display text-xl">Cookbook.</span>
      </div>
      <ThemeToggle />
    </header>
  );
}
