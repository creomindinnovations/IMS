import { requireSupabase } from './supabase';
import { rowToDoc, throwIfError } from './dbUtils';
import { todayKey, calcDurationMinutes, isLateCheckIn } from '../utils/dateUtils';

export function attendanceDocId(uid, date = todayKey()) {
  return `${uid}_${date}`;
}

export async function getTodayAttendance(uid) {
  const id = attendanceDocId(uid);
  const sb = requireSupabase();
  const { data, error } = await sb.from('attendance').select('*').eq('id', id).maybeSingle();
  throwIfError(error);
  return data ? rowToDoc(data) : null;
}

export async function checkIn(uid) {
  const date = todayKey();
  const id = attendanceDocId(uid, date);
  const existing = await getTodayAttendance(uid);
  if (existing) throw new Error('Already checked in today.');

  const lateHour = Number(import.meta.env.VITE_LATE_CHECKIN_HOUR ?? 10);
  const lateMinute = Number(import.meta.env.VITE_LATE_CHECKIN_MINUTE ?? 0);
  const now = new Date();
  const late = isLateCheckIn(now, lateHour, lateMinute);

  const sb = requireSupabase();
  const { error } = await sb.from('attendance').insert({
    id,
    uid,
    date,
    check_in: now.toISOString(),
    status: late ? 'late' : 'present',
    is_late: late,
  });
  throwIfError(error);
  return id;
}

export async function checkOut(uid) {
  const id = attendanceDocId(uid);
  const sb = requireSupabase();
  const { data: row, error: fetchError } = await sb.from('attendance').select('*').eq('id', id).maybeSingle();
  throwIfError(fetchError);
  if (!row) throw new Error('No check-in found for today.');
  if (row.check_out) throw new Error('Already checked out.');

  const durationMinutes = calcDurationMinutes(row.check_in, new Date());
  const { error } = await sb
    .from('attendance')
    .update({ check_out: new Date().toISOString(), duration_minutes: durationMinutes })
    .eq('id', id);
  throwIfError(error);
}

export async function getAttendanceForUser(uid) {
  const sb = requireSupabase();
  const { data, error } = await sb.from('attendance').select('*').eq('uid', uid);
  throwIfError(error);
  return (data || [])
    .map((row) => rowToDoc(row))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export async function getAllAttendance(dateFilter) {
  const sb = requireSupabase();
  let q = sb.from('attendance').select('*').order('date', { ascending: false });
  if (dateFilter) q = q.eq('date', dateFilter);
  const { data, error } = await q;
  throwIfError(error);
  return (data || []).map((row) => rowToDoc(row));
}

export function calcAttendancePercentage(records, workingDays = 22) {
  const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  return workingDays ? Math.round((present / workingDays) * 100) : 0;
}
