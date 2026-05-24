// src/store/themeStore.ts
// Store de tema claro/oscuro — persiste en SecureStore igual que authStore.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const secureAdapter: StateStorage = {
  getItem: async (name) => {
    if (Platform.OS === 'web') return localStorage.getItem(name);
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name, value) => {
    if (Platform.OS === 'web') { localStorage.setItem(name, value); return; }
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name) => {
    if (Platform.OS === 'web') { localStorage.removeItem(name); return; }
    await SecureStore.deleteItemAsync(name);
  },
};

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((s) => ({ isDark: !s.isDark })),
    }),
    {
      name: 'sintesis-theme',
      storage: createJSONStorage(() => secureAdapter),
    }
  )
);
