import { useState, type FormEvent } from 'react';
import type { GroceryCategory, Unit } from '@/types';
import { GROCERY_CATEGORY_LABELS } from '@/lib/labels';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const CATEGORIES = Object.keys(GROCERY_CATEGORY_LABELS) as GroceryCategory[];
const UNITS: Unit[] = [
  'unit',
  'tsp',
  'tbsp',
  'cup',
  'ml',
  'l',
  'oz',
  'lb',
  'g',
  'kg',
  'clove',
  'can',
  'slice',
  'bunch',
  'pinch',
];

interface AddCustomItemFormProps {
  onAdd: (item: { name: string; quantity?: number; unit?: Unit; category: GroceryCategory }) => void;
  onCancel: () => void;
}

export function AddCustomItemForm({ onAdd, onCancel }: AddCustomItemFormProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<Unit | ''>('');
  const [category, setCategory] = useState<GroceryCategory>('other');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      quantity: quantity ? Number(quantity) : undefined,
      unit: unit || undefined,
      category,
    });

    setName('');
    setQuantity('');
    setUnit('');
    setCategory('other');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-3"
    >
      <div className="min-w-[140px] flex-1">
        <label className="mb-1 block text-xs text-text-muted" htmlFor="custom-item-name">
          Item
        </label>
        <Input
          id="custom-item-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. paper towels"
          autoFocus
          className="w-full"
        />
      </div>
      <div className="w-20">
        <label className="mb-1 block text-xs text-text-muted" htmlFor="custom-item-qty">
          Qty
        </label>
        <Input
          id="custom-item-qty"
          type="number"
          min="0"
          step="any"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="w-full"
        />
      </div>
      <div className="w-28">
        <label className="mb-1 block text-xs text-text-muted" htmlFor="custom-item-unit">
          Unit
        </label>
        <Select
          id="custom-item-unit"
          value={unit}
          onChange={(event) => setUnit(event.target.value as Unit | '')}
          className="w-full"
        >
          <option value="">—</option>
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-36">
        <label className="mb-1 block text-xs text-text-muted" htmlFor="custom-item-category">
          Category
        </label>
        <Select
          id="custom-item-category"
          value={category}
          onChange={(event) => setCategory(event.target.value as GroceryCategory)}
          className="w-full"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {GROCERY_CATEGORY_LABELS[c]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Add
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
