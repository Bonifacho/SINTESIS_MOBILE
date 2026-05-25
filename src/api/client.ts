import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

// ── Instancia Axios (Rúbrica §5) ────────────────────────────────────────────
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.X:3000').trim();

const api = axios.create({
  baseURL: API_URL.replace(/\/+$/, ''),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // Aumentado a 30s para evitar fallos por "cold start" en servidores gratuitos como Railway
});

// ── Interceptor de Logs Visuales para Capturas de Pantalla ─────────────────
api.interceptors.request.use((config) => {
  console.log(`\n📤 [ENVIANDO] ${config.method?.toUpperCase()} ${config.url}`);
  if (config.data) {
    console.log('📦 Payload:', JSON.stringify(config.data, null, 2));
  }
  return config;
});

api.interceptors.response.use((response) => {
  console.log(`\n📥 [RECIBIDO] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
  if (response.data) {
    // Si es el login, mostramos el JSON para la captura del token
    if (response.config.url?.includes('login')) {
      console.log('✅ Response Data:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('✅ Response Data: [Datos recibidos correctamente]');
    }
  }
  return response;
});

console.log('🔗 [API_CLIENT] Iniciando con baseURL:', api.defaults.baseURL);

// ── Request Interceptor: Inyecta JWT + Guard de escritura Trainee (Rúbrica §4 + §5) ─
// 1. Lee el token del store de Zustand y lo inyecta en el header Authorization.
// 2. RBAC lógico: bloquea peticiones de escritura (POST/PUT/DELETE) para practicantes.
//    La rúbrica exige que el Guard deshabilite "visualmente y a nivel de lógica"
//    cualquier acción de escritura para el rol practicante.

// Endpoints de escritura permitidos para TODOS los roles (incluido practicante)
const TRAINEE_WRITE_WHITELIST = [
  '/api/v1/security/login',
  '/api/v1/security/logout',
  '/api/v1/security/refresh',
  '/api/v1/academic/progress', // Tracking silencioso (no es una acción de escritura del usuario)
];

api.interceptors.request.use(
  (config) => {
    try {
      const { token, user } = useAuthStore.getState();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Rúbrica §4: Guard lógico — bloquear escritura para practicante
      if (user?.role === 'practicante') {
        const method = (config.method ?? 'get').toLowerCase();
        const isWriteMethod = ['post', 'put', 'patch', 'delete'].includes(method);
        const url = config.url ?? '';
        const isWhitelisted = TRAINEE_WRITE_WHITELIST.some(ep => url.includes(ep));

        if (isWriteMethod && !isWhitelisted) {
          console.warn(`[RBAC] Practicante bloqueado: ${method.toUpperCase()} ${url}`);
          return Promise.reject(new Error(
            'Acceso denegado: los practicantes tienen permisos de solo lectura.'
          ));
        }
      }
    } catch (error) {
      console.warn('[API] Error en request interceptor:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Manejo de errores HTTP (Rúbrica §5) ────────────────
// Patrón de Refresh Queue: evita múltiples refreshes simultáneos.
// Cuando una petición falla con 401, se intenta renovar el token.
// Si ya hay un refresh en curso, las peticiones se encolan y se reintentan
// automáticamente cuando el nuevo token llega.
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // ── 301 Moved Permanently (Rúbrica §5) ──────────────────────────────
    // Registrar en logs internos para trazabilidad de migración de endpoints.
    if (status === 301) {
      console.warn(
        '[API] 301 Moved Permanently:',
        originalRequest?.url,
        '→ Location:',
        error.response?.headers?.location ?? 'N/A'
      );
    }

    // ── 403 Forbidden (Rúbrica §5) ──────────────────────────────────────
    // Limpiar authStore + redirigir a Login para prevenir accesos residuales.
    // La redirección ocurre reactivamente: _layout.tsx detecta token=null y redirige.
    if (status === 403) {
      console.error('[API] 403 Forbidden — limpiando sesión. Acceso denegado.');
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    // ── 401 Unauthorized — Intento de refresh silencioso ─────────────────
    // Rúbrica §3 + PPTX Slide 37: Ante token expirado, intentar renovación
    // transparente sin interrumpir al usuario.
    if (status === 401 && !originalRequest?._retry) {
      const { refreshToken } = useAuthStore.getState();

      // Sin refresh token → forzar logout inmediato
      if (!refreshToken) {
        console.warn('[API] 401 sin refresh token disponible. Forzando logout.');
        useAuthStore.getState().clearAuth();
        return Promise.reject(error);
      }

      // Si ya hay un refresh en curso, encolar la petición fallida
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      // Iniciar refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Usamos axios directamente (sin nuestra instancia `api`) para evitar
        // que el interceptor capture un 401 del propio endpoint de refresh.
        const res = await axios.post(
          `${API_URL.replace(/\/+$/, '')}/api/v1/security/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );

        const newAccessToken: string = res.data.access_token;
        const { user } = useAuthStore.getState();

        if (user && newAccessToken) {
          // Actualizamos el store con el nuevo access_token
          useAuthStore.getState().setAuth(user, newAccessToken, refreshToken);
          processQueue(null, newAccessToken);

          // Reintentamos la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }

        throw new Error('Refresh exitoso pero sin datos válidos');
      } catch (refreshError) {
        // Refresh falló → limpiar sesión (el usuario deberá loguearse de nuevo)
        console.error('[API] Refresh token falló. Forzando logout:', refreshError);
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;