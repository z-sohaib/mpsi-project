/**
 * User type definitions
 */

// User type from users.server.ts
export type AdminUser = {
  id: number;
  username: string;
  email: string;
  password?: string; // Only used for creation, not returned in GET responses
};

// User type from user.ts
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
  username?: string;
  email?: string;
}

// Define auth response type
export interface AuthResponse {
  user_id: number;
  email: string;
  username: string;
  is_admin: boolean;
  refresh: string;
  access: string;
}

export interface UserResponse {
  id: string;
  email: string;
  token: string;
}
