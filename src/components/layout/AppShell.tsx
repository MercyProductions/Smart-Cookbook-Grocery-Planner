import { Outlet, useLocation } from 'react-router-dom';
import { useThemeSync } from '@/lib/theme';
import { Sidebar } from './Sidebar';
import { MobileTopBar } from './MobileTopBar';
import { MobileTabBar } from './MobileTabBar';

export function AppShell() {
  useThemeSync();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface text-text">
      <Sidebar />
      <MobileTopBar />

      <main className="pb-20 lg:ml-60 lg:pb-0">
        <div key={location.pathname} className="animate-fade-up mx-auto max-w-[1200px] px-4 py-6 md:px-8">
          <Outlet />
        </div>
      </main>

      <MobileTabBar />
    </div>
  );
}
