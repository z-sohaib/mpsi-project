import { createCookieSessionStorage, redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { User, UserSession } from './models/user';

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set');

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
});

const USER_SESSION_KEY = 'userId';
const TOKEN_SESSION_KEY = 'access';

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  return sessionStorage.getSession(cookie);
}

export async function getUserId(
  request: Request,
): Promise<UserSession | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  const access = session.get(TOKEN_SESSION_KEY);
  return {
    userId,
    access,
  };
}

// Add a mock function for getUserById as this wasn't defined
// In a real application, this would fetch the user from the API or database
async function getUserById(userId: string | number): Promise<User | null> {
  // This is a placeholder - in a real app, you would fetch the user from your API
  try {
    const response = await fetch(
      `https://itms-mpsi.onrender.com/api/users/${userId}/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getUser(request: Request) {
  const session = await getUserId(request);
  if (!session || session.userId === undefined) return null;

  const user = await getUserById(session.userId);
  if (user) return user;

  throw await logout(request);
}

export async function requireUserId(request: Request) {
  const session = await getUserId(request);
  if (!session?.userId) {
    throw redirect(`/auth`);
  }
  return session;
}

export async function requireUser(request: Request) {
  const session = await requireUserId(request);

  const user = await getUserById(session.userId);
  if (user) return user;

  throw await logout(request);
}

export async function createUserSession({
  request,
  userId,
  access,
  redirectTo,
}: {
  request: Request;
  userId: string;
  access: string;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  session.set(TOKEN_SESSION_KEY, access);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 7,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}
