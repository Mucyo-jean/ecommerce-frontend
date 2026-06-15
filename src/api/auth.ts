import { api } from '../lib/api';
import type { ApiResponse, AuthResult, AuthTokens, User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function register(payload: RegisterPayload) {
  const res = await api.post<ApiResponse<AuthResult>>('/auth/register', payload);
  return res.data.data;
}

export async function login(payload: LoginPayload) {
  const res = await api.post<ApiResponse<AuthResult>>('/auth/login', payload);
  return res.data.data;
}

export async function refresh(refreshToken: string) {
  const res = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken });
  return res.data.data;
}

export async function me() {
  const res = await api.get<ApiResponse<User>>('/auth/me');
  return res.data.data;
}
