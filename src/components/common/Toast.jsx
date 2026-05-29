import { useUiStore } from '../../store/uiStore';

export default function ToastContainer() {
  const { toasts, removeToast } = useUiStore();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex min-w-[240px] items-center justify-between rounded-card border px-4 py-3 shadow-lg ${
            t.type === 'error'
              ? 'border-red-200 bg-red-50 text-error'
              : 'border-green-200 bg-green-50 text-success'
          }`}
        >
          <span className="text-sm">{t.message}</span>
          <button
            type="button"
            className="ml-3 text-slate-400 hover:text-slate-600"
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
