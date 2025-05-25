import { useState, useEffect } from 'react';
import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';

import Layout from '~/components/layout/Layout';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { requireUserId } from '~/session.server';
import {
  fetchUserById,
  updateUserById,
  deleteUserById,
  updateUserPassword,
} from '~/models/users.server';

type ActionData = {
  errors?: {
    username?: string;
    email?: string;
    password?: string;
    form?: string;
  };
  success?: boolean;
  message?: string;
  action?: 'update' | 'delete' | 'changePassword';
};

type LoaderData = {
  user: {
    id: number;
    username: string;
    email: string;
  };
  error?: string;
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  try {
    const session = await requireUserId(request);
    const userId = params.id;

    if (!userId) {
      throw new Response('User ID is required', { status: 400 });
    }

    const user = await fetchUserById(session.access, userId);

    if (!user) {
      throw new Response('User not found', { status: 404 });
    }

    return json({ user });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Loader error:', error);
    throw redirect('/auth');
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const session = await requireUserId(request);
    const userId = params.id;

    if (!userId) {
      return json({ errors: { form: 'User ID is required' } }, { status: 400 });
    }

    const formData = await request.formData();
    const action = formData.get('action') as string;

    if (!action) {
      return json({ errors: { form: 'Action is required' } }, { status: 400 });
    }

    try {
      // Handle different action types
      switch (action) {
        case 'update': {
          // Extract form values
          const username = formData.get('username') as string;
          const email = formData.get('email') as string;

          // Validate fields
          const errors: ActionData['errors'] = {};
          if (!username) errors.username = "Le nom d'utilisateur est requis";
          if (!email) errors.email = "L'email est requis";

          if (Object.keys(errors).length > 0) {
            return json({ errors, success: false }, { status: 400 });
          }

          // Prepare update data - no longer include password here
          const updateData = { username, email };

          // Update user
          await updateUserById(session.access, userId, updateData);

          return json({
            success: true,
            action: 'update',
            message: 'Utilisateur mis à jour avec succès',
          });
        }

        case 'changePassword': {
          // Extract password
          const password = formData.get('password') as string;

          // Validate password
          if (!password || password.trim() === '') {
            return json(
              {
                errors: { password: 'Le mot de passe ne peut pas être vide' },
                success: false,
              },
              { status: 400 },
            );
          }

          // Update password using the separate endpoint
          await updateUserPassword(session.access, userId, password);

          return json({
            success: true,
            action: 'changePassword',
            message: 'Mot de passe mis à jour avec succès',
          });
        }

        case 'delete': {
          // Delete user
          await deleteUserById(session.access, userId);

          return redirect('/users');
        }

        default:
          return json({ errors: { form: 'Invalid action' } }, { status: 400 });
      }
    } catch (error) {
      console.error('Error processing user action:', error);
      return json(
        {
          errors: { form: 'Failed to process the request. Please try again.' },
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Action error:', error);
    return json(
      {
        errors: {
          form:
            error instanceof Error
              ? error.message
              : "Une erreur est survenue lors de la mise à jour de l'utilisateur",
        },
        success: false,
      },
      { status: 500 },
    );
  }
}

export default function UserDetailsPage() {
  const { user, error: loaderError } = useLoaderData<LoaderData>();
  const userFetcher = useFetcher<ActionData>();
  const passwordFetcher = useFetcher<ActionData>();

  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [userModified, setUserModified] = useState(false);
  const [showUserToast, setShowUserToast] = useState(false);
  const [showPasswordToast, setShowPasswordToast] = useState(false);
  const [error, setError] = useState<string | null>(loaderError || null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Track if user details form has been modified
  useEffect(() => {
    setUserModified(username !== user.username || email !== user.email);
  }, [username, email, user]);

  // Show toast notification on successful user update
  useEffect(() => {
    if (userFetcher.data?.success && userFetcher.data.action === 'update') {
      setShowUserToast(true);
      const timer = setTimeout(() => {
        setShowUserToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (userFetcher.data?.errors?.form) {
      setError(userFetcher.data.errors.form);
    }
  }, [userFetcher.data]);

  // Show toast notification on successful password update
  useEffect(() => {
    if (
      passwordFetcher.data?.success &&
      passwordFetcher.data.action === 'changePassword'
    ) {
      setShowPasswordToast(true);
      setPassword(''); // Clear password field after successful update
      const timer = setTimeout(() => {
        setShowPasswordToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (passwordFetcher.data?.errors?.form) {
      setError(passwordFetcher.data.errors.form);
    }
  }, [passwordFetcher.data]);

  // Check if forms are submitting
  const isUserSubmitting = userFetcher.state !== 'idle';
  const isPasswordSubmitting = passwordFetcher.state !== 'idle';

  return (
    <Layout>
      <div className='mx-auto my-8 max-w-4xl px-4 md:px-0'>
        {/* Toast notifications */}
        {showUserToast && (
          <div className='fixed bottom-4 right-4 z-50 rounded-md bg-green-500 px-4 py-2 text-white shadow-lg'>
            {userFetcher.data?.message || 'Utilisateur mis à jour avec succès'}
          </div>
        )}

        {showPasswordToast && (
          <div className='fixed bottom-4 right-4 z-50 rounded-md bg-green-500 px-4 py-2 text-white shadow-lg'>
            {passwordFetcher.data?.message ||
              'Mot de passe mis à jour avec succès'}
          </div>
        )}

        <div className='rounded-xl border border-mpsi bg-white p-8 shadow-sm'>
          <h2 className='mb-6 text-center text-xl font-bold text-[#1D6BF3]'>
            Détails de l&apos;utilisateur
          </h2>

          {error && (
            <div className='mb-4 rounded-md bg-red-100 p-4 text-red-700'>
              {error}
              <button
                onClick={() => setError(null)}
                className='ml-2 font-bold'
                aria-label='Dismiss error'
              >
                ×
              </button>
            </div>
          )}

          {/* User information form */}
          <userFetcher.Form
            method='post'
            className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'
          >
            <input type='hidden' name='action' value='update' />

            {/* User ID (read-only) */}
            <div className='w-full'>
              <label
                htmlFor='id'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                ID Utilisateur
              </label>
              <Input
                id='id'
                value={user.id}
                readOnly
                className='w-full bg-gray-100'
              />
            </div>

            {/* Empty div for grid alignment */}
            <div className='hidden md:block'></div>

            {/* Username */}
            <div className='w-full'>
              <label
                htmlFor='username'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Nom d&apos;utilisateur*
              </label>
              <Input
                id='username'
                name='username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full border-gray-300 ${
                  userFetcher.data?.errors?.username ? 'border-red-500' : ''
                }`}
                placeholder="Nom d'utilisateur"
              />
              {userFetcher.data?.errors?.username && (
                <p className='mt-1 text-sm text-red-500'>
                  {userFetcher.data.errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div className='w-full'>
              <label
                htmlFor='email'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Email*
              </label>
              <Input
                id='email'
                name='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full border-gray-300 ${
                  userFetcher.data?.errors?.email ? 'border-red-500' : ''
                }`}
                placeholder='exemple@esi.dz'
              />
              {userFetcher.data?.errors?.email && (
                <p className='mt-1 text-sm text-red-500'>
                  {userFetcher.data.errors.email}
                </p>
              )}
            </div>

            {/* Submit button for user details - only visible if modified */}
            <div className='col-span-full mt-6 flex justify-center'>
              {userModified && (
                <Button
                  type='submit'
                  className='bg-mpsi px-8 py-2 text-white hover:bg-mpsi/90 disabled:opacity-70'
                  disabled={isUserSubmitting}
                >
                  {isUserSubmitting ? (
                    <div className='flex items-center gap-2'>
                      <div className='size-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                      <span>Enregistrement...</span>
                    </div>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
              )}
            </div>
          </userFetcher.Form>

          {/* Separate password change section */}
          <div className='mt-8 border-t border-gray-200 pt-6'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>
              Changer le mot de passe
            </h3>

            <passwordFetcher.Form
              method='post'
              className='grid grid-cols-1 gap-y-4 md:grid-cols-2'
            >
              <input type='hidden' name='action' value='changePassword' />

              {/* Password */}
              <div className='w-full'>
                <label
                  htmlFor='password'
                  className='mb-1 block text-sm font-medium text-gray-700'
                >
                  Nouveau mot de passe*
                </label>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border-gray-300 ${
                    passwordFetcher.data?.errors?.password
                      ? 'border-red-500'
                      : ''
                  }`}
                  placeholder='Entrez le nouveau mot de passe'
                />
                {passwordFetcher.data?.errors?.password && (
                  <p className='mt-1 text-sm text-red-500'>
                    {passwordFetcher.data.errors.password}
                  </p>
                )}
              </div>

              {/* Submit button for password change */}
              <div className='ml-4 flex items-end'>
                <Button
                  type='submit'
                  className='bg-mpsi px-4 py-2 text-white hover:bg-mpsi/90 disabled:opacity-70'
                  disabled={isPasswordSubmitting || !password.trim()}
                >
                  {isPasswordSubmitting ? (
                    <div className='flex items-center gap-2'>
                      <div className='size-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                      <span>Modification...</span>
                    </div>
                  ) : (
                    'Changer le mot de passe'
                  )}
                </Button>
              </div>
            </passwordFetcher.Form>
          </div>

          {/* Danger zone */}
          <div className='mt-8 border-t border-gray-200 pt-6'>
            <h3 className='mb-4 text-lg font-semibold text-red-600'>
              Zone de danger
            </h3>

            <Button
              type='button'
              onClick={() => setShowDeleteModal(true)}
              className='bg-red-600 px-8 py-2 text-white hover:bg-red-700 disabled:opacity-70'
              disabled={isUserSubmitting || isPasswordSubmitting}
            >
              Supprimer l&apos;utilisateur
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
            <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-xl'>
              <h3 className='mb-4 text-lg font-bold text-gray-900'>
                Confirmer la suppression
              </h3>
              <p className='mb-6 text-gray-600'>
                Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette
                action ne peut pas être annulée.
              </p>
              <div className='flex justify-end space-x-4'>
                <Button
                  variant='outline'
                  onClick={() => setShowDeleteModal(false)}
                  className='border border-mpsi text-mpsi'
                  disabled={isUserSubmitting}
                >
                  Annuler
                </Button>
                <userFetcher.Form method='post'>
                  <input type='hidden' name='action' value='delete' />
                  <Button
                    type='submit'
                    className='bg-red-600 text-white hover:bg-red-700'
                    disabled={isUserSubmitting}
                  >
                    {isUserSubmitting ? (
                      <div className='flex items-center gap-2'>
                        <div className='size-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                        <span>Suppression...</span>
                      </div>
                    ) : (
                      'Confirmer la suppression'
                    )}
                  </Button>
                </userFetcher.Form>
              </div>
            </div>
          </div>
        )}

        {/* Back button */}
        <div className='mt-8'>
          <Link
            to='/users'
            className='inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='mr-2 size-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15 12H9m0 0H3m6 0v8m0-8l6-6m-6 6l6 6'
              />
            </svg>
            Retour à la liste des utilisateurs
          </Link>
        </div>
      </div>
    </Layout>
  );
}
