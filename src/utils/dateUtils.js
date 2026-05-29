export const formatDate = (value) => {
  if (!value) return '—';
  const d = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (value) => {
  if (!value) return '—';
  const d = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const todayKey = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};

export const calcDurationMinutes = (checkIn, checkOut) => {
  const start = checkIn?.toDate ? checkIn.toDate() : new Date(checkIn);
  const end = checkOut?.toDate ? checkOut.toDate() : new Date(checkOut);
  return Math.max(0, Math.round((end - start) / 60000));
};

export const isLateCheckIn = (checkIn, hour = 10, minute = 0) => {
  const d = checkIn?.toDate ? checkIn.toDate() : new Date(checkIn);
  const threshold = new Date(d);
  threshold.setHours(hour, minute, 0, 0);
  return d > threshold;
};

export const toInputDate = (value) => {
  if (!value) return '';
  const d = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

export const parseInputDate = (str) => {
  if (!str) return null;
  return new Date(`${str}T00:00:00`);
};
