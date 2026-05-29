import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { getInternsByTeamLead } from '../../services/userService';
import { getAllAttendance } from '../../services/attendanceService';
import { todayKey } from '../../utils/dateUtils';

export default function LeadDashboard() {
  const { profile } = useAuth();
  const [teamSize, setTeamSize] = useState(0);
  const [present, setPresent] = useState(0);

  useEffect(() => {
    if (!profile?.uid) return;
    (async () => {
      const team = await getInternsByTeamLead(profile.uid);
      setTeamSize(team.length);
      const attendance = await getAllAttendance(todayKey());
      const teamIds = new Set(team.map((t) => t.uid));
      setPresent(attendance.filter((a) => teamIds.has(a.uid)).length);
    })();
  }, [profile?.uid]);

  return (
    <PageWrapper title="Team Lead Dashboard">
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard icon="👥" label="Team members" value={teamSize} />
        <StatCard icon="✅" label="Present today" value={present} />
      </div>
    </PageWrapper>
  );
}
