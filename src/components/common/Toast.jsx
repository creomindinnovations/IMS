import { useUiStore } from '../../store/uiStore';

export default function ToastContainer() {
  const { toasts, removeToast } = useUiStore();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] flex flex-col gap-2 sm:left-auto sm:right-4 sm:max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center justify-between gap-3 rounded-card border px-4 py-3 shadow-lg ${
            t.type === 'error'
              ? 'border-red-200 bg-red-50 text-error'
              : 'border-green-200 bg-green-50 text-success'
          }`}
        >
          <span className="min-w-0 flex-1 text-sm">{t.message}</span>
          <button
            type="button"
            className="shrink-0 text-slate-400 hover:text-slate-600"
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
