import api from '@/api/axios';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  email_verified_at?: string | null;
}

interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function register(
  data: RegisterData
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    '/register',
    data
  );

  return response.data;
}

export async function login(
  data: LoginData
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    '/login',
    data
  );

  return response.data;
}

export async function logout(): Promise<void> {
  await api.post('/logout');
}

export async function getUser(): Promise<User> {
  const response = await api.get<{ user: User }>('/user');

  return response.data.user;
}