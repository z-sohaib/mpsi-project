import { User, AuthResponse, mapApiResponseToUser } from './user';

export interface UserResponse {
  id: string;
  email: string;
  token: string;
}

/**
 * Verify user login credentials against the API
 * @param email - User email
 * @param password - User password
 * @returns User if successful, null if failed
 */
export async function Login(
  email: string,
  password: string,
): Promise<User | null> {
  try {
    const response = await fetch('https://itms-mpsi.onrender.com/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as AuthResponse;

    // Map the API response to our User type
    return mapApiResponseToUser(data);
  } catch (error) {
    console.error('Login verification error:', error);
    return null;
  }
}
