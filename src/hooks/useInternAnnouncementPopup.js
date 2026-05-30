import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { ROLES } from '../constants/roles';
import { getAnnouncements, filterAnnouncementsForUser } from '../services/announcementService';
import {
  getDismissedAnnouncementIds,
  dismissAnnouncement as persistDismissal,
} from '../utils/announcementDismissal';

export function useInternAnnouncementPopup() {
  const { profile, loading } = useAuth();
  const [pending, setPending] = useState([]);

  const uid = profile?.uid;
  const isIntern = profile?.role === ROLES.INTERN;

  const loadPending = useCallback(async () => {
    if (!uid || !isIntern) {
      setPending([]);
      return;
    }

    try {
      const all = await getAnnouncements();
      const dismissed = new Set(getDismissedAnnouncementIds(uid));
      const unread = filterAnnouncementsForUser(all, profile).filter(
        (a) => a.id && !dismissed.has(String(a.id)),
      );
      setPending(unread);
    } catch (err) {
      console.error('Failed to load announcement popup', err);
      setPending([]);
    }
  }, [uid, isIntern, profile]);

  useEffect(() => {
    if (loading) return undefined;
    loadPending();
    return undefined;
  }, [loading, loadPending]);

  useEffect(() => {
    if (!isIntern) return undefined;

    const intervalId = window.setInterval(loadPending, 30000);
    const onFocus = () => loadPending();
    window.addEventListener('focus', onFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [isIntern, loadPending]);

  const current = pending[0] ?? null;

  const dismiss = useCallback(() => {
    if (!uid || !current?.id) return;
    persistDismissal(uid, current.id);
    setPending((prev) => prev.filter((a) => String(a.id) !== String(current.id)));
  }, [uid, current]);

  return {
    show: isIntern && Boolean(current),
    announcement: current,
    dismiss,
  };
}
