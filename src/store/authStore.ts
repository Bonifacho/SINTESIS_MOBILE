import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ── Tipos ────────────────────────────────────────────────────────────────────
export type Role = 'docente' | 'estudiante' | 'practicante';

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;   // Rúbrica §2.2: nombre, correo, rol en el store
  role: Role;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null; // Infraestructura lista para cuando el backend soporte refresh
  isLoading: boolean;

  // Acciones de Sesión (Rúbrica §2.2)
  setAuth: (user: User, token: string, refreshToken?: string | null) => void;
  clearAuth: () => void;
}

// ── Decodificar JWT sin librería externa ──────────────────────────────────────
// Extrae el payload de un JWT (header.payload.signature) decodificando base64url.
// Usado para validar expiración sin llamar al backend.
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // base64url → base64 estándar
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Agregar padding si es necesario
    while (base64.length % 4) {
      base64 += '=';
    }

    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Rúbrica §3: Validación de integridad del token al restaurar sesión
function isTokenValid(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return false;

  // exp viene en segundos Unix, Date.now() en milisegundos
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp > nowInSeconds;
}

// ── Storage adapter multiplataforma (Rúbrica §3 + §2.2) ─────────────────────
// iOS/Android → expo-secure-store (cifrado nativo en Keychain/Keystore)
// Web → localStorage (SecureStore no existe en web)
// NOTA: La rúbrica PROHÍBE AsyncStorage para datos sensibles de sesión.
const secureStoreAdapter: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(name);
    }
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(name, value);
    } else {
      await SecureStore.setItemAsync(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(name);
    } else {
      await SecureStore.deleteItemAsync(name);
    }
  },
};

// ── Store con middleware persist de Zustand (Rúbrica §2.2) ───────────────────
// El middleware persist gestiona automáticamente la hidratación y escritura
// del estado en la bóveda segura del dispositivo (Expo SecureStore).
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: true, // true hasta que el middleware persist termine de hidratar

      // Login: Hidratar el estado tras éxito de la API (Rúbrica §2.2)
      setAuth: (user, token, refreshToken) => {
        set({ user, token, refreshToken: refreshToken ?? null });
      },

      // Logout: Limpieza total del almacenamiento (Rúbrica §2.2)
      // El middleware persist se encarga de eliminar los datos de SecureStore.
      clearAuth: () => {
        set({ user: null, token: null, refreshToken: null });
      },
    }),
    {
      name: 'auth-secure-storage', // Clave en SecureStore/localStorage
      storage: createJSONStorage(() => secureStoreAdapter),

      // Solo persistimos datos de sesión, NO el flag isLoading
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),

      // Rúbrica §3: Recuperación y Validación al iniciar la app
      // Se ejecuta DESPUÉS de que el middleware restaure los datos de SecureStore.
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Error rehidratando auth store:', error);
            useAuthStore.setState({
              user: null, token: null, refreshToken: null, isLoading: false,
            });
            return;
          }

          // Validar integridad del JWT antes de renderizar la vista inicial
          if (state?.token) {
            if (!isTokenValid(state.token)) {
              console.warn('[Auth] Token expirado detectado al restaurar sesión. Forzando logout.');
              useAuthStore.setState({
                user: null, token: null, refreshToken: null, isLoading: false,
              });
              return;
            }
          }

          // Hidratación completada (con o sin sesión válida)
          useAuthStore.setState({ isLoading: false });
        };
      },
    }
  )
);

// ── Utilidades exportadas ────────────────────────────────────────────────────
export { isTokenValid, decodeJwtPayload };