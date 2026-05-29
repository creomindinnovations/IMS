import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import { loadProfile } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { getHomePathForProfile } from '../../utils/authRedirect';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setProfile, setProfileError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await login(email, password);
      setUser(cred.user);
      const profile = await loadProfile(cred.user.uid);
      setProfile(profile);
      const home = getHomePathForProfile(profile);
      if (home) {
        navigate(home, { replace: true });
      }
    } catch (err) {
      setProfileError(err.message);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary">IMS Login</h1>
        <p className="mt-1 text-slate-500">Internship Management System</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
        <Link to={ROUTES.FORGOT_PASSWORD} className="mt-4 block text-center text-sm text-accent">
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
