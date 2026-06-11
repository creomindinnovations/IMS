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
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-white px-3 sm:px-4 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="shrink-0 rounded-btn p-2 hover:bg-slate-100 md:hidden"
          aria-label="Open menu"
        >
          ☰
        </button>
        <h1 className="truncate text-base font-semibold text-primary sm:text-lg">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="hidden text-right sm:block">
          <p className="max-w-[140px] truncate text-sm font-medium md:max-w-none">{profile?.name}</p>
          <p className="text-xs text-slate-500">{ROLE_LABELS[profile?.role]}</p>
        </div>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white sm:hidden"
          aria-hidden
        >
          {profile?.name?.charAt(0) || '?'}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="min-h-[44px] shrink-0 rounded-btn px-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-error sm:px-0 sm:hover:bg-transparent"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
