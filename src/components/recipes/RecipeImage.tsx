import type { RecipeCategory, RecipeImage as RecipeImageType } from '@/types';

const CATEGORY_GRADIENTS: Record<RecipeCategory, string> = {
  breakfast: 'from-amber-200 to-amber-400 dark:from-amber-900 dark:to-amber-700',
  lunch: 'from-lime-200 to-lime-400 dark:from-lime-900 dark:to-lime-700',
  dinner: 'from-rose-200 to-rose-400 dark:from-rose-900 dark:to-rose-700',
  dessert: 'from-violet-200 to-violet-400 dark:from-violet-900 dark:to-violet-700',
  snack: 'from-cyan-200 to-cyan-400 dark:from-cyan-900 dark:to-cyan-700',
};

interface RecipeImageProps {
  image: RecipeImageType;
  category: RecipeCategory;
  className?: string;
}

export function RecipeImage({ image, category, className = '' }: RecipeImageProps) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${CATEGORY_GRADIENTS[category]} ${className}`}
    >
      <span className="text-5xl" role="img" aria-hidden="true">
        {image.emoji}
      </span>
    </div>
  );
}
