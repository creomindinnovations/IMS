import { requireSupabase } from './supabase';

export function normalizeUser(supabaseUser) {
  if (!supabaseUser) return null;
  return {
    uid: supabaseUser.id,
    id: supabaseUser.id,
    email: supabaseUser.email,
  };
}

export async function login(email, password) {
  const sb = requireSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { user: normalizeUser(data.user) };
}

export async function logout() {
  const sb = requireSupabase();
  await sb.auth.signOut();
}

export async function resetPassword(email) {
  const sb = requireSupabase();
  const redirectTo = `${window.location.origin}/login`;
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function changePassword(newPassword) {
  const sb = requireSupabase();
  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
