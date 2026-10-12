const API_BASE = "http://127.0.0.1:8000/api";
const TOKEN_KEY = "servicelink_auth_token";
const USER_KEY = "servicelink_auth_user";
// Role-specific keys to allow same-laptop multi-login demo (customer in normal, provider in incognito, etc.)
// Also helps when user switches roles, we keep previous tokens
const ROLE_TOKEN_PREFIX = "servicelink_auth_token_";
const ROLE_USER_PREFIX = "servicelink_auth_user_";

async function authRequest(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(
      result?.message || "The ServiceLink authentication request failed."
    );
    error.status = response.status;
    error.errors = result?.errors || null;
    error.data = result?.data || null;
    throw error;
  }

  return result;
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const value = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    clearAuthSession();
    return null;
  }
}

export function saveAuthSession(data, remember = false) {
  clearAuthSession();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, data.token);
  storage.setItem(USER_KEY, JSON.stringify(data.user));
  // Also save role-specific copy for multi-role demo
  try {
    const role = data.user?.role || 'unknown';
    localStorage.setItem(ROLE_TOKEN_PREFIX + role, data.token);
    localStorage.setItem(ROLE_USER_PREFIX + role, JSON.stringify(data.user));
  } catch {}
}

export function updateStoredUser(user) {
  const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  // Optionally clear role-specific keys too - for full logout
  try {
    ['customer','provider','admin'].forEach(role => {
      localStorage.removeItem(ROLE_TOKEN_PREFIX + role);
      localStorage.removeItem(ROLE_USER_PREFIX + role);
    });
  } catch {}
}

export function getAllStoredUsers() {
  // For homepage: return all roles that have a token stored (useful for same-laptop demo explanation)
  const users = [];
  try {
    ['customer','provider','admin'].forEach(role => {
      const u = localStorage.getItem(ROLE_USER_PREFIX + role);
      if (u) users.push(JSON.parse(u));
    });
  } catch {}
  return users;
}

export function registerProvider(payload) {
  return authRequest("/auth/register/provider", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return authRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser() {
  return authRequest("/auth/me");
}

export async function logoutUser() {
  try {
    return await authRequest("/auth/logout", { method: "POST" });
  } finally {
    clearAuthSession();
  }
}

export async function registerCustomer(data) {
  const response = await fetch(`${API_BASE}/auth/register/customer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result;
}

export async function getCustomerProfile() {
  const response = await fetch(`${API_BASE}/customer/profile`, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${getAuthToken()}`
    }
  });
  if (!response.ok) throw await response.json();
  return await response.json();
}

export async function updateCustomerProfile(data) {
  const response = await fetch(`${API_BASE}/customer/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw result;
  return result;
}