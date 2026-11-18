import api, { setAccessToken, clearAuthStorage } from './api';

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
  role: 'admin' | 'staff' | 'staffsupervisor' | 'customer';
  phone_number?: string;
  email_verified: boolean;
  avatar: string;
}

// The refresh token is never in a response body: it lives only in an
// HttpOnly cookie (Path=/api/auth) that JS cannot read.
export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number; // seconds (900 = 15 minutes)
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
      // Access token in memory only; the backend set the refresh cookie
      // (session cookie -- no "remember me" after email verification).
      setAccessToken(data.data.tokens.access_token);
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
      // remember_me (sent in the body) decides server-side whether the
      // refresh cookie is persistent or a session cookie.
      setAccessToken(data.data.tokens.access_token);
    }
    return data; // { success, message, data: { user, tokens, remember_me } }
  },

  async logout() {
    try {
      // Server revokes tokens and clears the refresh cookie.
      await api.post('/auth/logout', {}, { withCredentials: true });
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