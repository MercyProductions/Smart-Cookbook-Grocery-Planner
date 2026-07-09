import { NavLink } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS, type NavItem } from './navItems';
import { useNavBadgeCounts } from './useNavBadgeCounts';
import { ThemeToggle } from './ThemeToggle';

export function Sidebar() {
  const badgeCounts = useNavBadgeCounts();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <ChefHat className="text-primary" size={24} />
        <span className="text-lg font-semibold tracking-tight">Cookbook</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            label={item.label}
            Icon={item.icon}
            end={item.end}
            badge={item.badgeKey ? badgeCounts[item.badgeKey] : undefined}
          />
        ))}
        <div className="my-3 border-t border-border" />
        {SECONDARY_NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} to={item.to} label={item.label} Icon={item.icon} end={item.end} />
        ))}
      </nav>

      <div className="flex items-center justify-between px-2 pt-4">
        <span className="text-xs text-text-muted">Theme</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}

function SidebarLink({
  to,
  label,
  Icon,
  end,
  badge,
}: {
  to: string;
  label: string;
  Icon: NavItem['icon'];
  end?: boolean;
  badge?: number;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary-soft text-primary'
            : 'text-text-muted hover:bg-primary-soft/60 hover:text-text'
        }`
      }
    >
      <Icon size={18} />
      <span className="flex-1">{label}</span>
      {Boolean(badge) && (
        <span className="animate-scale-pop inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
          {badge}
        </span>
      )}
    </NavLink>
  );
}
