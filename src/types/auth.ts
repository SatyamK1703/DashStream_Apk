// src/types/auth.ts

export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  phone: string;
  role: 'customer' | 'professional' | 'admin';
  profileImage?: string;
  profileComplete: boolean;
  isPhoneVerified: boolean;
  displayName?: string;
  isGuest?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
  errorCode?: string;
}

export interface OtpResponse {
  success: boolean;
  message?: string;
  error?: string;
  errorCode?: string;
  phone?: string;
}