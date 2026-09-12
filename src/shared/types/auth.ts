export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error?: string | null;
}
