import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer' | 'auditor';
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, accessToken?: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user, _accessToken, _refreshToken) => {
        // Token is managed by httpOnly cookies set by the server.
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        // Server will clear httpOnly cookies on /api/v1/auth/logout
        set({ user: null, isAuthenticated: false });
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'tonghua-admin-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
