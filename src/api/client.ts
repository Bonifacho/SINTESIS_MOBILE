import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// URL base extraída de tu .env
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.X:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor: Inyecta el token antes de cada petición
api.interceptors.request.use(async (config) => {
  // Usamos 'jwt' exactamente como lo definió Claude en authStore.ts
  const token = await SecureStore.getItemAsync('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor: Captura errores (Ej. Token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("Acceso denegado o token expirado.");
    }
    return Promise.reject(error);
  }
);

// Lo exportamos por defecto para que el import api from './client' de Claude funcione
export default api;