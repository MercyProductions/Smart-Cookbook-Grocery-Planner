import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from './navItems';
import { useNavBadgeCounts } from './useNavBadgeCounts';
import { ThemeToggle } from './ThemeToggle';

export function MobileTabBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const badgeCounts = useNavBadgeCounts();

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {moreOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="More navigation"
          className="animate-fade-up fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:hidden"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-text-muted">More</span>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              aria-label="Close menu"
              className="rounded-lg p-1 text-text-muted hover:bg-primary-soft"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {SECONDARY_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMoreOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                    isActive ? 'bg-primary-soft text-primary' : 'text-text hover:bg-primary-soft/60'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-border px-3 pt-3">
              <span className="text-sm text-text-muted">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const badge = item.badgeKey ? badgeCounts[item.badgeKey] : undefined;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                  isActive ? 'text-primary' : 'text-text-muted'
                }`
              }
            >
              <span className="relative">
                <item.icon size={20} />
                {Boolean(badge) && (
                  <span className="animate-scale-pop absolute -right-2 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-white">
                    {badge}
                  </span>
                )}
              </span>
              {item.label}
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-text-muted"
        >
          <Menu size={20} />
          More
        </button>
      </nav>
    </>
  );
}
