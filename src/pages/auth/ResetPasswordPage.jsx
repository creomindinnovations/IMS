import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { changePassword, logout } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { getHomePathForProfile } from '../../utils/authRedirect';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import { ROUTES } from '../../constants/routes';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { user, profile, loading, passwordRecovery } = useAuth();
  const setPasswordRecovery = useAuthStore((s) => s.setPasswordRecovery);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-8">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!passwordRecovery && profile?.role) {
    return <Navigate to={getHomePathForProfile(profile)} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(password);
      setPasswordRecovery(false);
      await logout();
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { passwordReset: true },
      });
    } catch (err) {
      setError(err.message || 'Could not update password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-xl font-bold text-primary">Set New Password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose a new password for your account. This works for admin and intern accounts.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Updating…' : 'Update Password'}
          </Button>
        </form>
        <Link to={ROUTES.LOGIN} className="mt-4 block text-center text-sm text-accent">
          Back to login
        </Link>
      </div>
    </div>
  );
}
