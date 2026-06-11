import Sidebar from './Sidebar';
import Header from './Header';
import AnnouncementPopup from '../announcements/AnnouncementPopup';
import { useInternAnnouncementPopup } from '../../hooks/useInternAnnouncementPopup';
import { useResponsiveSidebar } from '../../hooks/useResponsiveSidebar';
import { useUiStore } from '../../store/uiStore';

export default function PageWrapper({ title, children }) {
  const { show, announcement, dismiss } = useInternAnnouncementPopup();
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  useResponsiveSidebar();

  return (
    <div className="flex min-h-screen min-w-0">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-5 md:p-6">{children}</main>
      </div>
      {show && <AnnouncementPopup announcement={announcement} onDismiss={dismiss} />}
    </div>
  );
}
