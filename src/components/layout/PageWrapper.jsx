import Sidebar from './Sidebar';
import Header from './Header';

export default function PageWrapper({ title, children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-0">
        <Header title={title} />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
