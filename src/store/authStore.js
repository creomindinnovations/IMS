import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  profileError: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile, profileError: null }),
  setProfileError: (profileError) => set({ profileError }),
  setLoading: (loading) => set({ loading }),
  clear: () =>
    set({ user: null, profile: null, profileError: null, loading: false }),
}));
