export interface PlatformOverviewStats {
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

export interface RevenueStats {
  period: string;
  data: {
    date: string;
    revenue: number;
    payments: number;
  }[];
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
    lastActivity: Date;
    subscriptionStatus: string;
  }[];
}

export interface SubscriptionDistribution {
  planName: string;
  count: number;
  percentage: number;
  revenue: number;
}

export interface TenantDetails {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: Date;
  subscription: {
    plan: string;
    status: string;
    trialEndAt: Date | null;
    currentPeriodEnd: Date | null;
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
    timestamp: Date;
    details: string;
  }[];
}

export interface PaymentStats {
  totalThisMonth: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  averagePaymentAmount: number;
}

export interface SecurityMetrics {
  loginsLast24h: number;
  twoFactorEnabled: number;
  twoFactorPercentage: number;
  uniqueIPs: number;
  activeSessions: number;
  failedLoginAttempts: number;
}
