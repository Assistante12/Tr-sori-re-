import {
  User,
  PurchaseSheet,
  Settings,
  DashboardStats,
  ReportSummary,
  FilterParams,
} from '../types';

const TOKEN_KEY = 'tresoriere_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Erreur serveur (${response.status})`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  register: async (name: string, email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    return request<{ user: User }>('/api/auth/me');
  },

  logout: () => {
    removeStoredToken();
  },

  // Sheets
  getSheets: async (filters?: FilterParams): Promise<PurchaseSheet[]> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.session && filters.session !== 'ALL') params.append('session', filters.session);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request<PurchaseSheet[]>(`/api/sheets${query}`);
  },

  getSheetById: async (id: string): Promise<PurchaseSheet> => {
    return request<PurchaseSheet>(`/api/sheets/${id}`);
  },

  createSheet: async (data: Partial<PurchaseSheet>): Promise<PurchaseSheet> => {
    return request<PurchaseSheet>('/api/sheets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSheet: async (id: string, data: Partial<PurchaseSheet>): Promise<PurchaseSheet> => {
    return request<PurchaseSheet>(`/api/sheets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteSheet: async (id: string): Promise<{ success: boolean; message: string; id: string }> => {
    return request<{ success: boolean; message: string; id: string }>(`/api/sheets/${id}`, {
      method: 'DELETE',
    });
  },

  signSheet: async (id: string, role: 'treasurer' | 'manager', signatureDataUrl: string | null): Promise<PurchaseSheet> => {
    return request<PurchaseSheet>(`/api/sheets/${id}/signature`, {
      method: 'PATCH',
      body: JSON.stringify({ role, signatureDataUrl }),
    });
  },

  // Dashboard Stats
  getStats: async (): Promise<DashboardStats> => {
    return request<DashboardStats>('/api/stats');
  },

  // Reports
  getReports: async (period = 'month', startDate?: string, endDate?: string): Promise<ReportSummary> => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request<ReportSummary>(`/api/reports?${params.toString()}`);
  },

  // Settings
  getSettings: async (): Promise<Settings> => {
    return request<Settings>('/api/settings');
  },

  updateSettings: async (data: Partial<Settings>): Promise<Settings> => {
    return request<Settings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Demo Reset
  resetDemoData: async (): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>('/api/reset-demo', {
      method: 'POST',
    });
  },
};
