import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-xl font-bold text-primary">Reset Password</h1>
        {sent ? (
          <p className="mt-4 text-success">Check your email for a reset link.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
          </form>
        )}
        <Link to={ROUTES.LOGIN} className="mt-4 block text-center text-sm text-accent">
          Back to login
        </Link>
      </div>
    </div>
  );
}
