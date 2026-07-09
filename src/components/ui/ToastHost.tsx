import { useToastStore } from '@/stores/useToastStore';

export function ToastHost() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 lg:bottom-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-fade-up pointer-events-auto rounded-lg bg-text px-4 py-2 text-sm font-medium text-surface shadow-lg"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
