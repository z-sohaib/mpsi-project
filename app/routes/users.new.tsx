import { useState } from 'react';
import { ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher, Link, useNavigate } from '@remix-run/react';

import Layout from '~/components/layout/Layout';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { requireUserId } from '~/session.server';
import { createUser } from '~/models/users.server';

// Type for the action data returned to the client
type ActionData = {
  errors?: {
    username?: string;
    email?: string;
    password?: string;
    form?: string;
  };
  success?: boolean;
};

// Server action to handle form submission
export async function action({ request }: ActionFunctionArgs) {
  try {
    // Ensure user is authenticated
    const session = await requireUserId(request);
    const formData = await request.formData();

    // Extract form values
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validate required fields
    const errors: ActionData['errors'] = {};
    if (!username) errors.username = "Le nom d'utilisateur est requis";
    if (!email) errors.email = "L'email est requis";
    if (!password) errors.password = 'Le mot de passe est requis';

    // Return errors if validation fails
    if (Object.keys(errors).length > 0) {
      return json({ errors, success: false }, { status: 400 });
    }

    // Create the payload for the API
    const userData = {
      username,
      email,
      password,
    };

    // Create the user
    await createUser(session.access, userData);

    return json({ success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    return json(
      {
        errors: {
          form:
            error instanceof Error
              ? error.message
              : "Une erreur est survenue lors de la création de l'utilisateur",
        },
        success: false,
      },
      { status: 500 },
    );
  }
}

export default function NewUserPage() {
  const fetcher = useFetcher<ActionData>();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if form is submitting
  const isSubmitting = fetcher.state !== 'idle';

  // Show success modal when submission is successful
  if (fetcher.data?.success && !showSuccess) {
    setShowSuccess(true);
  }

  return (
    <Layout>
      <div className='mx-auto my-8 max-w-4xl px-4 md:px-0'>
        <div className='rounded-xl border border-mpsi bg-white p-8 shadow-sm'>
          <h2 className='mb-6 text-center text-xl font-bold text-[#1D6BF3]'>
            Nouvel utilisateur
          </h2>

          {/* Display form-level errors */}
          {fetcher.data?.errors?.form && (
            <div className='mb-6 rounded-md bg-red-50 p-4 text-red-600'>
              <p>{fetcher.data.errors.form}</p>
            </div>
          )}

          <fetcher.Form
            method='post'
            className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'
          >
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
                className={`w-full rounded-md ${
                  fetcher.data?.errors?.username
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Nom d'utilisateur"
              />
              {fetcher.data?.errors?.username && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.username}
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
                className={`w-full ${
                  fetcher.data?.errors?.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder='exemple@esi.dz'
              />
              {fetcher.data?.errors?.email && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className='w-full'>
              <label
                htmlFor='password'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Mot de passe*
              </label>
              <Input
                id='password'
                name='password'
                type='password'
                className={`w-full ${
                  fetcher.data?.errors?.password
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder='Mot de passe'
              />
              {fetcher.data?.errors?.password && (
                <p className='mt-1 text-sm text-red-500'>
                  {fetcher.data.errors.password}
                </p>
              )}
            </div>

            {/* Empty div for grid alignment */}
            <div className='hidden md:block'></div>

            {/* Submit Button */}
            <div className='col-span-full mt-6 flex justify-center'>
              <Button
                type='submit'
                className='rounded-md bg-[#1D6BF3] px-8 font-medium text-white hover:bg-blue-700 disabled:opacity-70'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className='flex items-center gap-2'>
                    <div className='size-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                    <span>Enregistrement...</span>
                  </div>
                ) : (
                  "Créer l'utilisateur"
                )}
              </Button>
            </div>
          </fetcher.Form>

          {/* Success Modal */}
          {showSuccess && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm'>
              <div className='w-[90%] max-w-lg rounded-lg border border-blue-400 bg-white p-8 text-center shadow-lg'>
                <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100'>
                  <svg
                    className='size-8 text-green-600'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                </div>
                <h3 className='mb-2 text-lg font-semibold text-black'>
                  Utilisateur créé avec succès
                </h3>
                <p className='mb-6 text-sm text-gray-600'>
                  Le nouvel utilisateur a été ajouté avec succès.
                </p>
                <Button
                  onClick={() => navigate('/users')}
                  className='mx-auto rounded-md bg-mpsi font-medium text-white hover:bg-mpsi/90'
                >
                  OK
                </Button>
              </div>
            </div>
          )}
        </div>

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
