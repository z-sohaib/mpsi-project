/**
 * User type definition that matches the API response structure
 */
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_staff?: boolean;
  is_active?: boolean;
}

export interface UserSession {
  userId: string | number;
  access: string;
}

// Define auth response type
export interface AuthResponse {
  user_id: number;
  email: string;
  is_admin: boolean;
  refresh: string;
  access: string;
}

/**
 * Fetch user profile from the API
 */
export async function fetchUserProfile(token: string): Promise<User | null> {
  try {
    const response = await fetch(
      'https://itms-mpsi.onrender.com/api/users/me/',
      {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed');
      }
      throw new Error(`API returned ${response.status}`);
    }

    return (await response.json()) as User;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}

/**
 * Authenticate user with email and password
 */
export async function Login(
  email: string,
  password: string,
): Promise<UserSession | null> {
  try {
    const response = await fetch('https://itms-mpsi.onrender.com/api/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      userId: data.user_id,
      access: data.access,
    };
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
}
