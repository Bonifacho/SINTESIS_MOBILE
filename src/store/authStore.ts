import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type Role = 'docente' | 'estudiante';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync('jwt', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    set({ user, token });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('jwt');
    await SecureStore.deleteItemAsync('user');
    set({ user: null, token: null });
  },

  loadFromStorage: async () => {
    try {
      const token = await SecureStore.getItemAsync('jwt');
      const raw   = await SecureStore.getItemAsync('user');
      const user  = raw ? (JSON.parse(raw) as User) : null;
      set({ token, user, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));