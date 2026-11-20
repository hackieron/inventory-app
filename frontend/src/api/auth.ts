import api from '@/api/axios';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  email_verified_at?: string | null;
  created_at?: string;
}

export interface ProfileStats {
  items_count: number;
  borrowed_items_count: number;
  contacts_count: number;
}

export interface ProfileData {
  user: User;
  stats: ProfileStats;
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

export async function getProfile(): Promise<ProfileData> {
  const response = await api.get<{ data: ProfileData }>('/profile');
  return response.data.data;
}

export async function updateProfile(data: Pick<User, 'name' | 'email'>): Promise<User> {
  const response = await api.patch<{ data: User }>('/profile', data);
  return response.data.data;
}

export async function updateAvatar(uri: string): Promise<User> {
  const form = new FormData();
  form.append('avatar', { uri, name: 'profile.jpg', type: 'image/jpeg' } as unknown as Blob);
  const response = await api.post<{ data: User }>('/profile/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function updatePassword(data: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await api.patch('/profile/password', data);
}
