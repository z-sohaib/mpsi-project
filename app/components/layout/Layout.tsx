// components/layout/Layout.tsx

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className='flex min-h-screen bg-gray-100'>
      {/* Fixed sidebar that stays in place */}
      <div className='fixed left-0 top-0 hidden h-full lg:block'>
        <Sidebar />
      </div>

      {/* Main content with left padding to account for sidebar width */}
      <div className='flex w-full flex-col lg:pl-64'>
        <Topbar />
        <main className='mt-8 flex-1 overflow-y-auto px-4 pb-8'>
          {children}
        </main>
      </div>
    </div>
  );
}
