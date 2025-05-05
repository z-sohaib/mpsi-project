// components/layout/Layout.tsx
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex'>
      <Sidebar />
      <main className='min-h-screen flex-1 bg-gray-50'>
        <Topbar />
        <div className='py-6'>{children}</div>
      </main>
    </div>
  );
}
