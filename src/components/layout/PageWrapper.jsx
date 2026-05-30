import Sidebar from './Sidebar';
import Header from './Header';
import AnnouncementPopup from '../announcements/AnnouncementPopup';
import { useInternAnnouncementPopup } from '../../hooks/useInternAnnouncementPopup';

export default function PageWrapper({ title, children }) {
  const { show, announcement, dismiss } = useInternAnnouncementPopup();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-0">
        <Header title={title} />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">{children}</main>
      </div>
      {show && <AnnouncementPopup announcement={announcement} onDismiss={dismiss} />}
    </div>
  );
}
