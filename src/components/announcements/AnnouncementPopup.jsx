import { createPortal } from 'react-dom';
import Button from '../common/Button';
import { formatDate } from '../../utils/dateUtils';

export default function AnnouncementPopup({ announcement, onDismiss }) {
  if (!announcement) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/30 p-4 pt-6 md:pt-10"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="announcement-title"
      aria-describedby="announcement-body"
    >
      <div className="glass-static w-full max-w-2xl p-5 shadow-glass-hover">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">New announcement</p>
        <h2 id="announcement-title" className="mt-2 text-xl font-semibold">
          {announcement.title}
        </h2>
        {announcement.createdAt && (
          <p className="mt-1 text-xs text-muted">{formatDate(announcement.createdAt)}</p>
        )}
        <p id="announcement-body" className="mt-4 whitespace-pre-wrap text-muted">
          {announcement.body}
        </p>
        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={onDismiss}>
            Got it
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
