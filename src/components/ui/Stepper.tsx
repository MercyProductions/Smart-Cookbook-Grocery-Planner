import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export function Stepper({ value, onChange, min = 1, max = 99, step = 1, label }: StepperProps) {
  return (
    <div className="inline-flex items-center gap-3" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label="Decrease"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text transition-colors hover:bg-primary-soft disabled:pointer-events-none disabled:opacity-40"
      >
        <Minus size={14} />
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        aria-label="Increase"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text transition-colors hover:bg-primary-soft disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
