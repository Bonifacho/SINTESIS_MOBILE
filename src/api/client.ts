import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// URL de tu backend (Ajustar según donde esté corriendo tu Python/FastAPI)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Antes de que salga cualquier petición, le pegamos el JWT
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('sintesis_jwt');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error obteniendo el token de seguridad', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);