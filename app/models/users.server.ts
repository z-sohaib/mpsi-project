/**
 * Consolidated server-side functions for user management
 */
import { AdminUser, User, UserSession } from '../types/user';

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
 * Fetch all users from the API
 * SERVER-ONLY function
 */
export async function fetchUsers(token: string): Promise<AdminUser[]> {
  try {
    const response = await fetch(
      'https://itms-mpsi.onrender.com/api/admin/users/',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    return (await response.json()) as AdminUser[];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

/**
 * Fetch a single user by ID
 */
export async function fetchUserById(
  token: string,
  userId: string,
): Promise<AdminUser | null> {
  try {
    const response = await fetch(
      `https://itms-mpsi.onrender.com/api/admin/users/${userId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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

    return (await response.json()) as AdminUser;
  } catch (error) {
    console.error('Failed to fetch user by ID:', error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(
  token: string,
  userData: {
    username: string;
    email: string;
    password: string;
  },
): Promise<AdminUser> {
  try {
    const response = await fetch(
      'https://itms-mpsi.onrender.com/api/admin/users/',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      },
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return (await response.json()) as AdminUser;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

/**
 * Update a user by ID
 */
export async function updateUserById(
  token: string,
  userId: string,
  updates: Partial<AdminUser>,
): Promise<AdminUser | null> {
  try {
    const response = await fetch(
      `https://itms-mpsi.onrender.com/api/admin/users/${userId}/`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed');
      }
      throw new Error(`API returned ${response.status}`);
    }

    return (await response.json()) as AdminUser;
  } catch (error) {
    console.error('Failed to update user by ID:', error);
    return null;
  }
}

/**
 * Update a user's password
 */
export async function updateUserPassword(
  token: string,
  userId: string,
  newPassword: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://itms-mpsi.onrender.com/api/admin/users/${userId}/password/`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      },
    );

    return response.ok;
  } catch (error) {
    console.error('Failed to update user password:', error);
    return false;
  }
}

/**
 * Delete a user by ID
 */
export async function deleteUserById(
  token: string,
  userId: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://itms-mpsi.onrender.com/api/admin/users/${userId}/`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.ok;
  } catch (error) {
    console.error('Failed to delete user by ID:', error);
    return false;
  }
}
