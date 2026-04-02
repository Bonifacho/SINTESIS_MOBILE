import api from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    role: 'docente' | 'estudiante';
  };
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload),

  me: () =>
    api.get<AuthResponse['user']>('/auth/me'),
};