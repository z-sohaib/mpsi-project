import { useState } from 'react';
import { X } from 'lucide-react';

interface Account {
  id: number;
  name: string;
  status: string;
  image: string;
}

const initialAccounts: Account[] = [
  {
    id: 1,
    name: 'Nibras Bouzidi',
    status: 'Active 1 days ago',
    image: '/user.png',
  },
  {
    id: 2,
    name: 'Zoubir Akram',
    status: 'Active 4 days ago',
    image: '/user.png',
  },
];

export default function PreviousAccounts() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);

  const handleDelete = (id: number) => {
    setAccounts(accounts.filter((account) => account.id !== id));
  };

  if (accounts.length === 0) {
    return <div></div>;
  }

  return (
    <div className='p-4'>
      <h2 className='mb-4 text-2xl font-bold'>Login as</h2>
      <div className='flex space-x-4'>
        {accounts.map((account) => (
          <div
            key={account.id}
            className='relative flex h-64 w-48 flex-col items-center justify-center rounded-lg bg-blue-500 p-4 text-white shadow-md'
          >
            <button
              onClick={() => handleDelete(account.id)}
              className='absolute right-2 top-2 rounded-full bg-gray-200/50 p-1 text-white hover:bg-gray-200/75'
            >
              <X size={16} />
            </button>
            <img
              src={account.image}
              alt={account.name}
              className='mb-4 size-24 rounded-full'
            />
            <h3 className='text-lg font-semibold'>{account.name}</h3>
            <p className='text-sm'>{account.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
