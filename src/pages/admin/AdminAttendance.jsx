import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { getAllAttendance } from '../../services/attendanceService';
import { getAllUsers } from '../../services/userService';
import { formatTime, todayKey } from '../../utils/dateUtils';
import { ROLES } from '../../constants/roles';

function internLabel(row) {
  const name = row.internName?.trim();
  if (name) return name;
  return row.uid || '—';
}

function buildCsv(rows) {
  const header = 'Date,Intern Name,Email,UID,Status,Check In,Check Out,Duration (min)\n';
  const body = rows
    .map((r) => {
      const name = internLabel(r).replace(/,/g, ' ');
      const email = (r.internEmail || '').replace(/,/g, ' ');
      return [
        r.date,
        name,
        email,
        r.uid || '',
        r.status || '',
        formatTime(r.checkIn),
        formatTime(r.checkOut),
        r.durationMinutes ?? '',
      ].join(',');
    })
    .join('\n');
  return header + body;
}

export default function AdminAttendance() {
  const [date, setDate] = useState(todayKey());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllAttendance(date || undefined), getAllUsers(ROLES.INTERN)])
      .then(([attendance, interns]) => {
        const nameByUid = Object.fromEntries(
          interns.map((u) => [u.uid, { name: u.name, email: u.email }]),
        );
        setRows(
          attendance.map((r) => ({
            ...r,
            internName: r.internName || nameByUid[r.uid]?.name || '',
            internEmail: r.internEmail || nameByUid[r.uid]?.email || '',
          })),
        );
      })
      .finally(() => setLoading(false));
  }, [date]);

  const exportCsv = () => {
    const blob = new Blob([buildCsv(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${date || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'date', label: 'Date' },
    {
      key: 'internName',
      label: 'Intern',
      render: (r) => internLabel(r),
    },
    { key: 'checkIn', label: 'Check In', render: (r) => formatTime(r.checkIn) },
    { key: 'checkOut', label: 'Check Out', render: (r) => formatTime(r.checkOut) },
    {
      key: 'durationMinutes',
      label: 'Duration',
      render: (r) => (r.durationMinutes != null ? `${r.durationMinutes} min` : '—'),
    },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <PageWrapper title="Attendance">
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <Input label="Filter date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button variant="secondary" onClick={exportCsv} disabled={rows.length === 0}>
          Download CSV
        </Button>
      </div>
      {loading ? (
        <p className="text-slate-500">Loading attendance…</p>
      ) : (
        <DataTable columns={columns} rows={rows} rowKey="id" emptyMessage="No attendance records for this date." />
      )}
    </PageWrapper>
  );
}
