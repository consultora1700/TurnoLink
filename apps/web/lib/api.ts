/**
 * API Client - Robust, type-safe API client with error handling
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// =============================================================================
// Types
// =============================================================================

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
  isActive: boolean;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  status: string;
  settings: string;
}

export interface TenantPublic {
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  settings: {
    showPrices: boolean;
    requirePhone: boolean;
    requireEmail: boolean;
    primaryColor: string;
    secondaryColor: string;
    maxAdvanceBookingDays: number;
    minAdvanceBookingHours: number;
  };
  services: ServicePublic[];
  categories: Category[];
}

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  image: string | null;
  isActive: boolean;
  order: number;
  categoryId: string | null;
}

export interface ServicePublic {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration: number;
  image: string | null;
  categoryId: string | null;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Booking {
  id: string;
  tenantId: string;
  serviceId: string;
  customerId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes: string | null;
  createdAt: string;
  service: Service;
  customer: Customer;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  totalBookings: number;
  lastVisit: string | null;
  createdAt: string;
}

export interface Schedule {
  id: string;
  tenantId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BlockedDate {
  id: string;
  tenantId: string;
  date: string;
  reason: string | null;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  totalCustomers: number;
  upcomingBookings: Booking[];
  recentCustomers: Customer[];
}

export interface CreateBookingData {
  serviceId: string;
  date: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  duration: number;
  isActive?: boolean;
  categoryId?: string;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  order?: number;
}

export interface ScheduleUpdate {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

// =============================================================================
// API Error Class
// =============================================================================

export class ApiRequestError extends Error {
  statusCode: number;
  originalError?: string;

  constructor(message: string, statusCode: number, originalError?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }

  get isUnauthorized() {
    return this.statusCode === 401;
  }

  get isForbidden() {
    return this.statusCode === 403;
  }

  get isNotFound() {
    return this.statusCode === 404;
  }

  get isValidationError() {
    return this.statusCode === 400;
  }

  get isServerError() {
    return this.statusCode >= 500;
  }
}

// =============================================================================
// Request Helper
// =============================================================================

interface RequestOptions extends RequestInit {
  token?: string;
  retries?: number;
  retryDelay?: number;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    token,
    retries = 2,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_URL}/api${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data: unknown;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        const errorData = data as { message?: string; error?: string };
        throw new ApiRequestError(
          errorData.message || errorData.error || `Request failed with status ${response.status}`,
          response.status,
          errorData.error
        );
      }

      // Handle wrapped responses
      const responseData = data as { data?: T };
      return (responseData.data !== undefined ? responseData.data : data) as T;

    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx) except for rate limiting
      if (error instanceof ApiRequestError) {
        if (error.statusCode < 500 && error.statusCode !== 429) {
          throw error;
        }
      }

      // Wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Request failed');
}

// =============================================================================
// Auth API
// =============================================================================

export const authApi = {
  login: async (email: string, password: string) => {
    return request<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      retries: 0, // Don't retry login
    });
  },

  register: async (data: {
    email: string;
    password: string;
    name: string;
    businessName: string;
    businessSlug: string;
  }) => {
    return request<{
      accessToken: string;
      refreshToken: string;
      user: User;
      tenant: Tenant;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      retries: 0,
    });
  },

  refresh: async (refreshToken: string) => {
    return request<{
      accessToken: string;
      refreshToken: string;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      retries: 0,
    });
  },

  changePassword: async (
    token: string,
    currentPassword: string,
    newPassword: string
  ) => {
    return request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
      token,
      retries: 0,
    });
  },
};

// =============================================================================
// Public API (No auth required)
// =============================================================================

export const publicApi = {
  getTenant: async (slug: string): Promise<TenantPublic> => {
    return request<TenantPublic>(`/public/tenants/${slug}`);
  },

  getAvailability: async (
    slug: string,
    date: string,
    serviceId?: string
  ): Promise<TimeSlot[]> => {
    const params = new URLSearchParams({ date });
    if (serviceId) params.append('serviceId', serviceId);
    return request<TimeSlot[]>(`/public/bookings/${slug}/availability?${params}`);
  },

  createBooking: async (slug: string, data: CreateBookingData): Promise<Booking> => {
    return request<Booking>(`/public/bookings/${slug}`, {
      method: 'POST',
      body: JSON.stringify(data),
      retries: 0, // Don't retry booking creation
    });
  },
};

// =============================================================================
// Protected API Client Factory
// =============================================================================

export function createApiClient(token: string) {
  const authRequest = <T>(endpoint: string, options: RequestOptions = {}) =>
    request<T>(endpoint, { ...options, token });

  return {
    // User Profile
    getProfile: () => authRequest<User>('/users/me'),

    updateProfile: (data: { name?: string; email?: string }) =>
      authRequest<User>('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    // Tenant
    getTenant: () => authRequest<Tenant>('/tenants/current'),

    updateTenant: (data: Partial<Omit<Tenant, 'id' | 'slug'>>) =>
      authRequest<Tenant>('/tenants/current', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getStats: () => authRequest<DashboardStats>('/tenants/current/stats'),

    // Services
    getServices: () => authRequest<Service[]>('/services'),

    getService: (id: string) => authRequest<Service>(`/services/${id}`),

    createService: (data: CreateServiceData) =>
      authRequest<Service>('/services', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateService: (id: string, data: UpdateServiceData) =>
      authRequest<Service>(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteService: (id: string) =>
      authRequest<void>(`/services/${id}`, { method: 'DELETE' }),

    reorderServices: (serviceIds: string[]) =>
      authRequest<Service[]>('/services/reorder', {
        method: 'POST',
        body: JSON.stringify({ serviceIds }),
      }),

    // Bookings
    getBookings: (params?: {
      date?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => {
      const query = params
        ? `?${new URLSearchParams(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          ).toString()}`
        : '';
      return authRequest<PaginatedResponse<Booking>>(`/bookings${query}`);
    },

    getTodayBookings: () => authRequest<Booking[]>('/bookings/today'),

    getBooking: (id: string) => authRequest<Booking>(`/bookings/${id}`),

    updateBookingStatus: (id: string, status: Booking['status']) =>
      authRequest<Booking>(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    cancelBooking: (id: string) =>
      authRequest<Booking>(`/bookings/${id}`, { method: 'DELETE' }),

    // Customers
    getCustomers: (params?: {
      search?: string;
      page?: number;
      limit?: number;
    }) => {
      const query = params
        ? `?${new URLSearchParams(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          ).toString()}`
        : '';
      return authRequest<PaginatedResponse<Customer>>(`/customers${query}`);
    },

    getCustomer: (id: string) => authRequest<Customer>(`/customers/${id}`),

    getCustomerHistory: (id: string) =>
      authRequest<Booking[]>(`/customers/${id}/history`),

    updateCustomer: (id: string, data: Partial<Customer>) =>
      authRequest<Customer>(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    // Schedules
    getSchedules: () => authRequest<Schedule[]>('/schedules'),

    updateSchedules: (schedules: ScheduleUpdate[]) =>
      authRequest<Schedule[]>('/schedules', {
        method: 'PUT',
        body: JSON.stringify({ schedules }),
      }),

    getBlockedDates: (params?: { startDate?: string; endDate?: string }) => {
      const query = params
        ? `?${new URLSearchParams(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          ).toString()}`
        : '';
      return authRequest<BlockedDate[]>(`/schedules/blocked${query}`);
    },

    blockDate: (date: string, reason?: string) =>
      authRequest<BlockedDate>('/schedules/blocked', {
        method: 'POST',
        body: JSON.stringify({ date, reason }),
      }),

    unblockDate: (id: string) =>
      authRequest<void>(`/schedules/blocked/${id}`, { method: 'DELETE' }),

    // Media
    uploadMedia: async (file: File, folder?: string): Promise<{ url: string }> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${API_URL}/api/media/upload${folder ? `?folder=${folder}` : ''}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiRequestError(
          error.message || 'Upload failed',
          response.status
        );
      }

      const data = await response.json();
      return data.data || data;
    },

    deleteMedia: (id: string) =>
      authRequest<void>(`/media/${id}`, { method: 'DELETE' }),
  };
}

// Type for the API client
export type ApiClient = ReturnType<typeof createApiClient>;

// =============================================================================
// Utility Functions
// =============================================================================

export function isApiError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
