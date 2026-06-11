export default function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`card max-h-[90vh] w-full overflow-y-auto rounded-b-none sm:rounded-card ${
          wide ? 'max-w-3xl' : 'max-w-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-btn p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
