import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { getHomePathForProfile } from '../../utils/authRedirect';
import Skeleton from '../common/Skeleton';

/** Sends `/` to login or the role dashboard. */
export default function HomeRedirect() {
  const { user, profile, loading, passwordRecovery } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (user && passwordRecovery) {
    return <Navigate to={ROUTES.RESET_PASSWORD} replace />;
  }

  if (user && profile?.role) {
    return <Navigate to={getHomePathForProfile(profile)} replace />;
  }

  return <Navigate to={ROUTES.LOGIN} replace />;
}
