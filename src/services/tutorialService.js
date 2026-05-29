import { requireSupabase } from './supabase';
import { rowToDoc, docToRow, throwIfError } from './dbUtils';

export async function getPublishedTutorials() {
  const sb = requireSupabase();
  const { data, error } = await sb.from('tutorials').select('*').eq('is_published', true);
  throwIfError(error);
  return (data || [])
    .map((row) => rowToDoc(row))
    .sort((a, b) => {
      const orderDiff = (a.order ?? 0) - (b.order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
}

export async function getAllTutorials() {
  const sb = requireSupabase();
  const { data, error } = await sb.from('tutorials').select('*').order('created_at', { ascending: false });
  throwIfError(error);
  return (data || []).map((row) => rowToDoc(row));
}

export async function createTutorial(data) {
  const sb = requireSupabase();
  const row = docToRow(data, { omitId: true });
  const { data: inserted, error } = await sb.from('tutorials').insert(row).select('id').single();
  throwIfError(error);
  return { id: inserted.id };
}

export async function updateTutorial(id, data) {
  const sb = requireSupabase();
  const row = docToRow(data, { omitId: true });
  const { error } = await sb.from('tutorials').update(row).eq('id', id);
  throwIfError(error);
}

export async function deleteTutorial(id) {
  const sb = requireSupabase();
  const { error } = await sb.from('tutorials').delete().eq('id', id);
  throwIfError(error);
}

export async function getProgress(uid) {
  const sb = requireSupabase();
  const { data, error } = await sb.from('progress').select('*').eq('uid', uid).maybeSingle();
  throwIfError(error);
  if (!data) return { uid, completedTutorials: [], lastUpdated: null };
  return rowToDoc(data);
}

export async function markTutorialComplete(uid, tutorialId) {
  const sb = requireSupabase();
  const current = await getProgress(uid);
  const completed = [...new Set([...(current.completedTutorials || []), tutorialId])];
  const { error } = await sb.from('progress').upsert({
    uid,
    completed_tutorials: completed,
    last_updated: new Date().toISOString(),
  });
  throwIfError(error);
}
