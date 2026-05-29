import { useAuth } from '../../hooks/useAuth';
import { useUiStore } from '../../store/uiStore';
import { logout } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { ROLE_LABELS } from '../../constants/roles';

export default function Header({ title }) {
  const { profile } = useAuth();
  const { toggleSidebar } = useUiStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-btn p-2 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <h1 className="text-lg font-semibold text-primary">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{profile?.name}</p>
          <p className="text-xs text-slate-500">{ROLE_LABELS[profile?.role]}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
          {profile?.name?.charAt(0) || '?'}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-error"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
