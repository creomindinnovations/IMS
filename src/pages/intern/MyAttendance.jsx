import { useEffect, useState, useCallback } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import CheckInButton from '../../components/attendance/CheckInButton';
import { useAuth } from '../../hooks/useAuth';
import { getAttendanceForUser, getTodayAttendance } from '../../services/attendanceService';
import { formatTime } from '../../utils/dateUtils';

export default function MyAttendance() {
  const { profile } = useAuth();
  const [rows, setRows] = useState([]);
  const [today, setToday] = useState(null);

  const load = useCallback(async () => {
    if (!profile?.uid) return;
    const [records, todayRecord] = await Promise.all([
      getAttendanceForUser(profile.uid),
      getTodayAttendance(profile.uid),
    ]);
    setRows(records);
    setToday(todayRecord);
  }, [profile?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'checkIn', label: 'Check In', render: (r) => formatTime(r.checkIn) },
    { key: 'checkOut', label: 'Check Out', render: (r) => formatTime(r.checkOut) },
    {
      key: 'durationMinutes',
      label: 'Duration',
      render: (r) => (r.durationMinutes != null ? `${r.durationMinutes} min` : '—'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge status={r.status} />,
    },
  ];

  return (
    <PageWrapper title="My Attendance">
      <div className="mb-6">
        <CheckInButton uid={profile?.uid} todayRecord={today} onUpdate={load} />
      </div>
      <DataTable columns={columns} rows={rows} emptyMessage="No attendance records yet." />
    </PageWrapper>
  );
}
