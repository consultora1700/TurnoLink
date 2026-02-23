/**
 * Admin API Client - API client for admin panel endpoints
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// =============================================================================
// Types
// =============================================================================

export interface AdminOverviewStats {
  mrr: number;
  mrrGrowth: number;
  totalTenants: number;
  newTenantsThisMonth: number;
  totalUsers: number;
  newUsersThisMonth: number;
  conversionRate: number;
  totalBookings: number;
  bookingsThisMonth: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  payments: number;
}

export interface RevenueStats {
  period: string;
  data: RevenueDataPoint[];
  totalRevenue: number;
  averagePayment: number;
}

export interface GrowthStats {
  tenants: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growthPercentage: number;
  };
  users: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growthPercentage: number;
  };
  bookings: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growthPercentage: number;
  };
}

export interface ChurnStats {
  churnRate: number;
  cancelledThisMonth: number;
  cancelledLastMonth: number;
  reasons: {
    reason: string;
    count: number;
    percentage: number;
  }[];
  atRiskTenants: {
    id: string;
    name: string;
    lastActivity: string;
    subscriptionStatus: string;
  }[];
}

export interface SubscriptionDistribution {
  planName: string;
  count: number;
  percentage: number;
  revenue: number;
}

export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  subscription: {
    id: string;
    status: string;
    trialEndAt: string | null;
    currentPeriodEnd: string | null;
    plan: {
      id: string;
      name: string;
      priceMonthly: number;
    } | null;
  } | null;
  _count: {
    bookings: number;
    customers: number;
    employees: number;
    services: number;
    branches: number;
  };
}

export interface TenantDetails {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  subscription: {
    plan: string;
    status: string;
    trialEndAt: string | null;
    currentPeriodEnd: string | null;
  } | null;
  stats: {
    totalBookings: number;
    totalCustomers: number;
    totalEmployees: number;
    totalServices: number;
    totalBranches: number;
  };
  recentActivity: {
    action: string;
    timestamp: string;
    details: string;
  }[];
}

export interface AdminSubscription {
  id: string;
  tenantId: string;
  planId: string;
  status: string;
  billingPeriod: string;
  trialStartAt: string | null;
  trialEndAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    email: string | null;
  };
  plan: {
    id: string;
    name: string;
    priceMonthly: number;
    priceYearly: number | null;
  };
}

export interface AdminPayment {
  id: string;
  subscriptionId: string;
  mpPaymentId: string | null;
  amount: number;
  currency: string;
  status: string;
  periodStart: string | null;
  periodEnd: string | null;
  paidAt: string | null;
  createdAt: string;
  subscription: {
    tenant: {
      id: string;
      name: string;
      slug: string;
    };
    plan: {
      name: string;
    };
  };
}

export interface PaymentStats {
  totalThisMonth: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  averagePaymentAmount: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string | null;
  userId: string | null;
  tenantId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  details: Record<string, any> | null;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface SecurityAlert {
  id: string;
  createdAt: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  metadata: Record<string, any> | null;
  resolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export interface SecurityMetrics {
  loginsLast24h: number;
  twoFactorEnabled: number;
  twoFactorPercentage: number;
  uniqueIPs: number;
  activeSessions: number;
  failedLoginAttempts: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number | null;
  trialDays: number;
  maxBranches: number;
  maxEmployees: number;
  maxServices: number | null;
  maxBookingsMonth: number | null;
  maxCustomers: number | null;
  features: string;
  isPopular: boolean;
  isActive: boolean;
  order: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================================================
// API Client Class
// =============================================================================

class AdminApiClient {
  private adminKey: string | null = null;

  setAdminKey(key: string) {
    this.adminKey = key;
  }

  clearAdminKey() {
    this.adminKey = null;
  }

  getAdminKey(): string | null {
    return this.adminKey;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.adminKey) {
      headers['X-Admin-Key'] = this.adminKey;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Error de conexión',
        statusCode: response.status,
      }));
      throw new Error(error.message || 'Error de conexión');
    }

    return response.json();
  }

  // ==================== DASHBOARD & STATS ====================

  async getOverviewStats(): Promise<AdminOverviewStats> {
    return this.request('/api/admin/stats/overview');
  }

  async getRevenueStats(period: string = '12months'): Promise<RevenueStats> {
    return this.request(`/api/admin/stats/revenue?period=${period}`);
  }

  async getGrowthStats(): Promise<GrowthStats> {
    return this.request('/api/admin/stats/growth');
  }

  async getChurnStats(): Promise<ChurnStats> {
    return this.request('/api/admin/stats/churn');
  }

  async getSubscriptionDistribution(): Promise<SubscriptionDistribution[]> {
    return this.request('/api/admin/stats/subscription-distribution');
  }

  async getRecentTenants(limit: number = 5): Promise<AdminTenant[]> {
    return this.request(`/api/admin/dashboard/recent-tenants?limit=${limit}`);
  }

  async getRecentAlerts(limit: number = 5): Promise<SecurityAlert[]> {
    return this.request(`/api/admin/dashboard/recent-alerts?limit=${limit}`);
  }

  // ==================== TENANTS ====================

  async getTenants(params: Record<string, string> = {}): Promise<PaginatedResponse<AdminTenant>> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/tenants?${queryString}`);
  }

  async getTenantById(id: string): Promise<TenantDetails> {
    return this.request(`/api/admin/tenants/${id}`);
  }

  async updateTenantStatus(id: string, status: string, reason?: string): Promise<AdminTenant> {
    return this.request(`/api/admin/tenants/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  }

  async getTenantActivity(
    id: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<AuditLog>> {
    return this.request(`/api/admin/tenants/${id}/activity?page=${page}&limit=${limit}`);
  }

  // ==================== SUBSCRIPTIONS ====================

  async getSubscriptions(params: Record<string, string> = {}): Promise<PaginatedResponse<AdminSubscription>> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/subscriptions?${queryString}`);
  }

  async getExpiringSubscriptions(days: number = 7): Promise<AdminSubscription[]> {
    return this.request(`/api/admin/subscriptions/expiring?days=${days}`);
  }

  async getTrialSubscriptions(): Promise<AdminSubscription[]> {
    return this.request('/api/admin/subscriptions/trials');
  }

  async updateSubscription(id: string, data: Partial<{
    planId: string;
    status: string;
    trialEndAt: string;
    currentPeriodEnd: string;
    billingPeriod: string;
    notes: string;
  }>): Promise<AdminSubscription> {
    return this.request(`/api/admin/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async extendTrial(id: string, days: number, reason?: string): Promise<AdminSubscription> {
    return this.request(`/api/admin/subscriptions/${id}/extend-trial`, {
      method: 'POST',
      body: JSON.stringify({ days, reason }),
    });
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return this.request('/api/admin/subscription-plans');
  }

  // ==================== PAYMENTS ====================

  async getPayments(params: Record<string, string> = {}): Promise<PaginatedResponse<AdminPayment>> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/payments?${queryString}`);
  }

  async getPaymentStats(): Promise<PaymentStats> {
    return this.request('/api/admin/payments/stats');
  }

  async getFailedPayments(): Promise<AdminPayment[]> {
    return this.request('/api/admin/payments/failed');
  }

  // ==================== USERS ====================

  async getUsers(params: Record<string, string> = {}): Promise<PaginatedResponse<AdminUser>> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/users?${queryString}`);
  }

  async getUserById(id: string): Promise<AdminUser & { totpSecret?: { isEnabled: boolean } }> {
    return this.request(`/api/admin/users/${id}`);
  }

  // ==================== SECURITY ====================

  async getAuditLogs(params: Record<string, string> = {}): Promise<PaginatedResponse<AuditLog>> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/security/audit-logs?${queryString}`);
  }

  async getSecurityAlerts(params: Record<string, string> = {}): Promise<PaginatedResponse<SecurityAlert>> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/security/alerts?${queryString}`);
  }

  async getLoginAttempts(page: number = 1, limit: number = 50): Promise<PaginatedResponse<AuditLog>> {
    return this.request(`/api/admin/security/login-attempts?page=${page}&limit=${limit}`);
  }

  async resolveSecurityAlert(id: string, notes?: string): Promise<SecurityAlert> {
    return this.request(`/api/admin/security/alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    return this.request('/api/admin/security/metrics');
  }

  // ==================== AUTH ====================

  async validateAdminKey(key: string): Promise<boolean> {
    try {
      const originalKey = this.adminKey;
      this.adminKey = key;
      await this.request('/api/admin/stats/overview');
      return true;
    } catch {
      this.adminKey = null;
      return false;
    }
  }
}

// Export singleton instance
export const adminApi = new AdminApiClient();
