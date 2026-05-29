import { useEffect, useState, useCallback } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import StatCard from '../../components/common/StatCard';
import CheckInButton from '../../components/attendance/CheckInButton';
import { useAuth } from '../../hooks/useAuth';
import {
  getTodayAttendance,
  getAttendanceForUser,
  calcAttendancePercentage,
} from '../../services/attendanceService';
import { getPublishedTutorials, getProgress } from '../../services/tutorialService';
import { getAnnouncements, filterAnnouncementsForUser } from '../../services/announcementService';
import { formatDate } from '../../utils/dateUtils';
import Skeleton from '../../components/common/Skeleton';
import { useUiStore } from '../../store/uiStore';

export default function InternDashboard() {
  const { profile } = useAuth();
  const addToast = useUiStore((s) => s.addToast);
  const [today, setToday] = useState(null);
  const [pct, setPct] = useState(0);
  const [tutorialStats, setTutorialStats] = useState({ total: 0, done: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!profile?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [todayRecord, records, tutorials, progress, allAnn] = await Promise.all([
        getTodayAttendance(profile.uid),
        getAttendanceForUser(profile.uid),
        getPublishedTutorials(),
        getProgress(profile.uid),
        getAnnouncements(),
      ]);

      setToday(todayRecord);
      setPct(calcAttendancePercentage(records));
      const done = progress.completedTutorials?.length || 0;
      setTutorialStats({ total: tutorials.length, done });
      setAnnouncements(filterAnnouncementsForUser(allAnn, profile).slice(0, 5));
    } catch (err) {
      console.error(err);
      setError('Could not load dashboard. Please refresh the page.');
      addToast('Dashboard failed to load', 'error');
    } finally {
      setLoading(false);
    }
  }, [profile?.uid, addToast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <PageWrapper title="Dashboard">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Dashboard">
        <div className="card text-center">
          <p className="text-error">{error}</p>
          <button type="button" onClick={load} className="mt-4 text-accent hover:underline">
            Retry
          </button>
        </div>
      </PageWrapper>
    );
  }

  const progressPct =
    tutorialStats.total > 0
      ? Math.round((tutorialStats.done / tutorialStats.total) * 100)
      : 0;

  return (
    <PageWrapper title="Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon="📅" label="Attendance %" value={`${pct}%`} />
        <StatCard
          icon="📚"
          label="Tutorials completed"
          value={`${tutorialStats.done}/${tutorialStats.total}`}
          sub={`${progressPct}%`}
        />
        <StatCard icon="👤" label="Department" value={profile?.department || '—'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CheckInButton uid={profile?.uid} todayRecord={today} onUpdate={load} />
        <div className="card">
          <h3 className="font-semibold text-primary">Profile</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Name</dt>
              <dd>{profile?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Duration</dt>
              <dd>
                {formatDate(profile?.startDate)} – {formatDate(profile?.endDate)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="font-semibold text-primary">Announcements</h3>
        {announcements.length === 0 ? (
          <p className="mt-4 text-slate-500">No announcements yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {announcements.map((a) => (
              <li key={a.id} className="py-3">
                <p className="font-medium">{a.title}</p>
                <p className="mt-1 text-slate-600">{a.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageWrapper>
  );
}
