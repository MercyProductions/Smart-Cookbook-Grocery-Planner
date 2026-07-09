import type { DietaryTag } from '@/types';
import { TAG_LABELS } from '@/lib/labels';

interface TagPillProps {
  tag: DietaryTag;
  active?: boolean;
  onClick?: () => void;
}

export function TagPill({ tag, active = false, onClick }: TagPillProps) {
  const label = TAG_LABELS[tag];

  if (!onClick) {
    return (
      <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? 'border-primary bg-primary-soft text-primary'
          : 'border-border bg-card text-text-muted hover:bg-primary-soft/60'
      }`}
    >
      {label}
    </button>
  );
}
