import { useState } from 'react';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { Eye, PlusCircle, UserCheck, Users } from 'lucide-react';

import Layout from '~/components/layout/Layout';
import { requireUserId } from '~/session.server';
import { fetchUsers } from '~/models/users.server';
import { Button } from '~/components/ui/Button';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireUserId(request);
  const users = await fetchUsers(session.access);

  return json({ users });
}

export default function UsersPage() {
  const { users } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const searchText = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchText) ||
      user.email.toLowerCase().includes(searchText)
    );
  });

  return (
    <Layout>
      <div className='container mx-auto my-8 px-4'>
        <div className='mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center'>
          <div>
            <h1 className='text-2xl font-bold text-mpsi'>
              Gestion des utilisateurs
            </h1>
            <p className='text-sm text-gray-600'>
              {users.length} utilisateur{users.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className='flex flex-col gap-2 sm:flex-row'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Rechercher...'
                className='w-full rounded-md border border-gray-300 px-3 py-2 pl-9 text-sm focus:border-mpsi focus:outline-none focus:ring-1 focus:ring-mpsi'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className='absolute left-3 top-2 text-gray-400'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='size-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </span>
            </div>

            <Link to='/users/new'>
              <Button className='w-full bg-mpsi text-white sm:w-auto'>
                <PlusCircle className='mr-2 size-4' />
                Nouvel utilisateur
              </Button>
            </Link>
          </div>
        </div>

        {/* Users stats cards */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
            <div className='flex items-center'>
              <div className='mr-4 rounded-full bg-blue-100 p-3'>
                <Users className='size-6 text-blue-600' />
              </div>
              <div>
                <h3 className='text-sm font-medium text-gray-500'>
                  Total utilisateurs
                </h3>
                <p className='text-xl font-semibold'>{users.length}</p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
            <div className='flex items-center'>
              <div className='mr-4 rounded-full bg-green-100 p-3'>
                <UserCheck className='size-6 text-green-600' />
              </div>
              <div>
                <h3 className='text-sm font-medium text-gray-500'>
                  Utilisateurs actifs
                </h3>
                <p className='text-xl font-semibold'>{users.length}</p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
            <div className='flex items-center'>
              <div className='mr-4 rounded-full bg-blue-100 p-3'>
                <Users className='size-6 text-blue-600' />
              </div>
              <div>
                <h3 className='text-sm font-medium text-gray-500'>
                  Administrateurs
                </h3>
                <p className='text-xl font-semibold'>1</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users table */}
        <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium uppercase text-gray-500'
                  >
                    ID
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium uppercase text-gray-500'
                  >
                    Nom d&apos;utilisateur
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium uppercase text-gray-500'
                  >
                    Email
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-right text-xs font-medium uppercase text-gray-500'
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 bg-white'>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className='hover:bg-gray-50'>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <span className='rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800'>
                          {user.id}
                        </span>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>
                        {user.username}
                      </td>
                      <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                        {user.email}
                      </td>
                      <td className='whitespace-nowrap px-6 py-4 text-right text-sm'>
                        <Link
                          to={`/users/${user.id}`}
                          className='inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100'
                        >
                          <Eye className='mr-1 size-4' />
                          Détails
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className='px-6 py-4 text-center text-sm text-gray-500'
                    >
                      {searchTerm
                        ? 'Aucun utilisateur correspondant à votre recherche.'
                        : 'Aucun utilisateur trouvé.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
