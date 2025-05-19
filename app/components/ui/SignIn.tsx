import { useRef } from 'react';
import {
  Form,
  useActionData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react';

type AuthActionData = {
  errors?: {
    email: string | null;
    password: string | null;
  };
  user?: {
    token: string;
  };
};

// This component is now designed to work with the auth route's action
export default function SignIn() {
  const actionData = useActionData<AuthActionData>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/rigl';

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className='flex min-h-screen w-[500px] items-center justify-center px-4 sm:px-6 lg:px-8'>
      <div className='w-full rounded-2xl border-2 border-blue-500 bg-white p-8 shadow-lg'>
        <h2 className='mb-2 text-xl'>
          <span className='text-gray-900'>Welcome to</span>{' '}
          <span className='text-blue-500'>ESI ITMS</span>
        </h2>
        <h3 className='mb-6 text-center text-3xl font-bold'>Sign in</h3>

        <Form method='post' className='space-y-4'>
          <div>
            <label htmlFor='email' className='mb-2 block text-sm font-semibold'>
              Username or email address
            </label>
            <input
              id='email'
              name='email'
              type='email'
              ref={emailRef}
              required
              autoComplete='email'
              placeholder='Username or email address'
              aria-invalid={actionData?.errors?.email ? true : undefined}
              aria-describedby='email-error'
              className='w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            {actionData?.errors?.email ? (
              <div className='pt-1 text-sm text-red-500' id='email-error'>
                {actionData.errors.email}
              </div>
            ) : null}
          </div>

          <div>
            <label
              htmlFor='password'
              className='mb-2 block text-sm font-semibold'
            >
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              ref={passwordRef}
              required
              autoComplete='current-password'
              placeholder='Password'
              aria-invalid={actionData?.errors?.password ? true : undefined}
              aria-describedby='password-error'
              className='w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            {actionData?.errors?.password ? (
              <div className='pt-1 text-sm text-red-500' id='password-error'>
                {actionData.errors.password}
              </div>
            ) : null}
          </div>

          <div className='text-right'>
            <button
              type='button'
              onClick={() => alert('Redirect to password recovery')}
              className='text-sm text-blue-500 hover:underline'
            >
              Forgot Password?
            </button>
          </div>

          <input type='hidden' name='redirectTo' value={redirectTo} />

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full rounded-lg bg-blue-500 py-2 text-white shadow-md transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70'
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </Form>
      </div>
    </div>
  );
}
