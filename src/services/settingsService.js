import { requireSupabase } from './supabase';
import { throwIfError } from './dbUtils';

const SETTINGS_KEY = 'branding';

export async function getSettings() {
  const sb = requireSupabase();
  const { data, error } = await sb.from('settings').select('*').eq('key', SETTINGS_KEY).maybeSingle();
  throwIfError(error);
  if (!data) {
    return {
      companyName: import.meta.env.VITE_COMPANY_NAME || 'Your Startup',
      logoUrl: '',
      address: '',
      lateHour: 10,
      lateMinute: 0,
    };
  }
  return {
    companyName: data.company_name,
    logoUrl: data.logo_url || '',
    address: data.address || '',
    lateHour: data.late_hour ?? 10,
    lateMinute: data.late_minute ?? 0,
  };
}

export async function saveSettings(data) {
  const sb = requireSupabase();
  const { error } = await sb.from('settings').upsert({
    key: SETTINGS_KEY,
    company_name: data.companyName,
    logo_url: data.logoUrl,
    address: data.address,
    late_hour: data.lateHour,
    late_minute: data.lateMinute,
  });
  throwIfError(error);
}
