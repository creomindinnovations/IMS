import { requireSupabase } from './supabase';
import { rowToDoc, docToRow, throwIfError } from './dbUtils';

export async function getAnnouncements() {
  const sb = requireSupabase();
  const { data, error } = await sb.from('announcements').select('*').order('created_at', { ascending: false });
  throwIfError(error);
  return (data || []).map((row) => rowToDoc(row));
}

export async function createAnnouncement(data) {
  const sb = requireSupabase();
  const row = docToRow(data, { omitId: true });
  const { data: inserted, error } = await sb.from('announcements').insert(row).select('id').single();
  throwIfError(error);
  return { id: inserted.id };
}

export async function updateAnnouncement(id, data) {
  const sb = requireSupabase();
  const row = docToRow(data, { omitId: true });
  const { error } = await sb.from('announcements').update(row).eq('id', id);
  throwIfError(error);
}

export async function deleteAnnouncement(id) {
  const sb = requireSupabase();
  const { error } = await sb.from('announcements').delete().eq('id', id);
  throwIfError(error);
}

export function filterAnnouncementsForUser(announcements, user) {
  return announcements.filter((a) => {
    if (a.scope === 'global') return true;
    if (a.scope?.startsWith('team:') && user?.teamLeadId) {
      return a.scope === `team:${user.teamLeadId}`;
    }
    if (user?.role === 'teamlead' && a.scope === `team:${user.uid}`) return true;
    return false;
  });
}
