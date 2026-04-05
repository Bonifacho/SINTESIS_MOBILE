import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type Role = 'student' | 'teacher' | null;

interface AuthState {
  token: string | null;
  role: Role;
  isLoading: boolean;
  
  // Acciones
  setSession: (token: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  isLoading: true, // Empieza cargando mientras revisa si hay un token guardado

  setSession: async (token: string, role: Role) => {
    await SecureStore.setItemAsync('sintesis_jwt', token);
    await SecureStore.setItemAsync('sintesis_role', role as string);
    set({ token, role });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('sintesis_jwt');
    await SecureStore.deleteItemAsync('sintesis_role');
    set({ token: null, role: null });
  },

  checkSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('sintesis_jwt');
      const role = await SecureStore.getItemAsync('sintesis_role') as Role;
      set({ token, role, isLoading: false });
    } catch (error) {
      set({ token: null, role: null, isLoading: false });
    }
  },
}));