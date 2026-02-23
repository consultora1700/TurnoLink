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
  tenantType?: string;
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
    accentColor?: string;
    enableDarkMode?: boolean;
    backgroundStyle?: 'minimal' | 'modern' | 'elegant' | 'fresh' | 'vibrant';
    heroStyle?: string;
    maxAdvanceBookingDays: number;
    minAdvanceBookingHours: number;
    requireDeposit?: boolean;
    depositPercentage?: number;
    depositMode?: string;
    smartTimeSlots?: boolean;
    bookingMode?: 'HOURLY' | 'DAILY';
    dailyCheckInTime?: string;
    dailyCheckOutTime?: string;
    dailyMinNights?: number;
    dailyMaxNights?: number;
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
  includes: string | null;
  isActive: boolean;
  order: number;
  categoryId: string | null;
  images?: string[];
  imageDisplayMode?: string;
  variations?: VariationGroup[];
}

export interface ServicePublic {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration: number;
  image: string | null;
  includes: string | null;
  categoryId: string | null;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  phone: string | null;
  image: string | null;
  specialty: string | null;
  bio: string | null;
  isActive: boolean;
  order: number;
}

export interface CreateEmployeeData {
  name: string;
  email?: string;
  phone?: string;
  image?: string;
  specialty?: string;
  bio?: string;
  isActive?: boolean;
  order?: number;
}

// Branch types
export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  image: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  isMain: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    branchServices: number;
    branchEmployees: number;
  };
}

export interface BranchPublic {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  isMain: boolean;
}

export interface CreateBranchData {
  name: string;
  slug: string;
  image?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  isMain?: boolean;
  isActive?: boolean;
  order?: number;
}

export interface BranchService {
  id: string;
  branchId: string;
  serviceId: string;
  priceOverride: number | null;
  isActive: boolean;
  service: Service;
}

export interface BranchEmployee {
  id: string;
  branchId: string;
  employeeId: string;
  isActive: boolean;
  employee: Employee;
}

export interface BranchSchedule {
  id: string;
  branchId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BranchBlockedDate {
  id: string;
  branchId: string;
  date: string;
  reason: string | null;
}

export interface Booking {
  id: string;
  tenantId: string;
  serviceId: string;
  customerId: string;
  employeeId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  checkOutDate: string | null;
  totalNights: number | null;
  totalPrice: number | null;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes: string | null;
  createdAt: string;
  service: Service;
  customer: Customer;
  employee: Employee | null;
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
  branchId?: string;
  employeeId?: string;
  date: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}

export interface CreateDailyBookingData {
  serviceId: string;
  branchId?: string;
  checkInDate: string;
  checkOutDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}

export interface DailyAvailabilityDay {
  date: string;
  available: boolean;
}

// Service Variations
export interface VariationOption {
  id: string;
  name: string;
  priceModifier: number;
  pricingType: 'absolute' | 'relative';
  durationModifier: number;
}

export interface VariationGroup {
  id: string;
  label: string;
  type: 'single' | 'multi';
  required: boolean;
  options: VariationOption[];
}

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  duration: number;
  isActive?: boolean;
  categoryId?: string;
  image?: string;
  images?: string[];
  imageDisplayMode?: string;
  includes?: string;
  variations?: string;
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

// Talent Profile types
export interface TalentProfile {
  id: string;
  name: string;
  phone: string | null;
  image: string | null;
  specialty: string | null;
  category: string | null;
  coverImage: string | null;
  headerTemplate: string | null;
  headline: string | null;
  bio: string | null;
  yearsExperience: number | null;
  skills: string[];
  certifications: string[];
  availability: string | null;
  preferredZones: string[];
  openToWork: boolean;
  profileVisible: boolean;
  experiences: Array<{
    id: string;
    businessName: string;
    role: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
  }>;
}

// My Professional Profile (self-registered PROFESSIONAL users)
export interface MyProfileData {
  name: string;
  phone?: string;
  headline?: string;
  bio?: string;
  specialty?: string;
  category?: string;
  image?: string;
  coverImage?: string;
  headerTemplate?: string;
  yearsExperience?: number;
  skills?: string[];
  certifications?: string[];
  availability?: string;
  preferredZones?: string[];
  openToWork?: boolean;
  profileVisible?: boolean;
}

export interface ExperienceData {
  businessName: string;
  role: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

// Talent Proposal types
export interface TalentProposal {
  id: string;
  profileId: string;
  profile?: { name: string; specialty: string | null; image: string | null; email?: string; phone?: string | null };
  senderTenantId: string;
  senderTenant?: { name: string };
  role: string;
  message: string;
  availability: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  respondedAt: string | null;
  responseMessage: string | null;
  viewedAt: string | null;
  createdAt: string;
}

// Public Talent types (reduced data for unauthenticated visitors)
export interface PublicTalentProfile {
  id: string;
  name: string;
  image: string | null;
  specialty: string | null;
  headline: string | null;
  bio: string | null;
  yearsExperience: number | null;
  skills: string[];
  availability: string | null;
  openToWork: boolean;
}

export interface PublicTalentProfileDetail extends PublicTalentProfile {
  experiences: Array<{
    id: string;
    businessName: string;
    role: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
  }>;
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

      // Handle empty and non-JSON responses
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      let data: unknown;

      // Empty body (e.g. null returned from API)
      if (contentLength === '0') {
        data = null;
      } else if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text.length === 0 ? null : { message: text };
      }

      if (!response.ok) {
        const errorData = data as { message?: string; error?: string };
        throw new ApiRequestError(
          errorData.message || errorData.error || `Request failed with status ${response.status}`,
          response.status,
          errorData.error
        );
      }

      return data as T;

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
    businessName?: string;
    businessSlug?: string;
    accountType?: 'BUSINESS' | 'PROFESSIONAL';
    companyName?: string;
    specialty?: string;
    category?: string;
  }) => {
    return request<{
      accessToken: string;
      refreshToken: string;
      user: User;
      tenant: Tenant & { type?: string };
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

  forgotPassword: async (email: string) => {
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      retries: 0,
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
      retries: 0,
    });
  },
};

// =============================================================================
// Public API (No auth required)
// =============================================================================

export interface EmployeePublic {
  id: string;
  name: string;
  image: string | null;
  specialty: string | null;
  bio: string | null;
}

export const publicApi = {
  getTenant: async (slug: string): Promise<TenantPublic> => {
    // No cache to always get fresh tenant settings
    return request<TenantPublic>(`/public/tenants/${slug}`, { cache: 'no-store' });
  },

  getEmployees: async (slug: string): Promise<EmployeePublic[]> => {
    return request<EmployeePublic[]>(`/public/tenants/${slug}/employees`);
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

  getDailyAvailability: async (
    slug: string,
    startDate: string,
    endDate: string,
    branchId?: string
  ): Promise<DailyAvailabilityDay[]> => {
    const params = new URLSearchParams({ startDate, endDate });
    if (branchId) params.append('branchId', branchId);
    return request<DailyAvailabilityDay[]>(`/public/bookings/${slug}/daily-availability?${params}`);
  },

  createDailyBooking: async (slug: string, data: CreateDailyBookingData): Promise<Booking & { requiresPayment?: boolean; depositMode?: string }> => {
    return request<Booking & { requiresPayment?: boolean; depositMode?: string }>(`/public/bookings/${slug}/daily`, {
      method: 'POST',
      body: JSON.stringify(data),
      retries: 0,
    });
  },

  // Branch public methods
  getBranches: async (slug: string): Promise<BranchPublic[]> => {
    return request<BranchPublic[]>(`/public/tenants/${slug}/branches`);
  },

  getBranch: async (slug: string, branchSlug: string): Promise<Branch> => {
    return request<Branch>(`/public/tenants/${slug}/branches/${branchSlug}`);
  },

  getBranchServices: async (slug: string, branchSlug: string): Promise<ServicePublic[]> => {
    return request<ServicePublic[]>(`/public/tenants/${slug}/branches/${branchSlug}/services`);
  },

  getBranchEmployees: async (
    slug: string,
    branchSlug: string,
    serviceId?: string
  ): Promise<EmployeePublic[]> => {
    const params = serviceId ? `?serviceId=${serviceId}` : '';
    return request<EmployeePublic[]>(`/public/tenants/${slug}/branches/${branchSlug}/employees${params}`);
  },

  getBranchAvailability: async (
    slug: string,
    branchSlug: string,
    date: string,
    serviceId?: string
  ): Promise<TimeSlot[]> => {
    const params = new URLSearchParams({ date });
    if (serviceId) params.append('serviceId', serviceId);
    return request<TimeSlot[]>(`/public/tenants/${slug}/branches/${branchSlug}/availability?${params}`);
  },
};

// =============================================================================
// Public Professional Profile API
// =============================================================================

export const publicProfileApi = {
  getProposalsReceived: (token: string) =>
    request<TalentProposal[]>(`/public/professional-profile/${token}/proposals`),

  respondProposal: (token: string, proposalId: string, data: { status: 'ACCEPTED' | 'REJECTED'; responseMessage?: string }) =>
    request<TalentProposal>(`/public/professional-profile/${token}/proposals/${proposalId}/respond`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  markProposalViewed: (token: string, proposalId: string) =>
    request<{ success: boolean }>(`/public/professional-profile/${token}/proposals/${proposalId}/viewed`, {
      method: 'PUT',
    }),
};

// =============================================================================
// Public Talent Browse API (no auth required)
// =============================================================================

export const publicTalentApi = {
  browse: (params?: {
    search?: string;
    specialty?: string;
    category?: string;
    availability?: string;
    openToWork?: boolean;
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
    return request<PaginatedResponse<PublicTalentProfile>>(`/public/talent${query}`);
  },

  getProfile: (id: string) =>
    request<PublicTalentProfileDetail>(`/public/talent/${id}`),
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

    updateTenant: (data: Partial<Omit<Tenant, 'id'>>) =>
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

    getRecentBookings: () => authRequest<{
      id: string;
      customerName: string;
      serviceName: string;
      date: string;
      startTime: string;
      createdAt: string;
      status: string;
    }[]>('/bookings/recent'),

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

    // Employees
    getEmployees: () => authRequest<Employee[]>('/employees'),

    getEmployee: (id: string) => authRequest<Employee>(`/employees/${id}`),

    createEmployee: (data: CreateEmployeeData) =>
      authRequest<Employee>('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateEmployee: (id: string, data: Partial<CreateEmployeeData>) =>
      authRequest<Employee>(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteEmployee: (id: string) =>
      authRequest<void>(`/employees/${id}`, { method: 'DELETE' }),

    reorderEmployees: (employeeIds: string[]) =>
      authRequest<Employee[]>('/employees/reorder', {
        method: 'POST',
        body: JSON.stringify({ employeeIds }),
      }),

    getEmployeeServices: (id: string) =>
      authRequest<Service[]>(`/employees/${id}/services`),

    updateEmployeeServices: (id: string, serviceIds: string[]) =>
      authRequest<Service[]>(`/employees/${id}/services`, {
        method: 'PUT',
        body: JSON.stringify({ serviceIds }),
      }),

    // Branches
    getBranches: () => authRequest<Branch[]>('/branches'),

    getBranch: (id: string) => authRequest<Branch>(`/branches/${id}`),

    createBranch: (data: CreateBranchData) =>
      authRequest<Branch>('/branches', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateBranch: (id: string, data: Partial<CreateBranchData>) =>
      authRequest<Branch>(`/branches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteBranch: (id: string) =>
      authRequest<void>(`/branches/${id}`, { method: 'DELETE' }),

    reorderBranches: (branchIds: string[]) =>
      authRequest<Branch[]>('/branches/reorder', {
        method: 'POST',
        body: JSON.stringify({ branchIds }),
      }),

    // Branch Services
    getBranchServices: (branchId: string) =>
      authRequest<BranchService[]>(`/branches/${branchId}/services`),

    assignServiceToBranch: (branchId: string, serviceId: string, priceOverride?: number) =>
      authRequest<BranchService>(`/branches/${branchId}/services`, {
        method: 'POST',
        body: JSON.stringify({ serviceId, priceOverride }),
      }),

    removeServiceFromBranch: (branchId: string, serviceId: string) =>
      authRequest<void>(`/branches/${branchId}/services/${serviceId}`, {
        method: 'DELETE',
      }),

    bulkAssignServicesToBranch: (branchId: string, serviceIds: string[]) =>
      authRequest<BranchService[]>(`/branches/${branchId}/services`, {
        method: 'PUT',
        body: JSON.stringify({ serviceIds }),
      }),

    // Branch Employees
    getBranchEmployees: (branchId: string) =>
      authRequest<BranchEmployee[]>(`/branches/${branchId}/employees`),

    assignEmployeeToBranch: (branchId: string, employeeId: string) =>
      authRequest<BranchEmployee>(`/branches/${branchId}/employees`, {
        method: 'POST',
        body: JSON.stringify({ employeeId }),
      }),

    removeEmployeeFromBranch: (branchId: string, employeeId: string) =>
      authRequest<void>(`/branches/${branchId}/employees/${employeeId}`, {
        method: 'DELETE',
      }),

    bulkAssignEmployeesToBranch: (branchId: string, employeeIds: string[]) =>
      authRequest<BranchEmployee[]>(`/branches/${branchId}/employees`, {
        method: 'PUT',
        body: JSON.stringify({ employeeIds }),
      }),

    // Branch Schedules
    getBranchSchedules: (branchId: string) =>
      authRequest<BranchSchedule[]>(`/branches/${branchId}/schedules`),

    updateBranchSchedules: (
      branchId: string,
      schedules: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isActive: boolean;
      }>
    ) =>
      authRequest<BranchSchedule[]>(`/branches/${branchId}/schedules`, {
        method: 'PUT',
        body: JSON.stringify({ schedules }),
      }),

    // Branch Blocked Dates
    getBranchBlockedDates: (branchId: string) =>
      authRequest<BranchBlockedDate[]>(`/branches/${branchId}/blocked-dates`),

    addBranchBlockedDate: (branchId: string, date: string, reason?: string) =>
      authRequest<BranchBlockedDate>(`/branches/${branchId}/blocked-dates`, {
        method: 'POST',
        body: JSON.stringify({ date, reason }),
      }),

    removeBranchBlockedDate: (branchId: string, blockedDateId: string) =>
      authRequest<void>(`/branches/${branchId}/blocked-dates/${blockedDateId}`, {
        method: 'DELETE',
      }),

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

    // Subscriptions
    getSubscription: () => authRequest<{
      id: string;
      status: string;
      billingPeriod: string;
      trialEndAt: string | null;
      currentPeriodEnd: string | null;
      plan: {
        id: string;
        name: string;
        slug: string;
        priceMonthly: number;
        priceYearly: number | null;
      };
    }>('/subscriptions'),

    getSubscriptionStatus: () => authRequest<{
      isTrialing: boolean;
      isActive: boolean;
      isExpired: boolean;
      daysRemaining: number;
      status: string;
    }>('/subscriptions/status'),

    startTrial: (planSlug?: string) =>
      authRequest('/subscriptions/trial', {
        method: 'POST',
        body: JSON.stringify({ planSlug }),
      }),

    activateSubscription: (billingPeriod: 'MONTHLY' | 'YEARLY') =>
      authRequest('/subscriptions/activate', {
        method: 'POST',
        body: JSON.stringify({ billingPeriod }),
      }),

    cancelSubscription: (reason?: string) =>
      authRequest('/subscriptions/cancel', {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      }),

    // Email Verification
    sendVerificationEmail: () =>
      authRequest<{ success: boolean; message: string }>('/email-verification/send', {
        method: 'POST',
      }),

    getEmailVerificationStatus: () =>
      authRequest<{ emailVerified: boolean }>('/email-verification/status'),

    // Reviews
    getReviews: () => authRequest<{
      id: string;
      rating: number;
      comment: string | null;
      createdAt: string;
      customer: { name: string };
    }[]>('/reviews'),

    getReviewStats: () => authRequest<{
      totalBookings: number;
      bookingsThisWeek: number;
      bookingsThisMonth: number;
      averageRating: number;
      totalReviews: number;
    }>('/reviews/stats'),

    updateReviewVisibility: (id: string, isVisible: boolean) =>
      authRequest(`/reviews/${id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ isVisible }),
      }),

    // Talent Browse
    browseTalent: (params?: {
      search?: string;
      specialty?: string;
      availability?: string;
      openToWork?: boolean;
      category?: string;
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
      return authRequest<PaginatedResponse<TalentProfile>>(`/professional-profiles/browse${query}`);
    },

    getTalentProfile: (id: string) =>
      authRequest<TalentProfile>(`/professional-profiles/browse/${id}`),

    sendProposal: (profileId: string, data: { role: string; message: string; availability?: string }) =>
      authRequest<TalentProposal>(`/professional-profiles/browse/${profileId}/proposal`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getProposalsSent: () =>
      authRequest<TalentProposal[]>(`/professional-profiles/proposals/sent`),

    // My Professional Profile (PROFESSIONAL users)
    getMyProfile: () =>
      authRequest<TalentProfile | null>(`/professional-profiles/my-profile`),

    createMyProfile: (data: MyProfileData) =>
      authRequest<TalentProfile>(`/professional-profiles/my-profile`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateMyProfile: (data: MyProfileData) =>
      authRequest<TalentProfile>(`/professional-profiles/my-profile`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    addMyExperience: (data: ExperienceData) =>
      authRequest<{ id: string }>(`/professional-profiles/my-profile/experience`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateMyExperience: (id: string, data: ExperienceData) =>
      authRequest(`/professional-profiles/my-profile/experience/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteMyExperience: (id: string) =>
      authRequest(`/professional-profiles/my-profile/experience/${id}`, {
        method: 'DELETE',
      }),

    getMyProposals: () =>
      authRequest<TalentProposal[]>(`/professional-profiles/my-profile/proposals`),

    respondToMyProposal: (proposalId: string, data: { status: string; responseMessage?: string }) =>
      authRequest<TalentProposal>(`/professional-profiles/my-profile/proposals/${proposalId}/respond`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Autogestion - Create booking directly from dashboard
    createBooking: (data: CreateBookingData) =>
      authRequest<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
        retries: 0,
      }),

    getAvailability: (date: string, serviceId?: string) => {
      const params = new URLSearchParams({ date });
      if (serviceId) params.append('serviceId', serviceId);
      return authRequest<TimeSlot[]>(`/bookings/availability?${params}`);
    },

    // Generic request method for custom endpoints
    get: <T>(endpoint: string) => authRequest<T>(endpoint),

    post: <T>(endpoint: string, data?: unknown) =>
      authRequest<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }),

    patch: <T>(endpoint: string, data?: unknown) =>
      authRequest<T>(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      }),

    delete: <T>(endpoint: string) =>
      authRequest<T>(endpoint, { method: 'DELETE' }),
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
