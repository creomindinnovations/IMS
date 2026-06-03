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
  const [nameByUid, setNameByUid] = useState({});

  useEffect(() => {
    if (!profile?.uid) return;
    (async () => {
      const team = await getInternsByTeamLead(profile.uid);
      const map = {};
      team.forEach((u) => {
        map[u.uid] = u.name;
      });
      setNameByUid(map);
      const teamIds = new Set(team.map((t) => t.uid));
      const attendance = await getAllAttendance(todayKey());
      setRows(attendance.filter((a) => teamIds.has(a.uid)));
    })();
  }, [profile?.uid]);

  const columns = [
    {
      key: 'name',
      label: 'Intern',
      render: (r) => nameByUid[r.uid] || r.uid,
    },
    { key: 'checkIn', label: 'Check In', render: (r) => formatTime(r.checkIn) },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <PageWrapper title="Team Attendance">
      <DataTable columns={columns} rows={rows} emptyMessage="No attendance for your team today." />
    </PageWrapper>
  );
}
