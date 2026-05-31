import { requireSupabase, supabaseAdminCreate } from './supabase';
import { rowToDoc, docToRow, throwIfError } from './dbUtils';
import { ROLES } from '../constants/roles';

/** Postgres rejects "" for numeric/uuid columns — normalize before insert/update */
function buildUserRow(email, profile) {
  let stipend = null;
  const rawStipend = profile.stipend;
  if (rawStipend !== '' && rawStipend != null && rawStipend !== undefined) {
    const n = Number(rawStipend);
    if (Number.isFinite(n)) stipend = n;
  }

  const teamLeadId =
    profile.teamLeadId && String(profile.teamLeadId).trim()
      ? String(profile.teamLeadId).trim()
      : null;

  const toDateOnly = (value) => {
    if (!value) return null;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  };

  return {
    email,
    name: profile.name || '',
    role: profile.role || ROLES.INTERN,
    department: profile.department || '',
    is_active: profile.isActive !== false,
    team_lead_id: teamLeadId,
    start_date: toDateOnly(profile.startDate),
    end_date: toDateOnly(profile.endDate),
    stipend,
  };
}

export async function getUser(uid) {
  const sb = requireSupabase();
  const { data, error } = await sb.from('users').select('*').eq('id', uid).maybeSingle();
  throwIfError(error);
  return data ? rowToDoc(data) : null;
}

export async function getAllUsers(roleFilter) {
  const sb = requireSupabase();
  let q = sb.from('users').select('*');
  if (roleFilter) q = q.eq('role', roleFilter);
  const { data, error } = await q;
  throwIfError(error);
  return (data || []).map((row) => rowToDoc(row));
}

export async function getInternsByTeamLead(teamLeadId) {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('users')
    .select('*')
    .eq('role', ROLES.INTERN)
    .eq('team_lead_id', teamLeadId);
  throwIfError(error);
  return (data || []).map((row) => rowToDoc(row));
}

export async function createUserAccount({ email, password, ...profile }) {
  if (!supabaseAdminCreate) {
    throw new Error('Supabase is not configured.');
  }

  const userRow = buildUserRow(email, profile);

  const { data: authData, error: authError } = await supabaseAdminCreate.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: userRow.name,
        role: userRow.role,
        department: userRow.department,
      },
    },
  });
  if (authError) throw authError;
  const uid = authData.user?.id;
  if (!uid) throw new Error('User creation failed.');

  const sb = requireSupabase();
  const { error } = await sb.from('users').upsert({
    id: uid,
    ...userRow,
  });
  throwIfError(error);

  return {
    uid,
    email,
    name: userRow.name,
    role: userRow.role,
    department: userRow.department,
    isActive: userRow.is_active,
    teamLeadId: userRow.team_lead_id,
    startDate: userRow.start_date,
    endDate: userRow.end_date,
    stipend: userRow.stipend,
  };
}

export async function updateUser(uid, data) {
  const sb = requireSupabase();
  const { password, ...rest } = data;
  const row = docToRow(rest, { omitId: true });
  if (row.stipend === '') row.stipend = null;
  if (row.team_lead_id === '') row.team_lead_id = null;
  if (row.start_date === '') row.start_date = null;
  if (row.end_date === '') row.end_date = null;
  const { error } = await sb.from('users').update(row).eq('id', uid);
  throwIfError(error);
}

export async function deactivateUser(uid) {
  await updateUser(uid, { isActive: false });
}

export async function reactivateUser(uid) {
  await updateUser(uid, { isActive: true });
}

export async function deleteUser(uid) {
  const sb = requireSupabase();
  const { error } = await sb.from('users').delete().eq('id', uid);
  throwIfError(error);
}
