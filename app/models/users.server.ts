/**
 * Server-side functions for user management
 */

export type User = {
  id: number;
  username: string;
  email: string;
  password?: string; // Only used for creation, not returned in GET responses
};

/**
 * Fetch all users from the API
 * SERVER-ONLY function
 */
export async function fetchUsers(token: string): Promise<User[]> {
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

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed');
      }
      throw new Error(`API returned ${response.status}`);
    }

    return (await response.json()) as User[];
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
): Promise<User | null> {
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
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API returned ${response.status}`);
    }

    return (await response.json()) as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
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
): Promise<User> {
  try {
    const response = await fetch(
      'https://itms-mpsi.onrender.com/api/admin/users/create/',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(userData),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      try {
        // Try to parse error as JSON
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.detail || `API Error: ${response.status}`);
      } catch (e) {
        // If can't parse as JSON, use text directly
        throw new Error(
          `API Error: ${response.status} - ${errorText || 'Unknown error'}`,
        );
      }
    }

    return (await response.json()) as User;
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
  updates: Partial<User>,
): Promise<User | null> {
  try {
    const response = await fetch(
      `https://itms-mpsi.onrender.com/api/admin/users/${userId}/`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(updates),
      },
    );

    if (!response.ok) {
      console.error('Failed to update user:', response.statusText);
      throw new Error(`API returned ${response.status}`);
    }

    return (await response.json()) as User;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
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
          Accept: 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      },
    );

    if (!response.ok) {
      console.error('Failed to update password:', response.statusText);
      throw new Error(`API returned ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to update password:', error);
    throw error;
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
        },
      },
    );

    if (!response.ok) {
      console.error('Failed to delete user:', response.statusText);
      throw new Error(`API returned ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
}
