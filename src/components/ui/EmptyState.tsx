import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateAction {
  label: string;
  to?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  body: string;
  action?: EmptyStateAction;
}

export function EmptyState({ icon: Icon, heading, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon size={26} />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">{heading}</h2>
      <p className="max-w-sm text-sm text-text-muted">{body}</p>
      {action &&
        (action.to ? (
          <Link
            to={action.to}
            className="mt-2 inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-xs font-medium text-white transition-all duration-200 hover:bg-primary-hover active:scale-[0.98]"
          >
            {action.label}
          </Link>
        ) : (
          <Button size="sm" className="mt-2" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
    </div>
  );
}
