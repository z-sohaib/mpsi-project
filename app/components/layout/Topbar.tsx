import { Bell } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';

export default function Topbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout: remove token and redirect to /auth
  const handleLogout = () => {
    localStorage.removeItem('token');
    setDropdownOpen(false);
    navigate('/auth', { replace: true }); // Replace history entry
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className='flex items-center justify-end border-b bg-white p-4'>
      {/* Search Bar */}

      {/* Actions */}
      <div className='ml-4 flex items-center space-x-4'>
        <button
          aria-label='Notifications'
          className='rounded-full p-2 text-gray-600 hover:bg-gray-100'
        >
          <Bell className='size-5' />
        </button>

        {/* User Info & Avatar */}
        <div className='relative' ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                toggleDropdown();
              }
            }}
            className='flex items-center space-x-2'
            aria-expanded={dropdownOpen}
            aria-haspopup='true'
          >
            <div className='size-8 overflow-hidden rounded-full bg-blue-500'>
              <span className='flex h-full items-center justify-center text-white'>
                KR
              </span>
            </div>
            <div className='hidden text-left md:block'>
              <p className='text-sm font-medium'>REHAMNIA Karim</p>
              <p className='text-xs text-gray-500'>k_rehamnia@esi.dz</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className='absolute right-0 z-10 mt-2 w-56 rounded-md border bg-white shadow-lg'>
              <div className='border-b p-4'>
                <p className='font-medium'>REHAMNIA Karim</p>
                <p className='text-sm text-gray-500'>k_rehamnia@esi.dz</p>
              </div>
              <nav>
                <ul className='py-2'>
                  <li>
                    <button
                      onClick={() => navigate('/profile')}
                      className='flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100'
                    >
                      Manage Account
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate('/change-password')}
                      className='flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100'
                    >
                      Change Password
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate('/activity-log')}
                      className='flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100'
                    >
                      Activity Log
                    </button>
                  </li>
                  <li className='border-t'>
                    <button
                      onClick={handleLogout}
                      className='flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100'
                    >
                      Log out
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
