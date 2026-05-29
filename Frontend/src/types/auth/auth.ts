export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  email: string;
  password?: string;
  fullName: string;
  phoneNumber?: string;
  role?: string;
}

export interface AuthResponse {
  userId: number;
  token: string;
  role: string;
}
