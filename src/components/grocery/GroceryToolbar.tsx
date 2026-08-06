import { useState } from 'react';
import { MoreVertical, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface GroceryToolbarProps {
  total: number;
  completed: number;
  showAddForm: boolean;
  onToggleAddForm: () => void;
  onClearCompleted: () => void;
  onRestoreRemoved: () => void;
  onReset: () => void;
  hasRemoved: boolean;
}

export function GroceryToolbar({
  total,
  completed,
  showAddForm,
  onToggleAddForm,
  onClearCompleted,
  onRestoreRemoved,
  onReset,
  hasRemoved,
}: GroceryToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex-1">
        <p className="text-sm text-text-muted">
          {completed} of {total} done
        </p>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-primary-soft">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Button size="sm" onClick={onToggleAddForm}>
        {showAddForm ? <X size={14} /> : <Plus size={14} />}
        {showAddForm ? 'Close' : 'Add item'}
      </Button>

      <div className="relative">
        <button
          type="button"
          aria-label="More actions"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-text-muted hover:bg-primary-soft"
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
            <div className="animate-fade-up absolute right-0 top-11 z-20 w-52 rounded-lg border border-border bg-card p-1 shadow-lg">
              <MenuItem
                label="Clear completed"
                onClick={() => {
                  onClearCompleted();
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                label="Restore removed items"
                disabled={!hasRemoved}
                onClick={() => {
                  onRestoreRemoved();
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                label="Reset list"
                onClick={() => {
                  onReset();
                  setMenuOpen(false);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MenuItem({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-primary-soft disabled:pointer-events-none disabled:opacity-40"
    >
      {label}
    </button>
  );
}
