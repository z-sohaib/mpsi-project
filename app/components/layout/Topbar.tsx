// components/layout/Topbar.tsx
import { Search, Settings, Bell, MessageCircle } from 'lucide-react';

export default function Topbar() {
  return (
    <header className='flex w-full items-center justify-between border-b bg-white px-6 py-3'>
      {/* Search Bar */}
      <div className='flex w-3/5 max-w-xl items-center rounded-full border px-4 py-2 shadow-sm'>
        <Search className='mr-2 size-4 text-gray-500' />
        <input
          type='text'
          placeholder='Search...'
          className='w-full text-sm outline-none'
        />
        <Settings className='ml-2 size-4 text-gray-400' />
      </div>

      {/* Actions */}
      <div className='flex items-center gap-4'>
        <MessageCircle className='size-5 text-[#1D6BF3]' />
        <Bell className='size-5 text-[#1D6BF3]' />
        <div className='flex items-center gap-2'>
          <img src='/user.png' alt='ESI logo' className='w-12 rounded-lg' />
          <div className='text-sm'>
            <div className='font-semibold text-gray-800'>
              REHAMNIA Karim{' '}
              <span className='inline-block size-2 rounded-full bg-green-500' />
            </div>
            <div className='text-xs text-gray-500'>k_rehamnia@esi.dz</div>
          </div>
        </div>
      </div>
    </header>
  );
}
