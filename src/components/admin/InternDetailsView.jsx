import Button from '../common/Button';
import { formatDate } from '../../utils/dateUtils';
import { ROLE_LABELS } from '../../constants/roles';

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-2 text-sm last:border-0 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 sm:text-right">{value || '—'}</span>
    </div>
  );
}

export default function InternDetailsView({ intern, teamLeadName, loginCredentials, onCopyCredentials }) {
  if (!intern) return null;

  return (
    <div className="space-y-4">
      {loginCredentials && (
        <div className="rounded-btn border border-accent/30 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-primary">Login credentials (share with intern)</h3>
          <p className="mt-1 text-xs text-slate-600">
            The intern signs in at the login page with this email and password.
          </p>
          <dl className="mt-3 space-y-2 font-mono text-sm">
            <div>
              <dt className="text-xs text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{loginCredentials.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Password</dt>
              <dd className="font-medium text-slate-900">{loginCredentials.password}</dd>
            </div>
          </dl>
          {onCopyCredentials && (
            <Button type="button" variant="secondary" className="mt-3 w-full" onClick={onCopyCredentials}>
              Copy credentials
            </Button>
          )}
        </div>
      )}

      <div className="rounded-btn border border-border p-3">
        <h3 className="mb-2 text-sm font-semibold text-primary">Intern details</h3>
        <DetailRow label="Name" value={intern.name} />
        <DetailRow label="Email" value={intern.email} />
        <DetailRow label="Department" value={intern.department} />
        <DetailRow label="Role" value={ROLE_LABELS[intern.role] || intern.role} />
        <DetailRow label="Team lead" value={teamLeadName} />
        <DetailRow
          label="Internship"
          value={`${formatDate(intern.startDate)} – ${formatDate(intern.endDate)}`}
        />
        <DetailRow label="Stipend" value={intern.stipend} />
        <DetailRow label="Status" value={intern.isActive === false ? 'Inactive' : 'Active'} />
      </div>
    </div>
  );
}
