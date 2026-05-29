export default function EmptyState({ title, description, action }) {
  return (
    <div className="card flex flex-col items-center py-12 text-center">
      <span className="mb-4 text-4xl opacity-40" aria-hidden>
        📭
      </span>
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-slate-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
