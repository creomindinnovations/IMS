import { create } from 'zustand';

function getInitialSidebarOpen() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(min-width: 768px)').matches;
}

export const useUiStore = create((set) => ({
  sidebarOpen: getInitialSidebarOpen(),
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  addToast: (message, type = 'success') => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
