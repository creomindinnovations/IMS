import { requireSupabase } from './supabase';

const BUCKET = 'ims';

export async function uploadFile(path, file, metadata = {}) {
  const sb = requireSupabase();
  const contentType = metadata.contentType || file.type || undefined;
  const { error } = await sb.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType,
  });
  if (error) throw error;

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
