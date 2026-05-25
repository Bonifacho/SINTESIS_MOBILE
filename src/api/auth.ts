import api from './client';

export interface LoginPayload {
  username: string;
  password: string;
}

// Respuesta RAW que devuelve el backend actualmente
interface BackendLoginResponse {
  access_token: string;
  refresh_token?: string; // Preparado para cuando el backend lo implemente
  user: {
    user_id: number;
    username: string;
    full_name: string;
    email?: string;
    document_id?: string;
    created_at?: string;
    roles: string[];
  };
}

// Forma normalizada que usa todo el frontend
export interface AuthResponse {
  access_token: string;
  refresh_token: string | null;
  user: {
    id: number;
    username: string;
    full_name: string;
    email: string;
    document_id?: string;
    created_at?: string;
    role: 'docente' | 'estudiante' | 'practicante';
  };
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post<BackendLoginResponse>(
      '/api/v1/security/login', payload
    );
    const raw = res.data;

    // Normalizamos aquí para que el resto del frontend
    // nunca sepa que el backend usa arrays y user_id
    return {
      access_token: raw.access_token,
      refresh_token: raw.refresh_token ?? null,
      user: {
        id:        raw.user.user_id,
        username:  raw.user.username,
        full_name: raw.user.full_name || raw.user.username,
        email:     raw.user.email ?? '',
        document_id: raw.user.document_id ?? '',
        created_at: raw.user.created_at ?? '',
        role:      (raw.user.roles[0] ?? 'estudiante') as AuthResponse['user']['role'],
      },
    };
  },

  logout: () =>
    api.post('/api/v1/security/logout'),

  /**
   * Renueva el access_token usando el refresh_token.
   * 
   * ESTADO: El backend aún NO soporta este endpoint.
   * La infraestructura del frontend está lista. Cuando el backend implemente
   * POST /api/v1/security/refresh, este método se conectará automáticamente
   * a través del interceptor de client.ts (línea ~100).
   */
  refresh: async (refreshToken: string): Promise<{ access_token: string }> => {
    const res = await api.post('/api/v1/security/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    return res.data;
  },
};