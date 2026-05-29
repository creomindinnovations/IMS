import { useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { normalizeUser } from '../services/authService';
import { getUser } from '../services/userService';
import { useAuthStore } from '../store/authStore';

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
  const { setUser, setProfile, setProfileError, setLoading, clear } = useAuthStore();

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

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncProfile(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [syncProfile, setLoading]);
}

export function useAuth() {
  const { user, profile, profileError, loading } = useAuthStore();
  return { user, profile, profileError, loading, role: profile?.role };
}
