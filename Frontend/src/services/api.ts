import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // needed for Sanctum CSRF
  // Without this, a dead/unreachable backend leaves any request pending
  // forever -- and since AuthContext's initial auth check only clears its
  // full-page loading spinner in a .then()/.catch(), a request that never
  // settles means the app never gets past that spinner. 20s is generous
  // for a normal API call but still bounds the worst case.
  timeout: 20000,
});

// ─── Request Interceptor: attach access token ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') 
    || sessionStorage.getItem('access_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// ─── Response Interceptor: auto-refresh token on 401 ────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint = originalRequest.url?.includes('/auth/login')
      || originalRequest.url?.includes('/auth/register')
      || originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue the request until token is refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token')
        || sessionStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No refresh token, force logout
        clearAuthStorage();
        window.location.href = '/';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const newAccessToken = data.data.tokens.access_token;
        const newRefreshToken = data.data.tokens.refresh_token;

        storeTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthStorage();
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Token Storage Helpers ───────────────────────────────────────────────────

export function storeTokens(
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean = false
) {
  const storage = rememberMe ? localStorage : sessionStorage;
  
  storage.setItem('access_token', accessToken);
  storage.setItem('refresh_token', refreshToken);
  
  // Also store which storage was used so we can clear the right one on logout
  localStorage.setItem('auth_storage', rememberMe ? 'local' : 'session');
}

export function clearAuthStorage() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('cloudclean_user');
  localStorage.removeItem('auth_storage');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
  sessionStorage.removeItem('cloudclean_user');
}

export function getStoredToken(): string | null {
  return localStorage.getItem('access_token') 
    || sessionStorage.getItem('access_token');
}

export default api;