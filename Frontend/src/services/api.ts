import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Needed so the browser sends the HttpOnly refresh_token cookie
  // (Path=/api/auth) to /auth/refresh and /auth/logout.
  withCredentials: true,
  // Without this, a dead/unreachable backend leaves any request pending
  // forever -- and since AuthContext's initial auth check only clears its
  // full-page loading spinner once its requests settle, a request that never
  // settles means the app never gets past that spinner. 20s is generous
  // for a normal API call but still bounds the worst case.
  timeout: 20000,
});

// ─── Access token: memory only ───────────────────────────────────────────────
// The access token is never written to localStorage/sessionStorage, so an XSS
// payload can't lift a long-lived credential from web storage. The refresh
// token lives in an HttpOnly cookie that JS can't read at all; after a page
// reload the session is restored with refreshSession().

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

// ─── Silent refresh (de-duplicated) ──────────────────────────────────────────
// Every concurrent caller (the 401 interceptor, AuthContext on load, React
// StrictMode's double-invoked effect, ...) shares ONE in-flight request.
// Refresh tokens rotate on every use, so two parallel refreshes would have
// the second one present an already-revoked token.

let refreshPromise: Promise<string | null> | null = null;

export function refreshSession(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${BASE}/auth/refresh`, {}, {
        withCredentials: true,
        headers: { Accept: 'application/json' },
        timeout: 20000,
      })
      .then(({ data }) => {
        const token: string | null = data?.data?.tokens?.access_token ?? null;
        setAccessToken(token);
        return token;
      })
      .catch(() => {
        clearAccessToken();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// ─── Request Interceptor: attach access token ────────────────────────────────
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
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

    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login')
      || originalRequest?.url?.includes('/auth/register')
      || originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
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

      try {
        const newAccessToken = await refreshSession();
        if (!newAccessToken) throw error;

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthStorage();
        // Guard against a reload loop if a request made on '/' itself 401s.
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Storage cleanup ─────────────────────────────────────────────────────────

// Keys older builds kept tokens/user under. Nothing writes them any more.
// ('cloudclean_cart' is deliberately not touched.)
const LEGACY_AUTH_KEYS = ['access_token', 'refresh_token', 'auth_storage', 'cloudclean_user'];

function removeLegacyAuthKeys() {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      LEGACY_AUTH_KEYS.forEach((key) => storage.removeItem(key));
    } catch {
      // Storage can be unavailable (privacy mode, blocked site data) -- nothing to clean.
    }
  }
}

export function clearAuthStorage() {
  clearAccessToken();
  removeLegacyAuthKeys();
}

// One-time cleanup for users upgrading from the web-storage build, so old
// tokens don't linger in storage even if they never log out.
removeLegacyAuthKeys();

export default api;
