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
    <header className="nav-bar sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 rounded-none border-x-0 border-t-0 px-3 sm:px-4 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="shrink-0 rounded-btn p-2 text-white hover:bg-white/15 md:hidden"
          aria-label="Open menu"
        >
          ☰
        </button>
        <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="hidden text-right sm:block">
          <p className="max-w-[140px] truncate text-sm font-medium text-white md:max-w-none">
            {profile?.name}
          </p>
          <p className="text-xs text-white/65">{ROLE_LABELS[profile?.role]}</p>
        </div>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/15 text-sm font-medium text-white sm:hidden"
          aria-hidden
        >
          {profile?.name?.charAt(0) || '?'}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="min-h-[44px] shrink-0 rounded-btn px-2 text-sm text-white/75 hover:bg-white/15 hover:text-white"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
