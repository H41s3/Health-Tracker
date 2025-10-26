import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: ToastItem[];
  show: (message: string, type?: ToastType) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    set({ toasts: [...get().toasts, { id, message, type }] });
    // auto-remove after 3s
    setTimeout(() => get().remove(id), 3000);
  },
  remove: (id: string) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));


