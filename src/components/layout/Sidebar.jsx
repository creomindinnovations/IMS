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
      className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-primary text-white shadow-xl transition-transform duration-300 ease-in-out md:static md:shadow-none md:transition-[width] ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${sidebarOpen ? 'md:w-60' : 'md:w-16'}`}
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/10 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-lg font-bold">IMS</span>
          {sidebarOpen && (
            <span className="truncate text-xs text-white/70">
              {import.meta.env.VITE_APP_NAME || 'Internship MS'}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden shrink-0 rounded-btn p-1.5 text-white/80 hover:bg-white/10 md:inline-flex"
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
              `flex min-h-[44px] items-center rounded-btn px-3 text-sm transition ${
                isActive ? 'bg-accent text-white' : 'text-white/80 hover:bg-white/10'
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
