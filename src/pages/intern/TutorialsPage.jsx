import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { TUTORIAL_CATEGORIES, getCategoryLabel } from '../../constants/categories';
import { getPublishedTutorials, getProgress, markTutorialComplete } from '../../services/tutorialService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { useUiStore } from '../../store/uiStore';

function youtubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    const id = u.searchParams.get('v');
    if (id) return `https://www.youtube.com/embed/${id}`;
  } catch {
    return null;
  }
  return null;
}

function TutorialMedia({ tutorial }) {
  const { type, url, title } = tutorial;

  if (type === 'youtube') {
    const embed = youtubeEmbedUrl(url);
    if (embed) {
      return (
        <div className="mt-3 aspect-video overflow-hidden rounded-lg bg-slate-100">
          <iframe
            title={title}
            src={embed}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }

  if (type === 'video' && url) {
    return (
      <video controls className="mt-3 w-full rounded-lg" src={url}>
        <track kind="captions" />
      </video>
    );
  }

  if (type === 'pdf' && url) {
    return (
      <div className="mt-3">
        <iframe title={title} src={url} className="h-64 w-full rounded-lg border border-border sm:h-96" />
      </div>
    );
  }

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-sm text-accent hover:underline"
      >
        Open resource
      </a>
    );
  }

  return null;
}

export default function TutorialsPage() {
  const { profile } = useAuth();
  const addToast = useUiStore((s) => s.addToast);
  const [category, setCategory] = useState('all');
  const [tutorials, setTutorials] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [tuts, prog] = await Promise.all([
        getPublishedTutorials(),
        profile?.uid ? getProgress(profile.uid) : { completedTutorials: [] },
      ]);
      setTutorials(tuts);
      setCompleted(prog.completedTutorials || []);
    } catch (err) {
      console.error(err);
      addToast('Could not load tutorials. Try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [profile?.uid]);

  const filtered =
    category === 'all' ? tutorials : tutorials.filter((t) => t.category === category);

  const handleComplete = async (tutorialId) => {
    if (!profile?.uid) return;
    await markTutorialComplete(profile.uid, tutorialId);
    addToast('Tutorial marked complete');
    load();
  };

  return (
    <PageWrapper title="Tutorials">
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`filter-chip ${category === 'all' ? 'filter-chip-active' : ''}`}
        >
          All ({tutorials.length})
        </button>
        {TUTORIAL_CATEGORIES.map((c) => {
          const count = tutorials.filter((t) => t.category === c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`filter-chip ${category === c.id ? 'filter-chip-active' : ''}`}
            >
              {c.label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-center text-slate-500">Loading tutorials…</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-slate-500">
          {tutorials.length === 0
            ? 'No tutorials published yet. Check back soon.'
            : 'No tutorials in this category yet.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((t) => (
            <div key={t.id} className="card">
              <span className="text-xs text-accent">{getCategoryLabel(t.category)}</span>
              <h3 className="mt-1 font-semibold text-primary">{t.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{t.description}</p>
              <TutorialMedia tutorial={t} />
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {t.url && (
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-accent hover:underline"
                  >
                    Open in new tab
                  </a>
                )}
                {!completed.includes(t.id) && profile?.uid && (
                  <Button variant="secondary" onClick={() => handleComplete(t.id)}>
                    Mark Complete
                  </Button>
                )}
                {completed.includes(t.id) && (
                  <span className="text-sm text-success">✓ Completed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
