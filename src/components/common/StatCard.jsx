export default function StatCard({ icon, label, value, sub }) {
  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <span className="text-2xl" aria-hidden>
          {icon}
        </span>
        {sub && <span className="text-xs text-slate-500">{sub}</span>}
      </div>
      <p className="font-mono text-2xl font-semibold text-primary">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}
