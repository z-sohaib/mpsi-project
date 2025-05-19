/**
 * User type definition that matches the API response structure
 */
export interface User {
  id: string | number; // Using the user_id from API but renamed to id for consistency
  user_id: number;
  email: string;
  is_admin: boolean;
  refresh: string;
  access: string;
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

// Map the API response to our User type
export function mapApiResponseToUser(data: AuthResponse): User {
  return {
    id: data.user_id, // Map user_id to id for internal use
    user_id: data.user_id,
    email: data.email,
    is_admin: data.is_admin,
    refresh: data.refresh,
    access: data.access,
  };
}
