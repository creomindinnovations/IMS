export default function Input({ label, error, className = '', ...props }) {
  return (
    <label className="block space-y-1">
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      <input className={`input-field ${error ? 'border-error' : ''} ${className}`} {...props} />
      {error && <span className="text-xs text-error">{error}</span>}
    </label>
  );
}
