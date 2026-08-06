import type { RecipeCategory, RecipeImage as RecipeImageType } from '@/types';
import breakfastImage from '@/assets/recipe-breakfast.png';
import lunchImage from '@/assets/recipe-lunch.png';
import dinnerImage from '@/assets/recipe-dinner.png';
import dessertImage from '@/assets/recipe-dessert.png';

const CATEGORY_IMAGES: Record<RecipeCategory, string> = {
  breakfast: breakfastImage,
  lunch: lunchImage,
  dinner: dinnerImage,
  dessert: dessertImage,
  snack: lunchImage,
};

interface RecipeImageProps {
  image: RecipeImageType;
  category: RecipeCategory;
  className?: string;
}

export function RecipeImage({ image, category, className = '' }: RecipeImageProps) {
  return (
    <div className={`relative overflow-hidden bg-surface ${className}`}>
      <img
        src={CATEGORY_IMAGES[category]}
        alt=""
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
      />
      <span
        className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-md bg-card/90 text-lg shadow-sm"
        role="img"
        aria-label={`${category} recipe`}
      >
        {image.emoji}
      </span>
    </div>
  );
}
