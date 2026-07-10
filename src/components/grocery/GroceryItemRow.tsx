import { Trash2 } from 'lucide-react';
import type { GroceryLine } from '@/types';
import { formatQuantity } from '@/lib/units';
import { UNIT_LABELS } from '@/lib/labels';

interface GroceryItemRowProps {
  line: GroceryLine;
  onToggle: () => void;
  onRemove: () => void;
}

export function GroceryItemRow({ line, onToggle, onRemove }: GroceryItemRowProps) {
  const quantityLabel = formatLineQuantity(line);
  const sourceRecipes = !line.isCustom ? line.sourceRecipes : [];

  return (
    <div className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-primary-soft/40">
      <label className="flex flex-1 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={line.checked}
          onChange={onToggle}
          className="h-5 w-5 shrink-0 rounded border-border text-primary"
        />
        <span
          className={`flex-1 text-sm transition-colors duration-200 ${
            line.checked ? 'text-text-muted line-through' : 'text-text'
          }`}
        >
          {line.unit === 'to-taste' ? (
            <>
              {line.name} <span className="text-text-muted">— to taste</span>
            </>
          ) : (
            <>
              {quantityLabel && (
                <>
                  <span className="mr-1.5 font-medium tabular-nums">{quantityLabel}</span>{' '}
                </>
              )}
              {line.name}
            </>
          )}
          {sourceRecipes.length > 0 && (
            <>
              {' '}
              <span className="ml-2 text-xs text-text-muted">({sourceRecipes.join(', ')})</span>
            </>
          )}
        </span>
      </label>
      <button
        type="button"
        aria-label={`Remove ${line.name}`}
        onClick={onRemove}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-muted opacity-100 transition-opacity hover:bg-card hover:text-red-600 lg:opacity-0 lg:group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function formatLineQuantity(line: GroceryLine): string {
  if (line.unit === 'to-taste' || line.quantity === undefined) return '';
  if (!line.unit) return formatQuantity(line.quantity);

  const unitLabel = UNIT_LABELS[line.unit];
  const label = line.quantity > 1 ? unitLabel.plural : unitLabel.singular;
  return label ? `${formatQuantity(line.quantity)} ${label}` : formatQuantity(line.quantity);
}
