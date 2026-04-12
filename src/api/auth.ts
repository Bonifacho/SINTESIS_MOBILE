import api from './client';

export interface LoginPayload {
  username: string;
  password: string;
}

// Respuesta RAW que devuelve el backend
interface BackendLoginResponse {
  access_token: string;
  user: {
    user_id: number;
    username: string;
    roles: string[];
  };
}

// Forma normalizada que usa el frontend
export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    full_name: string;
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
      user: {
        id:        raw.user.user_id,
        username:  raw.user.username,
        full_name: raw.user.username, // el backend no devuelve full_name en login
        role:      (raw.user.roles[0] ?? 'estudiante') as AuthResponse['user']['role'],
      },
    };
  },

  logout: () =>
    api.post('/api/v1/security/logout'),
};