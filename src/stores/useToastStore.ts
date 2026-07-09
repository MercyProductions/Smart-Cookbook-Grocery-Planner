import { create } from 'zustand';

interface ToastItem {
  id: string;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  showToast: (message: string) => void;
  dismissToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (message) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { id, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
    }, 2500);
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
