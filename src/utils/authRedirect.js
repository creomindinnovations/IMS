import { ROLE_HOME, ROUTES } from '../constants/routes';

/** Resolve post-login path from Firestore profile role. */
export function getHomePathForProfile(profile) {
  if (!profile?.role) return null;
  return ROLE_HOME[profile.role] || ROUTES.INTERN;
}
