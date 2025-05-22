import { useRouteLoaderData } from '@remix-run/react';
import { UserSession } from '~/models/user';

// User data interface
export interface UserData {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
}

// Root loader data structure
export interface RootLoaderData {
  userSession: UserSession | undefined;
  userData?: UserData | null;
  userLoading: boolean;
  userError?: string | null;
}

// Hook to access the user data from any route
export function useUserData(): RootLoaderData {
  // Get data from the root loader
  const data = useRouteLoaderData('root') as RootLoaderData | undefined;

  // Apply defaults if the data is missing
  return {
    userSession: data?.userSession,
    userData: data?.userData,
    userLoading: data?.userLoading === true, // Make sure it's boolean
    userError: data?.userError,
  };
}
