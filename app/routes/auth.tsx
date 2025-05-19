import type {
  MetaFunction,
  LinksFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/node';
import { data } from '@remix-run/node';
import { redirect, useActionData } from '@remix-run/react';
import { useEffect, useRef } from 'react';
import Header from '../components/ui/Header';
import { Login } from '~/models/user.server';
import { createUserSession, getUserId } from '~/session.server';

export const meta: MetaFunction = () => [
  { title: 'ESI - Système de gestion de maintenance' },
  {
    name: 'description',
    content:
      "Connectez-vous à la plateforme de gestion de maintenance de l'ESI.",
  },
];

export const links: LinksFunction = () => [
  // si vous avez des styles ou fonts supplémentaires, importez-les ici
];

// Create validation functions since they're missing
const validateEmail = (email: unknown): email is string => {
  return typeof email === 'string' && email.length > 3 && email.includes('@');
};

const safeRedirect = (
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = '/dashboard',
): string => {
  if (!to || typeof to !== 'string') {
    return defaultRedirect;
  }

  if (!to.startsWith('/') || to.startsWith('//')) {
    return defaultRedirect;
  }

  return to;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getUserId(request);
  if (session && session.userId) return redirect('/dashboard');
  return data({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/dashboard');

  if (!validateEmail(email)) {
    return data(
      { errors: { email: 'Email invalide', password: null } },
      { status: 400 },
    );
  }

  if (typeof password !== 'string' || password.length === 0) {
    return data(
      { errors: { email: null, password: 'Mot de passe requis' } },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return data(
      { errors: { email: null, password: 'Mot de passe trop court' } },
      { status: 400 },
    );
  }

  // Server-side verification (will be handled differently in non-SSR context)
  const userData = await Login(email as string, password);

  if (!userData) {
    return data(
      { errors: { email: 'Email ou mot de passe incorrect', password: null } },
      { status: 400 },
    );
  }

  return createUserSession({
    redirectTo,
    request,
    access: userData.access,
    userId: userData.id as string,
  });
};

type ActionData = {
  errors?: {
    email: string | null;
    password: string | null;
  };
  user?: {
    token: string;
  };
};

export default function Auth() {
  // Get any errors from the action
  const actionData = useActionData<ActionData>();
  // const [searchParams] = useSearchParams();
  // const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Automatically focus on the field with error
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  // Check for successful login from action data
  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className='min-h-screen bg-white'>
      <Header />
    </div>
  );
}
