import { create } from 'zustand';

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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  
  // FIX 1: Empieza en false. Si estaba en true, la app entera se colgaba al recargar.
  isLoading: false,

  setAuth: async (user, token) => {
    // FIX 2: Autenticación 100% en Memoria RAM para la presentación.
    // Evita los bloqueos silenciosos nativos de Expo SecureStore.
    set({ user, token });
  },

  clearAuth: async () => {
    set({ user: null, token: null });
  },
}));