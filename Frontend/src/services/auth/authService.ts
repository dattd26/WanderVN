import { request } from '../shared/apiClient';
import type { LoginCredentials, RegisterData, AuthResponse } from '../../types/auth/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (data: RegisterData): Promise<void> => {
    return request<void>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (payload: { oldPassword: string; newPassword: string }): Promise<boolean> => {
    return request<boolean>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
