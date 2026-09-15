// Talks to our own Express/Prisma backend. Shaped as
// api.entities.X.list/get/filter/create/update/delete, api.auth.*,
// api.integrations.Core.UploadPublicFile so the pages that use it stay
// simple and consistent across resources.

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

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

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
    logout: () => clearToken(),
    // TODO: wire these once a transactional email provider is chosen —
    // backend endpoints are not implemented yet (see auth.routes.js TODOs).
    resetPasswordRequest: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: ({ resetToken, newPassword }) =>
      request('/auth/reset-password', { method: 'POST', body: { resetToken, newPassword } }),
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
};
