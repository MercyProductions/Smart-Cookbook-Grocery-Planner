import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="text-5xl">🍽️</span>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-text-muted">We couldn't find what you're looking for.</p>
      <Link
        to="/kitchen"
        className="mt-2 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        Back to kitchen
      </Link>
    </div>
  );
}
