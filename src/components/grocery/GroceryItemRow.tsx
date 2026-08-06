import { useState } from 'react';
import { Pencil, Save, Trash2, X } from 'lucide-react';
import type { GroceryLine, Unit } from '@/types';
import { formatQuantity } from '@/lib/units';
import { UNIT_LABELS } from '@/lib/labels';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface GroceryItemRowProps {
  line: GroceryLine;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (patch: { quantity?: number; unit?: Unit; note?: string }) => void;
}

const EDITABLE_UNITS = Object.keys(UNIT_LABELS).filter((unit) => unit !== 'to-taste') as Unit[];

export function GroceryItemRow({ line, onToggle, onRemove, onUpdate }: GroceryItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [quantity, setQuantity] = useState(line.quantity === undefined ? '' : String(line.quantity));
  const [unit, setUnit] = useState<Unit | ''>(line.unit ?? '');
  const [note, setNote] = useState(line.note ?? '');
  const quantityLabel = formatLineQuantity(line);
  const sources = !line.isCustom ? line.sources : [];

  function openEditor() {
    setQuantity(line.quantity === undefined ? '' : String(line.quantity));
    setUnit(line.unit ?? '');
    setNote(line.note ?? '');
    setEditing(true);
  }

  function saveEditor() {
    const parsed = quantity.trim() === '' ? undefined : Number(quantity);
    if (parsed !== undefined && (!Number.isFinite(parsed) || parsed < 0)) return;
    onUpdate({
      quantity: parsed ?? (line.isCustom ? undefined : line.quantity),
      unit: unit || undefined,
      note: note.trim() || undefined,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary-soft/30 p-2">
        <p className="text-sm font-medium">{line.name}</p>
        <div className="mt-2 grid grid-cols-[84px_minmax(0,1fr)_auto] gap-2">
          <Input aria-label={`Quantity for ${line.name}`} type="number" min="0" step="any" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          <Select aria-label={`Unit for ${line.name}`} value={unit} onChange={(event) => setUnit(event.target.value as Unit | '')}>
            <option value="">No unit</option>
            {EDITABLE_UNITS.map((value) => <option key={value} value={value}>{UNIT_LABELS[value].singular || 'count'}</option>)}
          </Select>
          <button type="button" aria-label={`Save ${line.name}`} onClick={saveEditor} className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-hover"><Save size={15} /></button>
        </div>
        <div className="mt-2 flex gap-2">
          <Input aria-label={`Note for ${line.name}`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note" />
          <button type="button" aria-label={`Cancel editing ${line.name}`} onClick={() => setEditing(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-card"><X size={15} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-lg px-2 py-2 transition-colors hover:bg-primary-soft/40">
      <div className="flex items-center gap-3">
        <label className="flex flex-1 cursor-pointer items-center gap-3">
        <input type="checkbox" checked={line.checked} onChange={onToggle} className="h-5 w-5 shrink-0 rounded border-border text-primary" />
        <span className={`min-w-0 flex-1 text-sm transition-colors duration-200 ${line.checked ? 'text-text-muted line-through' : 'text-text'}`}>
          {line.unit === 'to-taste' ? (
            <>{line.name} <span className="text-text-muted">- to taste</span></>
          ) : (
            <>{quantityLabel && <><span className="mr-1.5 font-medium tabular-nums">{quantityLabel}</span>{' '}</>}{line.name}</>
          )}
          {line.note && <span className="ml-1 text-xs text-text-muted">({line.note})</span>}
        </span>
        </label>
        <button type="button" aria-label={`Edit ${line.name}`} onClick={openEditor} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted opacity-100 transition-opacity hover:bg-card hover:text-primary lg:opacity-0 lg:group-hover:opacity-100"><Pencil size={14} /></button>
        <button type="button" aria-label={`Remove ${line.name}`} onClick={onRemove} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted opacity-100 transition-opacity hover:bg-card hover:text-red-600 lg:opacity-0 lg:group-hover:opacity-100"><Trash2 size={14} /></button>
      </div>
      {sources.length > 0 && (
        <details className="ml-8 mt-1 max-w-xs text-xs text-text-muted">
          <summary className="cursor-pointer text-text-muted">Used in {sources.length} {sources.length === 1 ? 'recipe' : 'recipes'}</summary>
          <ul className="mt-2 space-y-1">
            {sources.map((source, index) => <li key={`${source.recipeTitle}-${index}`}>{formatSource(source.quantity, source.unit)}: {source.recipeTitle}</li>)}
          </ul>
        </details>
      )}
    </div>
  );
}

function formatSource(quantity: number, unit: Unit): string {
  if (unit === 'to-taste') return 'To taste';
  const labels = UNIT_LABELS[unit];
  const unitLabel = quantity > 1 ? labels.plural : labels.singular;
  return unitLabel ? `${formatQuantity(quantity)} ${unitLabel}` : formatQuantity(quantity);
}

function formatLineQuantity(line: GroceryLine): string {
  if (line.unit === 'to-taste' || line.quantity === undefined) return '';
  if (!line.unit) return formatQuantity(line.quantity);
  const unitLabel = UNIT_LABELS[line.unit];
  const label = line.quantity > 1 ? unitLabel.plural : unitLabel.singular;
  return label ? `${formatQuantity(line.quantity)} ${label}` : formatQuantity(line.quantity);
}
