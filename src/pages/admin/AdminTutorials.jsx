import { useEffect, useState, useRef } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { TUTORIAL_CATEGORIES } from '../../constants/categories';
import { getAllTutorials, createTutorial, deleteTutorial } from '../../services/tutorialService';
import { uploadFile } from '../../services/storageService';
import { useAuth } from '../../hooks/useAuth';
import { useUiStore } from '../../store/uiStore';

const emptyForm = {
  title: '',
  description: '',
  category: 'powerbi',
  type: 'youtube',
  url: '',
  isPublished: true,
  order: 0,
};

export default function AdminTutorials() {
  const { user } = useAuth();
  const addToast = useUiStore((s) => s.addToast);
  const fileRef = useRef();
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = () => getAllTutorials().then(setList).catch(() => addToast('Failed to load tutorials', 'error'));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    let url = form.url.trim();
    const file = fileRef.current?.files?.[0];

    if (form.type === 'youtube') {
      if (!url) {
        addToast('Enter a YouTube URL', 'error');
        return;
      }
    } else if (form.type === 'pdf') {
      if (!file) {
        addToast('Select a PDF file to upload', 'error');
        return;
      }
      if (file.type && file.type !== 'application/pdf') {
        addToast('Only PDF files are allowed', 'error');
        return;
      }
    } else if (form.type === 'video') {
      if (!file) {
        addToast('Select a video file to upload', 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (file) {
        const ext =
          form.type === 'pdf'
            ? 'pdf'
            : (file.name.split('.').pop() || 'mp4').toLowerCase();
        const contentType =
          form.type === 'pdf' ? 'application/pdf' : file.type || 'video/mp4';
        url = await uploadFile(`tutorials/${Date.now()}.${ext}`, file, { contentType });
      }

      if (!url) {
        addToast('Upload failed — no file URL', 'error');
        return;
      }

      await createTutorial({
        ...form,
        url,
        isPublished: true,
        uploadedBy: user.uid,
      });
      addToast('Tutorial uploaded successfully');
      if (fileRef.current) fileRef.current.value = '';
      setForm(emptyForm);
      load();
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Upload failed. Check Supabase Storage bucket "ims".', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper title="Tutorials">
      <form onSubmit={handleSubmit} className="card mb-6 grid gap-3 md:grid-cols-2">
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <label className="block text-sm">
          Category
          <select className="input-field mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {TUTORIAL_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Type
          <select
            className="input-field mt-1"
            value={form.type}
            onChange={(e) => {
              setForm({ ...form, type: e.target.value, url: '' });
              if (fileRef.current) fileRef.current.value = '';
            }}
          >
            <option value="youtube">YouTube</option>
            <option value="video">Video file</option>
            <option value="pdf">PDF</option>
          </select>
        </label>
        {form.type === 'youtube' ? (
          <Input
            label="YouTube URL"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="md:col-span-2"
            required
          />
        ) : (
          <label className="md:col-span-2 text-sm">
            {form.type === 'pdf' ? 'PDF file' : 'Video file (MP4, WebM)'}
            <input
              ref={fileRef}
              type="file"
              accept={form.type === 'pdf' ? '.pdf,application/pdf' : 'video/*'}
              className="mt-1 block w-full"
              required
            />
          </label>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Uploading…' : 'Upload'}
        </Button>
      </form>
      <ul className="space-y-2">
        {list.map((t) => (
          <li key={t.id} className="card flex items-center justify-between gap-4">
            <span>
              {t.title}{' '}
              <span className="text-xs text-slate-500">
                ({t.category} · {t.type})
              </span>
            </span>
            <Button variant="danger" onClick={() => deleteTutorial(t.id).then(load)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </PageWrapper>
  );
}
