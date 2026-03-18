import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach Authorization Bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 and format errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Redirect to login
        window.location.href = '/login';
      }
    }

    const message =
      (error.response?.data as Record<string, string>)?.message ??
      error.message ??
      'Une erreur est survenue';

    return Promise.reject(new Error(message));
  },
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  register: (data: Record<string, unknown>) =>
    api.post('/api/auth/register', data),
  verifyOtp: (data: { userId: string; code: string; purpose?: string }) =>
    api.post('/api/auth/otp/verify', data),
  resendOtp: (data: { userId: string; purpose?: string }) =>
    api.post('/api/auth/otp/resend', data),
  refreshToken: (refreshToken: string) =>
    api.post('/api/auth/refresh', { refreshToken }),
  me: () => api.get('/api/auth/me'),
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/api/projects', { params }),
  get: (id: string) => api.get(`/api/projects/${id}`),
  create: (data: FormData | Record<string, unknown>) =>
    api.post('/api/projects', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/api/projects/${id}`, data),
  delete: (id: string) => api.delete(`/api/projects/${id}`),
};

// ─── Quotes ───────────────────────────────────────────────────────────────────

export const quotesApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/api/quotes', { params }),
  get: (id: string) => api.get(`/api/quotes/${id}`),
  submit: (data: Record<string, unknown>) => api.post('/api/quotes', data),
  accept: (id: string) => api.post(`/api/quotes/${id}/accept`),
  reject: (id: string) => api.post(`/api/quotes/${id}/reject`),
  withdraw: (id: string) => api.post(`/api/quotes/${id}/withdraw`),
  listByProject: (projectId: string) =>
    api.get(`/api/projects/${projectId}/quotes`),
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const paymentsApi = {
  get: (id: string) => api.get(`/api/payments/${id}`),
  getByProject: (projectId: string) =>
    api.get(`/api/projects/${projectId}/payment`),
  initiate: (data: Record<string, unknown>) =>
    api.post('/api/payments/initiate', data),
  releaseMilestone: (paymentId: string, milestoneId: string) =>
    api.post(`/api/payments/${paymentId}/milestones/${milestoneId}/approve`),
};

// ─── Providers ────────────────────────────────────────────────────────────────

export const providersApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/api/providers', { params }),
  get: (id: string) => api.get(`/api/providers/${id}`),
  updateProfile: (data: Record<string, unknown>) =>
    api.patch('/api/providers/me', data),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  updateProfile: (data: Record<string, unknown>) =>
    api.patch('/api/users/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/api/users/me/password', data),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/api/notifications', { params }),
  markRead: (id: string) => api.post(`/api/notifications/${id}/read`),
  markAllRead: () => api.post('/api/notifications/read-all'),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  stats: () => api.get('/api/admin/stats'),
  pendingVerifications: () => api.get('/api/admin/verifications/pending'),
  verifyProvider: (userId: string) =>
    api.post(`/api/admin/verifications/${userId}/verify`),
  rejectProvider: (userId: string, reason: string) =>
    api.post(`/api/admin/verifications/${userId}/reject`, { reason }),
  disputes: () => api.get('/api/admin/disputes'),
  resolveDispute: (projectId: string, resolution: string) =>
    api.post(`/api/admin/disputes/${projectId}/resolve`, { resolution }),
};
