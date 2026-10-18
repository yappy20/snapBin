import type {
  AppSettings,
  BOMItem,
  Category,
  Location,
  LowStockAlert,
  Part,
  Project,
  ScanResult,
} from "../types";

const BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: options.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Parts
  listParts: (params: Record<string, string | boolean | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && qs.set(k, String(v)));
    const query = qs.toString();
    return request<Part[]>(`/parts${query ? `?${query}` : ""}`);
  },
  getPart: (id: number) => request<Part>(`/parts/${id}`),
  createPart: (payload: Partial<Part>) =>
    request<Part>("/parts", { method: "POST", body: JSON.stringify(payload) }),
  updatePart: (id: number, payload: Partial<Part>) =>
    request<Part>(`/parts/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deletePart: (id: number) => request<void>(`/parts/${id}`, { method: "DELETE" }),
  adjustQuantity: (id: number, delta: number) =>
    request<Part>(`/parts/${id}/adjust-quantity`, { method: "POST", body: JSON.stringify({ delta }) }),

  // Categories
  listCategories: () => request<Category[]>("/categories"),
  createCategory: (name: string) =>
    request<Category>("/categories", { method: "POST", body: JSON.stringify({ name }) }),

  // Locations
  listLocations: () => request<Location[]>("/locations"),
  createLocation: (payload: Partial<Location>) =>
    request<Location>("/locations", { method: "POST", body: JSON.stringify(payload) }),
  updateLocation: (id: number, payload: Partial<Location>) =>
    request<Location>(`/locations/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteLocation: (id: number) => request<void>(`/locations/${id}`, { method: "DELETE" }),

  // Projects
  listProjects: () => request<Project[]>("/projects"),
  getProject: (id: number) => request<Project>(`/projects/${id}`),
  createProject: (payload: Partial<Project>) =>
    request<Project>("/projects", { method: "POST", body: JSON.stringify(payload) }),
  deleteProject: (id: number) => request<void>(`/projects/${id}`, { method: "DELETE" }),
  addBomItem: (projectId: number, partId: number, quantity_required: number) =>
    request<Project>(`/projects/${projectId}/bom-items`, {
      method: "POST",
      body: JSON.stringify({ part_id: partId, quantity_required }),
    }),
  removeBomItem: (projectId: number, itemId: number) =>
    request<Project>(`/projects/${projectId}/bom-items/${itemId}`, { method: "DELETE" }),
  consumeBom: (projectId: number) => request<Project>(`/projects/${projectId}/consume`, { method: "POST" }),

  // Scan
  scanImage: (file: Blob) => {
    const formData = new FormData();
    formData.append("image", file, "capture.jpg");
    return request<ScanResult>("/scan", { method: "POST", body: formData });
  },

  // Alerts
  lowStock: () => request<LowStockAlert[]>("/alerts/low-stock"),

  // Settings
  getSettings: () => request<AppSettings>("/settings"),
  supplierLinks: (q: string) => request<Record<string, string>>(`/settings/supplier-links?q=${encodeURIComponent(q)}`),
  enrich: (q: string) => request<{ mouser_result: any; supplier_links: Record<string, string> }>(`/settings/enrich?q=${encodeURIComponent(q)}`),
};

export type { BOMItem };
