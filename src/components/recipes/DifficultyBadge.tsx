import type { Difficulty } from '@/types';
import { DIFFICULTY_DOT_CLASSES, DIFFICULTY_LABELS } from '@/lib/labels';

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
      <span className={`h-2 w-2 rounded-full ${DIFFICULTY_DOT_CLASSES[difficulty]}`} />
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  );
}
