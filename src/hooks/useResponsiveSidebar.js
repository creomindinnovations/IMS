import { useEffect } from 'react';
import { useUiStore } from '../store/uiStore';

export function useResponsiveSidebar() {
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setSidebarOpen(mq.matches);
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [setSidebarOpen]);
}

export function closeMobileSidebar() {
  if (window.innerWidth < 768) {
    useUiStore.getState().setSidebarOpen(false);
  }
}
