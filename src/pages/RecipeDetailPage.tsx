import { useParams } from 'react-router-dom';

export default function RecipeDetailPage() {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Recipe Detail</h1>
      <p className="mt-2 text-text-muted">Full detail view for "{id}" lands in Phase 2.</p>
    </div>
  );
}
