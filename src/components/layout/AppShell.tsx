import { Outlet, useLocation } from 'react-router-dom';
import { useThemeSync } from '@/lib/theme';
import { useStoresHydrated } from '@/stores/useStoresHydrated';
import { ToastHost } from '@/components/ui/ToastHost';
import { Sidebar } from './Sidebar';
import { MobileTopBar } from './MobileTopBar';
import { MobileTabBar } from './MobileTabBar';

export function AppShell() {
  useThemeSync();
  const hydrated = useStoresHydrated();
  const location = useLocation();

  if (!hydrated) {
    return <div className="min-h-screen bg-surface text-text" />;
  }

  return (
    <div className="min-h-screen bg-surface text-text">
      <Sidebar />
      <MobileTopBar />

      <main className="pb-20 lg:ml-60 lg:w-[calc(100%_-_15rem)] lg:pb-0">
        <div key={location.pathname} className="animate-fade-up mx-auto max-w-[1200px] px-4 py-6 md:px-8">
          <Outlet />
        </div>
      </main>

      <MobileTabBar />
      <ToastHost />
    </div>
  );
}
