import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Inyectar JWT en cada request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Manejo global de errores
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      await SecureStore.deleteItemAsync('jwt');
      await SecureStore.deleteItemAsync('user');
      router.replace('/login' as any);
    }
    return Promise.reject(error);
  }
);

export default api;