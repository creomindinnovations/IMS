const CAMEL_MAP = {
  team_lead_id: 'teamLeadId',
  is_active: 'isActive',
  start_date: 'startDate',
  end_date: 'endDate',
  created_at: 'createdAt',
  check_in: 'checkIn',
  check_out: 'checkOut',
  is_late: 'isLate',
  duration_minutes: 'durationMinutes',
  intern_name: 'internName',
  admin_note: 'adminNote',
  reviewed_at: 'reviewedAt',
  reviewed_by: 'reviewedBy',
  is_published: 'isPublished',
  uploaded_by: 'uploadedBy',
  completed_tutorials: 'completedTutorials',
  last_updated: 'lastUpdated',
  posted_by: 'postedBy',
  intern_uid: 'internUid',
  cert_id: 'certId',
  qr_data: 'qrData',
  pdf_url: 'pdfUrl',
  approved_by: 'approvedBy',
  approved_at: 'approvedAt',
  company_name: 'companyName',
  logo_url: 'logoUrl',
  late_hour: 'lateHour',
  late_minute: 'lateMinute',
};

const SNAKE_MAP = Object.fromEntries(
  Object.entries(CAMEL_MAP).map(([snake, camel]) => [camel, snake]),
);

export function rowToDoc(row, { idField = 'id', extraIdKey } = {}) {
  if (!row) return null;
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    const mapped = CAMEL_MAP[key] || key;
    out[mapped] = value;
  }
  if (idField && row[idField] != null) {
    out.id = row[idField];
    if (extraIdKey) out[extraIdKey] = row[idField];
    out.uid = row[idField];
  }
  return out;
}

export function docToRow(data, { omitId } = {}) {
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    if (omitId && (key === 'id' || key === 'uid')) continue;
    const mapped = SNAKE_MAP[key] || key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
    out[mapped] = value;
  }
  return out;
}

export function throwIfError(error, fallback = 'Database error') {
  if (error) throw new Error(error.message || fallback);
}
