export default function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`glass-static max-h-[90vh] w-full overflow-y-auto p-5 sm:rounded-card ${
          wide ? 'max-w-3xl' : 'max-w-xl'
        } rounded-b-none`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-btn p-2 text-muted hover:bg-white/40"
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
