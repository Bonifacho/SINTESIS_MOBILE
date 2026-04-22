import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type Role = 'docente' | 'estudiante' | 'practicante';

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true, // Empezamos en true para buscar sesiones previas al abrir la app

  setAuth: async (user, token) => {
    // Guardamos el token para Axios y el usuario para mantener la sesión viva
    await SecureStore.setItemAsync('jwt', token);
    await SecureStore.setItemAsync('user_session', JSON.stringify(user));
    set({ user, token });
  },

  clearAuth: async () => {
    // Destruimos las llaves reales
    await SecureStore.deleteItemAsync('jwt');
    await SecureStore.deleteItemAsync('user_session');
    set({ user: null, token: null });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('jwt');
      const userStr = await SecureStore.getItemAsync('user_session');
      if (token && userStr) {
        set({ user: JSON.parse(userStr), token, isLoading: false });
        return;
      }
    } catch (e) {
      console.error("Error restaurando sesión:", e);
    }
    set({ isLoading: false });
  }
}));

// Disparamos la recuperación de sesión en cuanto el store se inicializa
useAuthStore.getState().restoreSession();