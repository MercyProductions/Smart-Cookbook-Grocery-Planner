import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import type { GroceryCategory } from '@/types';
import { INGREDIENT_VOCABULARY } from '@/data/vocabulary';
import { GROCERY_CATEGORY_LABELS } from '@/lib/labels';
import { usePantryStore } from '@/stores/usePantryStore';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const STARTERS = ['salt', 'black pepper', 'olive oil', 'all-purpose flour', 'granulated sugar', 'butter', 'garlic powder'];
const CATEGORIES = Object.keys(GROCERY_CATEGORY_LABELS) as GroceryCategory[];

export default function PantryPage() {
  const items = usePantryStore((state) => state.items);
  const addItem = usePantryStore((state) => state.addItem);
  const removeItem = usePantryStore((state) => state.removeItem);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GroceryCategory>('pantry');

  function add(nameToAdd: string, categoryToAdd = category) {
    if (!nameToAdd.trim()) return;
    addItem({ name: nameToAdd, category: categoryToAdd });
    setName('');
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    add(name);
  }

  const pantryNames = new Set(items.map((item) => item.name));

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pantry</h1>
          <p className="mt-1 max-w-2xl text-sm text-text-muted">Keep staples here, then exclude them from your generated grocery list whenever they are already at home.</p>
        </div>
        <Link to="/grocery-list" className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-3 text-sm font-medium text-text hover:bg-primary-soft">Back to groceries</Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-2 border-y border-border py-4 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
        <Input list="pantry-ingredients" value={name} onChange={(event) => setName(event.target.value)} placeholder="Add an ingredient you already have" aria-label="Pantry ingredient" />
        <Select value={category} onChange={(event) => setCategory(event.target.value as GroceryCategory)} aria-label="Pantry grocery category">
          {CATEGORIES.map((value) => <option key={value} value={value}>{GROCERY_CATEGORY_LABELS[value]}</option>)}
        </Select>
        <Button type="submit"><Plus size={16} />Add</Button>
      </form>
      <datalist id="pantry-ingredients">
        {INGREDIENT_VOCABULARY.map((ingredient) => <option key={ingredient.name} value={ingredient.name} />)}
      </datalist>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Plus} heading="Start with the staples" body="A short pantry list makes shopping faster without turning pantry management into a project." />
        </div>
      ) : (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Already have ({items.length})</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {items.map((item) => (
              <span key={item.name} className="inline-flex items-center gap-1 rounded-full border border-border bg-card py-1 pl-3 pr-1 text-sm">
                {item.name}
                <button type="button" aria-label={`Remove ${item.name} from pantry`} onClick={() => removeItem(item.name)} className="flex h-6 w-6 items-center justify-center rounded-full text-text-muted hover:bg-primary-soft hover:text-red-600"><X size={13} /></button>
              </span>
            ))}
          </div>
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Common staples</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {STARTERS.filter((item) => !pantryNames.has(item)).map((item) => (
            <button type="button" key={item} onClick={() => add(item, item.includes('salt') || item.includes('pepper') || item.includes('powder') ? 'spices' : 'pantry')} className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-3 text-xs font-medium text-text-muted hover:bg-primary-soft hover:text-primary"><Plus size={13} />{item}</button>
          ))}
        </div>
      </section>
    </div>
  );
}
