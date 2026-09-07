/**
 * Centralized Enterprise API Client
 * Automatically handles token injection, base URLs, error normalization, and response schemas.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_V1 = `${BASE_URL}/api/v1`;

function getAuthHeaders() {
  const token = localStorage.getItem("emox_auth_token") || localStorage.getItem("emox_admin_token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token && !token.startsWith("emox_sec_token_")) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_V1}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || data.detail || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.code = data.code || `HTTP_${response.status}`;
      error.details = data.details || {};
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || "GET"} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    login: (email, password) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (payload) =>
      request("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    getMe: () => request("/auth/me"),
    logout: () => request("/auth/logout", { method: "POST" }),
  },

  // Users
  users: {
    list: () => request("/users/"),
    updateRole: (userId, newRole) =>
      request(`/users/${userId}/role?new_role=${newRole}`, { method: "PUT" }),
    toggleStatus: (userId) =>
      request(`/users/${userId}/toggle-status`, { method: "PUT" }),
  },

  // Products
  products: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/products/${q ? `?${q}` : ""}`);
    },
    get: (id) => request(`/products/${id}`),
    create: (data) =>
      request("/products/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteOrArchive: (id) =>
      request(`/products/${id}`, { method: "DELETE" }),
  },

  // Categories
  categories: {
    list: () => request("/categories/"),
    create: (data) =>
      request("/categories/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Inventory
  inventory: {
    summary: () => request("/inventory/summary"),
    detailed: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/inventory/detailed${q ? `?${q}` : ""}`);
    },
    get: (productId) => request(`/inventory/${productId}`),
    update: (productId, data) =>
      request(`/inventory/${productId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    adjust: (productId, adjustment, reason) =>
      request(`/inventory/${productId}/adjust`, {
        method: "POST",
        body: JSON.stringify({ adjustment, reason }),
      }),
  },

  // Warehouses
  warehouses: {
    list: () => request("/warehouses/"),
    create: (data) =>
      request("/warehouses/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Suppliers
  suppliers: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/suppliers/${q ? `?${q}` : ""}`);
    },
    get: (id) => request(`/suppliers/${id}`),
    compare: (productName) =>
      request(`/suppliers/compare?product_name=${encodeURIComponent(productName)}`),
    create: (data) =>
      request("/suppliers/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/suppliers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteOrArchive: (id) =>
      request(`/suppliers/${id}`, { method: "DELETE" }),
  },

  // Purchase Orders
  purchaseOrders: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/purchase-orders/${q ? `?${q}` : ""}`);
    },
    get: (id) => request(`/purchase-orders/${id}`),
    create: (data) =>
      request("/purchase-orders/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateStatus: (id, status, notes = "") =>
      request(`/purchase-orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, notes }),
      }),
    receiveItems: (id, receivedItems, notes = "") =>
      request(`/purchase-orders/${id}/receive`, {
        method: "POST",
        body: JSON.stringify({ received_items: receivedItems, notes }),
      }),
  },

  // Orders
  orders: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/orders/${q ? `?${q}` : ""}`);
    },
    get: (idOrNumber) => request(`/orders/${idOrNumber}`),
    create: (data) =>
      request("/orders/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateStatus: (id, status, notes = "") =>
      request(`/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, notes }),
      }),
  },

  // Sales
  sales: {
    list: () => request("/sales/"),
    detailed: () => request("/sales/detailed"),
    analytics: () => request("/sales/analytics"),
  },

  // AI & Multi-Agent Intelligence
  ai: {
    summary: () => request("/ai/summary"),
    evaluateSupplier: (productNameOrId) =>
      request(`/ai/suppliers/evaluate/${encodeURIComponent(productNameOrId)}`),
    restockIntelligence: () => request("/ai/inventory/restock-intelligence"),
    demandForecast: () => request("/ai/demand/forecast"),
    riskOverview: () => request("/ai/risk/overview"),
    runAgent: (agentName, productId = null, category = null) => {
      let q = `?agent_name=${encodeURIComponent(agentName)}`;
      if (productId) q += `&product_id=${productId}`;
      if (category) q += `&category=${encodeURIComponent(category)}`;
      return request(`/ai/run-agent${q}`, { method: "POST" });
    },
  },

  // Alerts & Needs Attention
  alerts: {
    needsAttention: () => request("/alerts/needs-attention"),
  },

  // Analytics
  analytics: {
    overview: (timeframe = "30d") =>
      request(`/analytics/overview?timeframe=${timeframe}`),
  },

  // Notifications
  notifications: {
    list: (limit = 50) => request(`/notifications/?limit=${limit}`),
    markRead: (id) => request(`/notifications/${id}/read`, { method: "PUT" }),
    markAllRead: () => request("/notifications/mark-all-read", { method: "PUT" }),
  },

  // Audit Logs
  auditLogs: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/audit-logs/${q ? `?${q}` : ""}`);
    },
  },

  // Settings
  settings: {
    get: () => request("/settings/"),
    update: (data) =>
      request("/settings/", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
};

export default api;
