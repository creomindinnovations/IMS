import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../../services/announcementService';
import { useAuth } from '../../hooks/useAuth';
import { useUiStore } from '../../store/uiStore';

export default function Announcements() {
  const { user } = useAuth();
  const addToast = useUiStore((s) => s.addToast);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', scope: 'global' });

  const load = () => getAnnouncements().then(setList);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAnnouncement({ ...form, postedBy: user.uid });
    addToast('Announcement posted');
    setForm({ title: '', body: '', scope: 'global' });
    load();
  };

  return (
    <PageWrapper title="Announcements">
      <form onSubmit={handleSubmit} className="card mb-6 space-y-3">
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <label className="block text-sm">
          Body
          <textarea
            className="input-field mt-1 min-h-[100px]"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            required
          />
        </label>
        <label className="block text-sm">
          Scope
          <select className="input-field mt-1" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}>
            <option value="global">Global</option>
          </select>
        </label>
        <Button type="submit">Post</Button>
      </form>
      <ul className="space-y-2">
        {list.map((a) => (
          <li key={a.id} className="card flex justify-between">
            <div>
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-slate-600">{a.body}</p>
            </div>
            <Button variant="danger" onClick={() => deleteAnnouncement(a.id).then(load)}>Delete</Button>
          </li>
        ))}
      </ul>
    </PageWrapper>
  );
}
