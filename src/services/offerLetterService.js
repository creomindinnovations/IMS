import { requireSupabase } from './supabase';
import { rowToDoc, throwIfError } from './dbUtils';

export function generateOfferLetterId() {
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `OL-2025-${num}`;
}

function offerLetterFromRow(row) {
  const doc = rowToDoc(row);
  return {
    firestoreId: row.id,
    id: row.letter_id,
    ...doc,
  };
}

export async function createOfferLetter(data) {
  const letterId = data.id || generateOfferLetterId();
  const sb = requireSupabase();
  const { data: inserted, error } = await sb
    .from('offer_letters')
    .insert({
      letter_id: letterId,
      intern_uid: data.internUid,
      intern_name: data.internName,
      role: data.role,
      department: data.department,
      start_date: data.startDate,
      end_date: data.endDate,
      stipend: data.stipend,
      pdf_url: data.pdfUrl,
      generated_by: data.generatedBy,
    })
    .select('id')
    .single();
  throwIfError(error);
  return { firestoreId: inserted.id, id: letterId };
}

export async function getOfferLettersForIntern(internUid) {
  const sb = requireSupabase();
  const { data, error } = await sb.from('offer_letters').select('*').eq('intern_uid', internUid);
  throwIfError(error);
  return (data || []).map(offerLetterFromRow);
}

export async function getAllOfferLetters() {
  const sb = requireSupabase();
  const { data, error } = await sb.from('offer_letters').select('*');
  throwIfError(error);
  return (data || []).map(offerLetterFromRow);
}
