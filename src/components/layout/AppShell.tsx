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
    <div className="min-h-screen bg-[#f7f7f4] text-text">
      <Sidebar />
      <MobileTopBar />

      <main className="pb-20 lg:ml-64 lg:w-[calc(100%_-_16rem)] lg:pb-0">
        <div key={location.pathname} className="animate-fade-up mx-auto max-w-[1440px] px-4 py-5 md:px-8 md:py-8 xl:px-10">
          <Outlet />
        </div>
      </main>

      <MobileTabBar />
      <ToastHost />
    </div>
  );
}
