import api, { storeTokens, clearAuthStorage } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_number?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'delivery' | 'supervisor' | 'customer';
  phone_number?: string;
  email_verified: boolean;
  avatar: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export const authService = {

  async register(payload: RegisterPayload) {
    const { data } = await api.post('/auth/register', payload);
    return data; // { success, message, data: { user_id, email, requires_verification } }
  },

  async verifyEmail(email: string, otp: string) {
    const { data } = await api.post('/auth/verify-email', { email, otp });
    if (data.success) {
      storeTokens(
        data.data.tokens.access_token,
        data.data.tokens.refresh_token,
        false // after email verify, default no remember
      );
    }
    return data; // { success, message, data: { user, tokens } }
  },

  async resendOtp(email: string, type: 'email_verification' | 'password_reset') {
    const { data } = await api.post('/auth/resend-otp', { email, type });
    return data;
  },

  async login(payload: LoginPayload) {
    const { data } = await api.post('/auth/login', payload);
    if (data.success) {
      storeTokens(
        data.data.tokens.access_token,
        data.data.tokens.refresh_token,
        payload.remember_me ?? false
      );
    }
    return data; // { success, message, data: { user, tokens, remember_me } }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuthStorage();
    }
  },

  async me(): Promise<AuthUser | null> {
    try {
      const { data } = await api.get('/auth/me');
      return data.data.user;
    } catch {
      return null;
    }
  },

  async forgotPassword(email: string) {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  async verifyPasswordResetOtp(email: string, otp: string) {
    const { data } = await api.post('/auth/verify-reset-otp', { email, otp });
    return data; // { success, data: { email, reset_token } }
  },

  async resetPassword(email: string, otp: string, password: string, password_confirmation: string) {
    const { data } = await api.post('/auth/reset-password', {
      email,
      otp,
      password,
      password_confirmation,
    });
    return data;
  },
};

export default authService;