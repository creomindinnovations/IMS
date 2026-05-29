import { useEffect, useState, useRef } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { getSettings, saveSettings } from '../../services/settingsService';
import { uploadFile } from '../../services/storageService';
import { useUiStore } from '../../store/uiStore';

export default function SystemSettings() {
  const addToast = useUiStore((s) => s.addToast);
  const fileRef = useRef();
  const [form, setForm] = useState({
    companyName: '',
    address: '',
    logoUrl: '',
    lateHour: 10,
    lateMinute: 0,
  });

  useEffect(() => {
    getSettings().then(setForm);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    let logoUrl = form.logoUrl;
    if (fileRef.current?.files?.[0]) {
      logoUrl = await uploadFile(`branding/logo-${Date.now()}.png`, fileRef.current.files[0]);
    }
    await saveSettings({ ...form, logoUrl });
    addToast('Settings saved');
  };

  return (
    <PageWrapper title="System Settings">
      <form onSubmit={handleSave} className="card max-w-lg space-y-4">
        <Input label="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <Input label="Late check-in hour" type="number" value={form.lateHour} onChange={(e) => setForm({ ...form, lateHour: Number(e.target.value) })} />
        <Input label="Late check-in minute" type="number" value={form.lateMinute} onChange={(e) => setForm({ ...form, lateMinute: Number(e.target.value) })} />
        <label className="block text-sm">
          Company logo
          <input ref={fileRef} type="file" accept="image/*" className="mt-1 block w-full" />
        </label>
        {form.logoUrl && <img src={form.logoUrl} alt="Logo" className="h-12" />}
        <Button type="submit">Save</Button>
      </form>
    </PageWrapper>
  );
}
