const styles = {
  present: 'bg-green-100 text-success',
  late: 'bg-amber-100 text-warning',
  absent: 'bg-red-100 text-error',
  pending: 'bg-amber-100 text-warning',
  approved: 'bg-green-100 text-success',
  rejected: 'bg-red-100 text-error',
  revoked: 'bg-slate-100 text-slate-600',
};

export default function Badge({ status, children }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] || 'bg-slate-100 text-slate-600'}`}
    >
      {children || status}
    </span>
  );
}
