import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { getAllLeaves, reviewLeave } from '../../services/leaveService';
import { useAuth } from '../../hooks/useAuth';
import { useUiStore } from '../../store/uiStore';
import { formatDate, parseInputDate } from '../../utils/dateUtils';

export default function AdminLeaves() {
  const { user } = useAuth();
  const addToast = useUiStore((s) => s.addToast);
  const [filter, setFilter] = useState('pending');
  const [rows, setRows] = useState([]);
  const [notes, setNotes] = useState({});

  const load = () => getAllLeaves(filter === 'all' ? null : filter).then(setRows);

  useEffect(() => {
    load();
  }, [filter]);

  const handleReview = async (id, status) => {
    try {
      await reviewLeave(id, {
        status,
        adminNote: notes[id] || '',
        reviewedBy: user.uid,
      });
      addToast(`Leave ${status}`);
      setNotes((prev) => ({ ...prev, [id]: '' }));
      load();
    } catch (err) {
      addToast(err.message || 'Failed to update leave', 'error');
    }
  };

  return (
    <PageWrapper title="Leave Requests">
      <div className="mb-4 flex flex-wrap gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`filter-chip capitalize ${filter === f ? 'filter-chip-active' : ''}`}
          >
            {f}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-slate-500">No leave requests in this category.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="glass-pop">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-primary">{r.internName || r.uid}</p>
                  <p className="text-sm text-slate-500">
                    {formatDate(parseInputDate(r.startDate))} – {formatDate(parseInputDate(r.endDate))}
                  </p>
                </div>
                <Badge status={r.status} />
              </div>
              <p className="mt-2 text-sm text-slate-600">{r.reason}</p>

              {r.status === 'pending' && (
                <div className="mt-4 space-y-3">
                  <label className="block text-sm">
                    Admin note (optional)
                    <input
                      className="input-field mt-1 w-full"
                      value={notes[r.id] || ''}
                      onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                      placeholder="Note to intern"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleReview(r.id, 'approved')}>Approve</Button>
                    <Button variant="danger" onClick={() => handleReview(r.id, 'rejected')}>
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {r.adminNote && r.status !== 'pending' && (
                <p className="mt-2 text-sm text-slate-500">Note: {r.adminNote}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </PageWrapper>
  );
}
