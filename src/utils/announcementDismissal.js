const STORAGE_KEY = 'ims_dismissed_announcements';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getDismissedAnnouncementIds(userId) {
  if (!userId) return [];
  return (readAll()[userId] || []).map(String);
}

export function dismissAnnouncement(userId, announcementId) {
  if (!userId || !announcementId) return;
  const all = readAll();
  const ids = new Set((all[userId] || []).map(String));
  ids.add(String(announcementId));
  all[userId] = [...ids];
  writeAll(all);
}
