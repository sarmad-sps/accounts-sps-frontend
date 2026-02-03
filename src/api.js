
// ─── Token Management ─────────────────────────────
export function getToken() {
  return localStorage.getItem("sps_token") || "";
}

export function setToken(token) {
  if (token) localStorage.setItem("sps_token", token);
}

export function clearToken() {
  localStorage.removeItem("sps_token");
}

// ─── Backend Base URL ─────────────────────────────
const API_BASE = "https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api";

// ─── Core Request Function ────────────────────────
async function req(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  try {
    const res = await fetch(url, { ...options, headers });

    const contentType = res.headers.get("content-type");
    let body;
    if (contentType && contentType.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    if (!res.ok) {
      // Handle 401 / 403 / other errors
      let errorMsg;
      if (res.status === 401) errorMsg = "Unauthorized: Missing or invalid token";
      else if (res.status === 403) errorMsg = "Forbidden: You do not have access";
      else errorMsg = (body && body.error) || `Server Error: ${res.status}`;
      throw new Error(errorMsg);
    }

    return body;
  } catch (err) {
    console.error("API Request Error:", err);
    throw new Error(err.message || "Network Connection Failed");
  }
}

// ─── API Methods ──────────────────────────────────
export const api = {
  // Login endpoint returns { token, role } (example)
login: (pin, role = "store") =>
  req("/login", {
    method: "POST",
    body: JSON.stringify({ pin, role }),
  }).then((res) => {
    if (res.token) setToken(res.token);
    return res;
  }),

  logout: () => {
    clearToken();
    return true;
  },

  // State endpoints
  getState: () => req("/state"),
  putState: (state) => req("/state", { method: "PUT", body: JSON.stringify(state) }),

  // Inventory / payments
  getInventory: () => req("/inventory"),
  submitRequest: (requestData) =>
    req("/requests", { method: "POST", body: JSON.stringify(requestData) }),

  // Example: role check helper (optional)
  hasRole: async (requiredRole) => {
    const state = await api.getState(); // or call /me endpoint if exists
    return state.role === requiredRole;
  },
};
