/**
 * Enterprise AI & Multi-Agent API Service
 * Handles Ollama health checks, real-time agent execution, RAG knowledge base,
 * ML forecasting, and human-in-the-loop recommendation approvals.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_BASE = `${BASE_URL}/api`;

function getAuthHeaders(isMultipart = false) {
  const token = localStorage.getItem("emox_auth_token") || localStorage.getItem("emox_admin_token");
  const headers = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res) {
  if (res.status === 204) return { success: true };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.detail || `Request failed with status ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
}

export const aiApi = {
  // 1. Ollama Runtime Status & Config
  ollama: {
    getHealth: async () => {
      const res = await fetch(`${API_BASE}/ai/ollama/health`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getModels: async () => {
      const res = await fetch(`${API_BASE}/ai/ollama/models`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
  },

  // 2. Multi-Agent Orchestrator & Chat
  chat: async (message, conversationId = null) => {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, conversation_id: conversationId })
    });
    return handleResponse(res);
  },

  getMessages: async (conversationId) => {
    const res = await fetch(`${API_BASE}/ai/conversations/${conversationId}/messages`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // 3. Specialized Agent Execution
  agents: {
    list: async () => {
      const res = await fetch(`${API_BASE}/ai/agents`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    run: async (agentName, payload = {}) => {
      const res = await fetch(`${API_BASE}/ai/agents/${agentName}/run`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      return handleResponse(res);
    }
  },

  // 4. Human-In-The-Loop Recommendations Hub
  recommendations: {
    list: async (status = null) => {
      const q = status ? `?status=${encodeURIComponent(status)}` : "";
      const res = await fetch(`${API_BASE}/ai/recommendations${q}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    approve: async (id) => {
      const res = await fetch(`${API_BASE}/ai/recommendations/${id}/approve`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    reject: async (id, notes = "") => {
      const res = await fetch(`${API_BASE}/ai/recommendations/${id}/reject`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes })
      });
      return handleResponse(res);
    }
  },

  // 5. Enterprise Knowledge Base & RAG
  knowledge: {
    list: async () => {
      const res = await fetch(`${API_BASE}/knowledge/documents`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    upload: async (formData) => {
      const res = await fetch(`${API_BASE}/knowledge/documents`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: formData
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/knowledge/documents/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    reindex: async (id) => {
      const res = await fetch(`${API_BASE}/knowledge/documents/${id}/reindex`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    search: async (query, documentType = null) => {
      const res = await fetch(`${API_BASE}/knowledge/search`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ query, document_type: documentType, top_k: 5 })
      });
      return handleResponse(res);
    }
  },

  // 6. ML Demand Forecasting
  forecast: {
    get: async (productId) => {
      const res = await fetch(`${API_BASE}/forecast/products/${productId}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    generate: async (productId) => {
      const res = await fetch(`${API_BASE}/forecast/products/${productId}/generate`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    accuracy: async (productId) => {
      const res = await fetch(`${API_BASE}/forecast/products/${productId}/accuracy`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // 7. Multimodal AI Extraction & Vision
  multimodal: {
    extractInvoice: async (formData) => {
      const res = await fetch(`${API_BASE}/ai/documents/extract`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: formData
      });
      return handleResponse(res);
    },
    inspectImage: async (formData) => {
      const res = await fetch(`${API_BASE}/ai/vision/analyze`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: formData
      });
      return handleResponse(res);
    }
  },

  // 8. Background Jobs
  jobs: {
    list: async () => {
      const res = await fetch(`${API_BASE}/ai/jobs`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  }
};

export default aiApi;
