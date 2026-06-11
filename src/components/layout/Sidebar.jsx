import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUiStore } from '../../store/uiStore';
import { closeMobileSidebar } from '../../hooks/useResponsiveSidebar';
import { ROLES } from '../../constants/roles';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/interns', label: 'Manage Interns' },
  { to: '/admin/attendance', label: 'Attendance' },
  { to: '/admin/leaves', label: 'Leave Requests' },
  { to: '/admin/tutorials', label: 'Tutorials' },
  { to: '/admin/offer-letters', label: 'Offer Letters' },
  { to: '/admin/certificates', label: 'Certificates' },
  { to: '/admin/announcements', label: 'Announcements' },
  { to: '/admin/settings', label: 'Settings' },
];

const leadLinks = [
  { to: '/lead', label: 'Dashboard', end: true },
  { to: '/lead/attendance', label: 'Team Attendance' },
];

const internLinks = [
  { to: '/intern', label: 'Dashboard', end: true },
  { to: '/intern/attendance', label: 'My Attendance' },
  { to: '/intern/leave', label: 'Apply Leave' },
  { to: '/intern/tutorials', label: 'Tutorials' },
  { to: '/intern/documents', label: 'Documents' },
];

export default function Sidebar() {
  const { profile } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUiStore();

  const links =
    profile?.role === ROLES.ADMIN
      ? adminLinks
      : profile?.role === ROLES.TEAM_LEAD
        ? leadLinks
        : internLinks;

  return (
    <aside
      className={`nav-bar fixed inset-y-0 left-0 z-40 flex w-60 flex-col transition-transform duration-300 ease-in-out md:static md:transition-[width] ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${sidebarOpen ? 'md:w-60' : 'md:w-16'}`}
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/15 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-sm font-bold text-white">
            IMS
          </span>
          {sidebarOpen && (
            <span className="truncate text-xs text-white/70">
              {import.meta.env.VITE_APP_NAME || 'Internship MS'}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden shrink-0 rounded-btn p-1.5 text-white/80 hover:bg-white/15 md:inline-flex"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? '‹' : '›'}
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={closeMobileSidebar}
            title={!sidebarOpen ? link.label : undefined}
            className={({ isActive }) =>
              `flex min-h-[44px] items-center rounded-xl px-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              } ${!sidebarOpen ? 'md:justify-center md:px-0' : ''}`
            }
          >
            {sidebarOpen ? (
              link.label
            ) : (
              <>
                <span className="md:hidden">{link.label}</span>
                <span className="hidden md:inline" aria-hidden>
                  {link.label.charAt(0)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
