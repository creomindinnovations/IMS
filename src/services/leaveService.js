import { requireSupabase } from './supabase';
import { rowToDoc, docToRow, throwIfError } from './dbUtils';

export async function applyLeave({ uid, internName, startDate, endDate, reason }) {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('leave_requests')
    .insert({
      uid,
      intern_name: internName || '',
      start_date: startDate,
      end_date: endDate,
      reason,
      status: 'pending',
    })
    .select('id')
    .single();
  throwIfError(error);
  return { id: data.id };
}

export async function getLeavesForUser(uid) {
  const sb = requireSupabase();
  const { data, error } = await sb.from('leave_requests').select('*').eq('uid', uid);
  throwIfError(error);
  return (data || [])
    .map((row) => rowToDoc(row))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export async function getAllLeaves(statusFilter) {
  const sb = requireSupabase();
  const { data, error } = await sb.from('leave_requests').select('*');
  throwIfError(error);
  let rows = (data || []).map((row) => rowToDoc(row));
  if (statusFilter) rows = rows.filter((r) => r.status === statusFilter);
  return rows.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export async function reviewLeave(id, { status, adminNote, reviewedBy }) {
  const sb = requireSupabase();
  const { error } = await sb
    .from('leave_requests')
    .update({
      status,
      admin_note: adminNote || '',
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);
  throwIfError(error);
}
