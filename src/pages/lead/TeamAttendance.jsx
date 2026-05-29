import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { getInternsByTeamLead } from '../../services/userService';
import { getAllAttendance } from '../../services/attendanceService';
import { formatTime, todayKey } from '../../utils/dateUtils';

export default function TeamAttendance() {
  const { profile } = useAuth();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!profile?.uid) return;
    (async () => {
      const team = await getInternsByTeamLead(profile.uid);
      const teamIds = new Set(team.map((t) => t.uid));
      const attendance = await getAllAttendance(todayKey());
      setRows(attendance.filter((a) => teamIds.has(a.uid)));
    })();
  }, [profile?.uid]);

  const columns = [
    { key: 'uid', label: 'Intern' },
    { key: 'checkIn', label: 'Check In', render: (r) => formatTime(r.checkIn) },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <PageWrapper title="Team Attendance">
      <DataTable columns={columns} rows={rows} emptyMessage="No attendance for your team today." />
    </PageWrapper>
  );
}
