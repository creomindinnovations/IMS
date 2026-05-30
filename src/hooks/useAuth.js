import { useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { normalizeUser, isPasswordRecoveryUrl } from '../services/authService';
import { getUser } from '../services/userService';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../constants/routes';

export async function loadProfile(uid) {
  const profile = await getUser(uid);
  if (!profile?.role) {
    throw new Error(
      'No user profile found. In Supabase, add a row in table users with id = auth user id and role: admin, teamlead, or intern.',
    );
  }
  return profile;
}

export function useAuthInit() {
  const { setUser, setProfile, setProfileError, setLoading, setPasswordRecovery, clear } =
    useAuthStore();

  const syncProfile = useCallback(
    async (sessionUser) => {
      if (!sessionUser) {
        clear();
        return;
      }
      setLoading(true);
      setUser(normalizeUser(sessionUser));
      try {
        const profile = await loadProfile(sessionUser.id);
        setProfile(profile);
      } catch (err) {
        setProfile(null);
        setProfileError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    },
    [setUser, setProfile, setProfileError, setLoading, clear],
  );

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return undefined;
    }

    if (isPasswordRecoveryUrl()) {
      setPasswordRecovery(true);
      if (!window.location.pathname.startsWith(ROUTES.RESET_PASSWORD)) {
        window.location.replace(
          `${ROUTES.RESET_PASSWORD}${window.location.hash}${window.location.search}`,
        );
        return undefined;
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncProfile(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
      }
      if (event === 'SIGNED_OUT') {
        setPasswordRecovery(false);
      }
      syncProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [syncProfile, setLoading, setPasswordRecovery]);
}

export function useAuth() {
  const { user, profile, profileError, loading, passwordRecovery } = useAuthStore();
  return { user, profile, profileError, loading, passwordRecovery, role: profile?.role };
}
