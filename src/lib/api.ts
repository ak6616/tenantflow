const API_BASE = "/api/v1";

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tf_token");
}

function setToken(token: string) {
  localStorage.setItem("tf_token", token);
  // Also set as cookie for middleware route protection
  document.cookie = `tf_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function clearToken() {
  localStorage.removeItem("tf_token");
  localStorage.removeItem("tf_user");
  localStorage.removeItem("tf_tenant");
  document.cookie = "tf_token=; path=/; max-age=0";
}

function setUser(user: { id: string; email: string; name: string; role: string }) {
  localStorage.setItem("tf_user", JSON.stringify(user));
}

function setTenant(tenant: { id: string; slug: string; name: string; plan: string }) {
  localStorage.setItem("tf_tenant", JSON.stringify(tenant));
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Try refresh
    const refreshed = await refreshToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getToken()}`;
      const retry = await fetch(`${API_BASE}${path}`, { ...options, headers });
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({ error: { code: "UNKNOWN", message: "Request failed" } }));
        throw new ApiError(retry.status, err.error?.code || "UNKNOWN", err.error?.message || "Request failed");
      }
      return retry.json().then((r) => r.data);
    }
    clearToken();
    window.location.href = "/login";
    throw new ApiError(401, "UNAUTHORIZED", "Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { code: "UNKNOWN", message: "Request failed" } }));
    throw new ApiError(res.status, err.error?.code || "UNKNOWN", err.error?.message || "Request failed");
  }

  const json = await res.json();
  return json.data;
}

async function refreshToken(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return false;
    const json = await res.json();
    setToken(json.data.token);
    return true;
  } catch {
    return false;
  }
}

// Auth
export async function login(email: string, password: string, tenantSlug: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, tenantSlug }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { code: "UNKNOWN", message: "Login failed" } }));
    throw new ApiError(res.status, err.error?.code || "UNKNOWN", err.error?.message || "Login failed");
  }
  const json = await res.json();
  const { token: t, user, tenant } = json.data;
  setToken(t);
  setUser(user);
  setTenant(tenant);
  return json.data;
}

export async function signup(data: {
  companyName: string;
  email: string;
  password: string;
  name: string;
}) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { code: "UNKNOWN", message: "Signup failed" } }));
    throw new ApiError(res.status, err.error?.code || "UNKNOWN", err.error?.message || "Signup failed");
  }
  const json = await res.json();
  const { token: t, user, tenant } = json.data;
  setToken(t);
  setUser(user);
  setTenant(tenant);
  return json.data;
}

export function logout() {
  clearToken();
  window.location.href = "/login";
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("tf_user");
  return raw ? JSON.parse(raw) : null;
}

export function getStoredTenant() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("tf_tenant");
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// Leads
export const leadsApi = {
  list: (page = 1, limit = 20) =>
    request<any[]>(`/leads?page=${page}&limit=${limit}`),
  get: (id: string) => request<any>(`/leads/${id}`),
  create: (data: Record<string, unknown>) =>
    request<any>("/leads", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<any>(`/leads/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/leads/${id}`, { method: "DELETE" }),
};

// Deals
export const dealsApi = {
  list: (page = 1, limit = 50, stageId?: string) =>
    request<any[]>(`/deals?page=${page}&limit=${limit}${stageId ? `&stageId=${stageId}` : ""}`),
  get: (id: string) => request<any>(`/deals/${id}`),
  create: (data: Record<string, unknown>) =>
    request<any>("/deals", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<any>(`/deals/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

// Pipeline
export const pipelineApi = {
  stages: () => request<any[]>("/pipeline/stages"),
};

// Activities
export const activitiesApi = {
  list: (params?: { dealId?: string; leadId?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.dealId) q.set("dealId", params.dealId);
    if (params?.leadId) q.set("leadId", params.leadId);
    q.set("page", String(params?.page || 1));
    q.set("limit", String(params?.limit || 20));
    return request<any[]>(`/activities?${q}`);
  },
  create: (data: Record<string, unknown>) =>
    request<any>("/activities", { method: "POST", body: JSON.stringify(data) }),
};

// Reports
export const reportsApi = {
  summary: (range = "30d") =>
    request<any>(`/reports/summary?range=${range}`),
};

// Billing
export const billingApi = {
  checkout: (plan: string) =>
    request<any>("/billing/checkout", { method: "POST", body: JSON.stringify({ plan }) }),
  portal: () =>
    request<any>("/billing/portal", { method: "POST" }),
};

export { ApiError };
