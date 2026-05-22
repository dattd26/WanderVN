export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  email: string;
  password?: string;
  fullName: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  token: string;
  role: string;
}
