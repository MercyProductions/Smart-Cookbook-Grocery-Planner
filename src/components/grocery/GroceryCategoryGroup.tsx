import type { GroceryCategory, GroceryLine } from '@/types';
import { GROCERY_CATEGORY_LABELS } from '@/lib/labels';
import { GroceryItemRow } from './GroceryItemRow';

interface GroceryCategoryGroupProps {
  category: GroceryCategory;
  lines: GroceryLine[];
  onToggle: (key: string) => void;
  onRemove: (line: GroceryLine) => void;
}

export function GroceryCategoryGroup({ category, lines, onToggle, onRemove }: GroceryCategoryGroupProps) {
  const unchecked = lines.filter((line) => !line.checked);
  const checked = lines.filter((line) => line.checked);

  return (
    <section>
      <h2 className="mb-1.5 text-sm font-semibold tracking-tight text-text-muted">
        {GROCERY_CATEGORY_LABELS[category]}
      </h2>
      <div className="space-y-0.5">
        {unchecked.map((line) => (
          <GroceryItemRow
            key={line.key}
            line={line}
            onToggle={() => onToggle(line.key)}
            onRemove={() => onRemove(line)}
          />
        ))}
      </div>
      {checked.length > 0 && (
        <div className="mt-1 space-y-0.5 border-t border-border pt-1">
          <p className="px-2 py-1 text-xs text-text-muted">Completed ({checked.length})</p>
          {checked.map((line) => (
            <GroceryItemRow
              key={line.key}
              line={line}
              onToggle={() => onToggle(line.key)}
              onRemove={() => onRemove(line)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
