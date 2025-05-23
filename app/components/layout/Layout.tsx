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
      <div className='hidden lg:block'>
        <Sidebar />
      </div>
      <div className='flex flex-1 flex-col'>
        {/* Pass userInfo to Topbar */}
        <Topbar />
        <main className='mt-8 flex-1 overflow-y-auto'>{children}</main>
      </div>
    </div>
  );
}
