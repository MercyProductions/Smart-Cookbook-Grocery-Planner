import { Link, NavLink } from 'react-router-dom';
import { BookOpenText, Plus } from 'lucide-react';
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS, type NavItem } from './navItems';
import { useNavBadgeCounts } from './useNavBadgeCounts';
import { ThemeToggle } from './ThemeToggle';

export function Sidebar() {
  const badgeCounts = useNavBadgeCounts();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
      <Link to="/" className="mb-9 flex items-center gap-2 px-2 text-text">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-[0_5px_14px_rgba(189,41,36,0.18)]">
          <BookOpenText size={18} />
        </span>
        <span className="font-display text-[23px] leading-none">Cookbook.</span>
      </Link>

      <Link
        to="/recipes/new"
        className="mb-6 flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(189,41,36,0.18)] transition-colors hover:bg-primary-hover"
      >
        <Plus size={16} />
        Add a recipe
      </Link>

      <p className="mb-2 px-3 text-[11px] font-semibold uppercase text-text-muted">Kitchen</p>
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
        <div className="my-5 border-t border-border" />
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase text-text-muted">Organize</p>
        {SECONDARY_NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} to={item.to} label={item.label} Icon={item.icon} end={item.end} />
        ))}
      </nav>

      <div className="flex items-center justify-between border-t border-border px-2 pt-5">
        <span className="text-xs font-medium text-text-muted">Appearance</span>
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
          isActive ? 'bg-primary-soft text-primary' : 'text-text-muted hover:bg-surface hover:text-text'
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
