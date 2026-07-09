import type { NutritionInfo } from '@/types';
import { Card } from '@/components/ui/Card';

const TILES: Array<{ key: keyof NutritionInfo; label: string; suffix: string }> = [
  { key: 'calories', label: 'Calories', suffix: '' },
  { key: 'proteinG', label: 'Protein', suffix: 'g' },
  { key: 'carbsG', label: 'Carbs', suffix: 'g' },
  { key: 'fatG', label: 'Fat', suffix: 'g' },
];

export function NutritionCard({ nutrition }: { nutrition?: NutritionInfo }) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold tracking-tight">Nutrition (per serving)</h3>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {TILES.map((tile) => {
          const value = nutrition?.[tile.key];
          return (
            <div key={tile.key} className="rounded-lg bg-surface px-2 py-3 text-center">
              <div className="text-base font-semibold tabular-nums text-text">
                {value !== undefined ? `${value}${tile.suffix}` : '—'}
              </div>
              <div className="mt-0.5 text-[11px] text-text-muted">{tile.label}</div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-text-muted">Nutrition estimates coming soon.</p>
    </Card>
  );
}
