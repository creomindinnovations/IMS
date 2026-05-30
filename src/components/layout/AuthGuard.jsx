import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { getHomePathForProfile } from '../../utils/authRedirect';
import { isSupabaseConfigured } from '../../services/supabase';
import Skeleton from '../common/Skeleton';
import Button from '../common/Button';
import { logout } from '../../services/authService';

export function PublicOnly({ children }) {
  const { user, profile, profileError, loading, passwordRecovery } = useAuth();

  if (loading) return <AuthLoading />;

  if (user && passwordRecovery) {
    return <Navigate to={ROUTES.RESET_PASSWORD} replace />;
  }

  if (user && profile?.role) {
    return <Navigate to={getHomePathForProfile(profile)} replace />;
  }

  if (user && !loading && !profile?.role) {
    return <ProfileSetupRequired error={profileError} />;
  }

  return children;
}

export function ProtectedRoute({ allowedRoles }) {
  const { user, profile, profileError, loading, passwordRecovery } = useAuth();

  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }
  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;

  if (passwordRecovery) {
    return <Navigate to={ROUTES.RESET_PASSWORD} replace />;
  }

  if (!profile?.role) {
    return <ProfileSetupRequired error={profileError} />;
  }

  if (profile.isActive === false) {
    return <div className="p-8 text-center text-error">Account deactivated.</div>;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to={getHomePathForProfile(profile)} replace />;
  }

  return <Outlet />;
}

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-8">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function ProfileSetupRequired({ error }) {
  const handleLogout = async () => {
    await logout();
    window.location.href = ROUTES.LOGIN;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="card max-w-lg">
        <h1 className="text-xl font-semibold text-primary">Profile not found</h1>
        <p className="mt-3 text-sm text-slate-600">
          You are signed in, but IMS needs a row in Supabase table{' '}
          <code className="font-mono text-xs">users</code> with your auth user{' '}
          <code className="font-mono text-xs">id</code> and a{' '}
          <code className="font-mono text-xs">role</code> (
          <code className="font-mono text-xs">admin</code>,{' '}
          <code className="font-mono text-xs">teamlead</code>, or{' '}
          <code className="font-mono text-xs">intern</code>).
        </p>
        {error && (
          <p className="mt-2 rounded-btn bg-red-50 p-3 text-sm text-error">{error}</p>
        )}
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>Supabase Dashboard → Authentication → copy User UID</li>
          <li>Table Editor → <strong>users</strong> → insert row with that id</li>
          <li>Set: name, email, role = admin, department, is_active = true</li>
        </ol>
        <Button className="mt-6" variant="secondary" onClick={handleLogout}>
          Sign out and try again
        </Button>
      </div>
    </div>
  );
}

function SetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-8">
      <div className="card max-w-lg text-center">
        <h1 className="text-xl font-semibold text-primary">Supabase setup required</h1>
        <p className="mt-4 text-slate-600">
          Copy <code className="font-mono text-xs">.env.example</code> to{' '}
          <code className="font-mono text-xs">.env</code> and add your Supabase URL and anon key.
        </p>
      </div>
    </div>
  );
}
