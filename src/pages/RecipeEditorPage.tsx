import { useParams } from 'react-router-dom';

export default function RecipeEditorPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{isEditing ? 'Edit Recipe' : 'Add Recipe'}</h1>
      <p className="mt-2 text-text-muted">The recipe editor form lands in Phase 5.</p>
    </div>
  );
}
