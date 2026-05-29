import { requireSupabase } from './supabase';
import { rowToDoc, docToRow, throwIfError } from './dbUtils';
import { getVerifyUrl } from '../utils/qrUtils';

export function generateCertId(internUid) {
  const suffix = internUid.slice(0, 6).toUpperCase();
  return `CERT-2025-${suffix}`;
}

export async function createCertificate(data) {
  const certId = data.certId || generateCertId(data.internUid);
  const qrData = getVerifyUrl(certId);
  const sb = requireSupabase();
  const row = docToRow({ ...data, certId, qrData, status: 'pending' }, { omitId: true });
  const { data: inserted, error } = await sb.from('certificates').insert(row).select('id').single();
  throwIfError(error);
  return { id: inserted.id, certId };
}

export async function approveCertificate(id, adminUid) {
  const sb = requireSupabase();
  const { error } = await sb
    .from('certificates')
    .update({
      status: 'approved',
      approved_by: adminUid,
      approved_at: new Date().toISOString(),
    })
    .eq('id', id);
  throwIfError(error);
}

export async function updateCertificatePdf(id, pdfUrl) {
  const sb = requireSupabase();
  const { error } = await sb.from('certificates').update({ pdf_url: pdfUrl }).eq('id', id);
  throwIfError(error);
}

export async function getCertificatesForIntern(internUid) {
  const sb = requireSupabase();
  const { data, error } = await sb.from('certificates').select('*').eq('intern_uid', internUid);
  throwIfError(error);
  return (data || []).map((row) => rowToDoc(row));
}

export async function getAllCertificates() {
  const sb = requireSupabase();
  const { data, error } = await sb.from('certificates').select('*');
  throwIfError(error);
  return (data || []).map((row) => rowToDoc(row));
}

export async function getCertificateByCertId(certId) {
  const sb = requireSupabase();
  const { data, error } = await sb.from('certificates').select('*').eq('cert_id', certId).maybeSingle();
  throwIfError(error);
  return data ? rowToDoc(data) : null;
}
