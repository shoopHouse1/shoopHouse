import { create } from 'zustand';
import { UserRole } from '@shoophouse/shared';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleId: number;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: (() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  })(),
  accessToken: localStorage.getItem('accessToken'),
  setAuth: (user, token) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, accessToken: token });
  },
  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ user: null, accessToken: null });
  },
  isAuthenticated: () => !!get().accessToken && !!get().user,
  hasRole: (role) => {
    const user = get().user;
    if (!user) return false;
    // Check if user has the specified role OR if roleId=4 (admin equivalent) and checking for admin role
    return user.role === role || (user.roleId === 4 && role === UserRole.ADMIN);
  },
}));


