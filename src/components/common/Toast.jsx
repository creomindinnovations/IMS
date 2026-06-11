import { useUiStore } from '../../store/uiStore';

export default function ToastContainer() {
  const { toasts, removeToast } = useUiStore();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-20 left-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`glass-static flex items-center justify-between gap-3 px-4 py-3 ${
            t.type === 'error' ? '!border-error/30 text-error' : '!border-success/30 text-success'
          }`}
        >
          <span className="min-w-0 flex-1 text-sm">{t.message}</span>
          <button
            type="button"
            className="shrink-0 text-muted hover:text-[var(--text-primary)]"
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
