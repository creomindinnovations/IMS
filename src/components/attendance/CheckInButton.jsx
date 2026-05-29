import { useEffect, useState } from 'react';
import Button from '../common/Button';
import { checkIn, checkOut } from '../../services/attendanceService';
import { useUiStore } from '../../store/uiStore';
import { formatTime } from '../../utils/dateUtils';
import Badge from '../common/Badge';

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="font-mono text-2xl font-semibold text-primary tabular-nums">
      {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </p>
  );
}

export default function CheckInButton({ uid, todayRecord, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const addToast = useUiStore((s) => s.addToast);

  const hasCheckIn = Boolean(todayRecord?.checkIn);
  const hasCheckOut = Boolean(todayRecord?.checkOut);

  const handleCheckIn = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      await checkIn(uid);
      addToast('Checked in successfully');
      onUpdate?.();
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      await checkOut(uid);
      addToast('Checked out successfully');
      onUpdate?.();
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-primary">Attendance Clock</h3>
          <p className="mt-1 text-sm text-slate-500">Check in when you start work, check out when you finish.</p>
        </div>
        <LiveClock />
      </div>

      {hasCheckIn && (
        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500">Status:</span>
            <Badge status={todayRecord.status} />
          </div>
          <p className="mt-2 font-mono text-slate-700">
            Check-in: {formatTime(todayRecord.checkIn)}
            {hasCheckOut && (
              <>
                {' · '}Check-out: {formatTime(todayRecord.checkOut)}
                {todayRecord.durationMinutes != null &&
                  ` · ${todayRecord.durationMinutes} min worked`}
              </>
            )}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleCheckIn}
          disabled={loading || hasCheckIn}
          aria-label="Check in"
          className="min-w-[120px]"
        >
          {loading && !hasCheckIn ? '…' : 'Check In'}
        </Button>
        <Button
          variant="secondary"
          onClick={handleCheckOut}
          disabled={loading || !hasCheckIn || hasCheckOut}
          aria-label="Check out"
          className="min-w-[120px]"
        >
          {loading && hasCheckIn && !hasCheckOut ? '…' : 'Check Out'}
        </Button>
      </div>

      {hasCheckOut && (
        <p className="text-sm text-success">You have completed today&apos;s attendance.</p>
      )}
    </div>
  );
}
