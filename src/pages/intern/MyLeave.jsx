import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { applyLeave, getLeavesForUser } from '../../services/leaveService';
import { useUiStore } from '../../store/uiStore';
import { formatDate, parseInputDate } from '../../utils/dateUtils';

export default function MyLeave() {
  const { profile } = useAuth();
  const addToast = useUiStore((s) => s.addToast);
  const [requests, setRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });

  const load = () => {
    if (!profile?.uid) return;
    getLeavesForUser(profile.uid).then(setRequests);
  };

  useEffect(() => {
    load();
  }, [profile?.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile?.uid) return;

    if (form.endDate < form.startDate) {
      addToast('End date must be on or after start date', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await applyLeave({
        uid: profile.uid,
        internName: profile.name,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim(),
      });
      addToast('Leave request submitted');
      setForm({ startDate: '', endDate: '', reason: '' });
      load();
    } catch (err) {
      addToast(err.message || 'Failed to submit leave request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper title="Apply Leave">
      <form onSubmit={handleSubmit} className="card mb-6 grid gap-3 md:grid-cols-2">
        <Input
          label="Start date"
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          required
        />
        <Input
          label="End date"
          type="date"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          required
        />
        <label className="md:col-span-2 block text-sm">
          Reason
          <textarea
            className="input-field mt-1 min-h-[100px] w-full"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Brief reason for leave"
            required
          />
        </label>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Request'}
        </Button>
      </form>

      <h3 className="mb-3 font-semibold text-primary">My leave requests</h3>
      {requests.length === 0 ? (
        <p className="text-slate-500">No leave requests yet.</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li key={r.id} className="glass-pop">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">
                  {formatDate(parseInputDate(r.startDate))} – {formatDate(parseInputDate(r.endDate))}
                </span>
                <Badge status={r.status} />
              </div>
              <p className="mt-2 text-sm text-slate-600">{r.reason}</p>
              {r.adminNote && (
                <p className="mt-2 text-sm text-slate-500">
                  Admin note: {r.adminNote}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </PageWrapper>
  );
}
