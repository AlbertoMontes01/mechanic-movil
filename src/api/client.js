// Talks to our own Express/Prisma backend. Shaped as
// api.entities.X.list/get/filter/create/update/delete, api.auth.* so the
// pages that use it stay simple and consistent across resources.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'mechanic_movil_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Access tokens are short-lived (15m) by design — the long-lived credential
// is a refresh token the backend holds in an httpOnly cookie (never
// readable from JS, so an XSS bug can't steal a 30-day session, only
// whatever's left of the current 15-minute access token). When a request
// comes back 401, silently exchange that cookie for a new access token via
// /auth/refresh and retry once before giving up. Concurrent 401s share one
// in-flight refresh instead of each firing their own.
let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('refresh failed');
        const data = await res.json();
        setToken(data.token);
        return data.token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request(path, { method = 'GET', body, isForm = false, _retried = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  // A FormData body sets its own multipart Content-Type (with boundary) --
  // setting it manually here would break the upload.
  if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    // Needed so the httpOnly refresh-token cookie (scoped to /api/auth) is
    // sent/received — harmless for every other path, the browser just
    // won't have a matching cookie to attach.
    credentials: 'include',
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  // /auth/me legitimately benefits from an auto-refresh retry (that's how a
  // page load with an expired/missing access token silently restores the
  // session via the cookie) — only exclude the endpoints where a 401 is
  // either the normal outcome (bad login) or would recurse into itself.
  const NO_RETRY_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout', '/auth/forgot-password', '/auth/reset-password'];
  if (res.status === 401 && !_retried && !NO_RETRY_PATHS.some((p) => path.startsWith(p))) {
    try {
      await refreshAccessToken();
      return request(path, { method, body, isForm, _retried: true });
    } catch {
      clearToken();
      // fall through and let the original 401 response below report the error
    }
  }

  if (res.status === 204) return null;

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error((isJson && data?.error) || `Request failed (${res.status})`);
  }
  return data;
}

function toQuery(params) {
  const qs = new URLSearchParams(params).toString();
  return qs ? `?${qs}` : '';
}

// filterKeyMap maps a filter({ client_id: x }) key to the backend's query
// param name, e.g. { client_id: 'clientId' }.
function makeEntity(basePath, filterKeyMap = {}) {
  return {
    list: () => request(basePath),
    filter: (params = {}) => {
      const mapped = Object.fromEntries(
        Object.entries(params).map(([k, v]) => [filterKeyMap[k] || k, v])
      );
      return request(`${basePath}${toQuery(mapped)}`);
    },
    get: (id) => request(`${basePath}/${id}`),
    create: (data) => request(basePath, { method: 'POST', body: data }),
    update: (id, data) => request(`${basePath}/${id}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`${basePath}/${id}`, { method: 'DELETE' }),
  };
}

export const api = {
  entities: {
    Client: makeEntity('/clients'),
    Vehicle: makeEntity('/vehicles', { client_id: 'clientId' }),
    InventoryCategory: makeEntity('/inventory/categories'),
    InventoryItem: makeEntity('/inventory/items'),
    WorkOrder: makeEntity('/work-orders', { vehicle_id: 'vehicleId' }),
    Invoice: makeEntity('/invoices', { vehicle_id: 'vehicleId' }),
    ShopSettings: {
      list: async () => {
        const settings = await request('/shop-settings');
        return settings ? [settings] : [];
      },
      create: (data) => request('/shop-settings', { method: 'PUT', body: data }),
      update: (_id, data) => request('/shop-settings', { method: 'PUT', body: data }),
    },
  },
  integrations: {
    Core: {
      UploadPublicFile: async ({ file }) => {
        const form = new FormData();
        form.append('file', file);
        const data = await request('/shop-settings/logo', { method: 'POST', body: form, isForm: true });
        return { file_url: data.file_url };
      },
    },
  },
  auth: {
    me: () => request('/auth/me'),
    loginViaEmailPassword: async (email, password) => {
      const { user, token } = await request('/auth/login', { method: 'POST', body: { email, password } });
      setToken(token);
      return user;
    },
    register: async ({ email, password, name }) => {
      const { user, token } = await request('/auth/register', { method: 'POST', body: { email, password, name } });
      setToken(token);
      return user;
    },
    logout: async () => {
      try {
        await request('/auth/logout', { method: 'POST' });
      } finally {
        // Always clear the local access token even if the network call
        // fails — the important server-side revocation is best-effort here,
        // but the client must stop presenting itself as logged in regardless.
        clearToken();
      }
    },
    // The reset link is logged to the backend console rather than emailed —
    // no transactional email provider is wired up yet (see auth.routes.js).
    resetPasswordRequest: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: ({ resetToken, newPassword }) =>
      request('/auth/reset-password', { method: 'POST', body: { resetToken, newPassword } }),
  },
};
