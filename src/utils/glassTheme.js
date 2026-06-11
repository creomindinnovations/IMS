const STORAGE_KEY = 'ims-glass-opacity';
const DEFAULT_OPACITY = 0.35;

export function initGlassTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const opacity = saved ? parseFloat(saved) : DEFAULT_OPACITY;
  const value = Number.isFinite(opacity) ? opacity : DEFAULT_OPACITY;
  document.documentElement.style.setProperty('--glass-opacity', String(value));
  return value;
}

export function setGlassOpacity(value) {
  const opacity = parseFloat(value);
  document.documentElement.style.setProperty('--glass-opacity', String(opacity));
  localStorage.setItem(STORAGE_KEY, String(opacity));
  return opacity;
}

export function getGlassOpacity() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--glass-opacity');
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : DEFAULT_OPACITY;
}
