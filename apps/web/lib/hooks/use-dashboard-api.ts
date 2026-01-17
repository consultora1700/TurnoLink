'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Types for dashboard
export interface DashboardProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  sku: string | null;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  isActive: boolean;
  isFeatured: boolean;
  type: 'PHYSICAL' | 'DIGITAL' | 'SERVICE';
  categoryId: string | null;
  images: Array<{ id: string; url: string; alt: string | null; order: number }>;
  variants: Array<{ id: string; name: string; options: string[] }>;
  category: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  order: number;
  productCount: number;
}

export interface DashboardOrder {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingAddress: Record<string, unknown> | null;
  billingAddress: Record<string, unknown> | null;
  shippingMethod: string | null;
  notes: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    variantInfo: string | null;
    sku: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  statusHistory: Array<{
    status: string;
    note: string | null;
    createdAt: string;
  }>;
  payment: {
    id: string;
    status: string;
    method: string | null;
    paidAt: string | null;
  } | null;
}

export interface DashboardCoupon {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usagePerCustomer: number;
  usageCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardBranding {
  id: string;
  primaryColor: string;
  secondaryColor: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  fontFamily: string | null;
  headingFontFamily: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  faviconUrl: string | null;
  bannerImageUrl: string | null;
  welcomeTitle: string | null;
  welcomeSubtitle: string | null;
  footerText: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  showPrices: boolean;
  showStock: boolean;
  enableWishlist: boolean;
  enableReviews: boolean;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  byStatus: Record<string, number>;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

// Authenticated API Client for dashboard
class DashboardApiClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(accessToken: string) {
    this.baseUrl = `${API_URL}/api`;
    this.accessToken = accessToken;
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Products
  async getProducts(params?: {
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: DashboardProduct[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return this.fetch(`/products?${searchParams}`);
  }

  async getProduct(id: string): Promise<DashboardProduct> {
    return this.fetch(`/products/${id}`);
  }

  async createProduct(data: Partial<DashboardProduct>): Promise<DashboardProduct> {
    return this.fetch('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<DashboardProduct>): Promise<DashboardProduct> {
    return this.fetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.fetch(`/products/${id}`, { method: 'DELETE' });
  }

  // Categories
  async getCategories(): Promise<DashboardCategory[]> {
    return this.fetch('/categories');
  }

  async createCategory(data: Partial<DashboardCategory>): Promise<DashboardCategory> {
    return this.fetch('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: Partial<DashboardCategory>): Promise<DashboardCategory> {
    return this.fetch(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return this.fetch(`/categories/${id}`, { method: 'DELETE' });
  }

  // Orders
  async getOrders(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: DashboardOrder[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return this.fetch(`/orders?${searchParams}`);
  }

  async getOrder(id: string): Promise<DashboardOrder> {
    return this.fetch(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string, note?: string): Promise<DashboardOrder> {
    return this.fetch(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  }

  // Coupons
  async getCoupons(): Promise<DashboardCoupon[]> {
    return this.fetch('/coupons');
  }

  async createCoupon(data: Partial<DashboardCoupon>): Promise<DashboardCoupon> {
    return this.fetch('/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCoupon(id: string, data: Partial<DashboardCoupon>): Promise<DashboardCoupon> {
    return this.fetch(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCoupon(id: string): Promise<void> {
    return this.fetch(`/coupons/${id}`, { method: 'DELETE' });
  }

  // Branding
  async getBranding(): Promise<DashboardBranding | null> {
    try {
      return await this.fetch('/branding');
    } catch {
      return null;
    }
  }

  async updateBranding(data: Partial<DashboardBranding>): Promise<DashboardBranding> {
    return this.fetch('/branding', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Stats
  async getStats(period?: 'day' | 'week' | 'month'): Promise<DashboardStats> {
    const params = period ? `?period=${period}` : '';
    return this.fetch(`/orders/stats${params}`);
  }

  // 2FA
  async get2FAStatus(): Promise<{ enabled: boolean; verifiedAt: string | null }> {
    try {
      return await this.fetch('/auth/2fa/status');
    } catch {
      return { enabled: false, verifiedAt: null };
    }
  }

  async setup2FA(): Promise<{ qrCode: string; secret: string }> {
    return this.fetch('/auth/2fa/setup', { method: 'POST' });
  }

  async verify2FA(code: string): Promise<{ success: boolean; backupCodes?: string[] }> {
    return this.fetch('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async disable2FA(code: string): Promise<{ success: boolean }> {
    return this.fetch('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async getBackupCodes(): Promise<{ codes: string[] }> {
    return this.fetch('/auth/2fa/backup-codes');
  }
}

// Hook to get authenticated API client
export function useDashboardApi() {
  const { data: session } = useSession();

  if (!session?.accessToken) {
    return null;
  }

  return new DashboardApiClient(session.accessToken as string);
}

// Products hooks
export function useDashboardProducts(params?: {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}) {
  const { data: session } = useSession();
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const api = new DashboardApiClient(session.accessToken as string);
      const data = await api.getProducts(params);
      setProducts(data.data);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, params?.search, params?.categoryId, params?.isActive]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, total, loading, error, refetch: fetchProducts };
}

export function useDashboardProduct(productId: string | null) {
  const { data: session } = useSession();
  const [product, setProduct] = useState<DashboardProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.accessToken || !productId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const api = new DashboardApiClient(session.accessToken as string);
    api
      .getProduct(productId)
      .then(setProduct)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error loading product');
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [session?.accessToken, productId]);

  return { product, loading, error };
}

// Categories hooks
export function useDashboardCategories() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<DashboardCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const api = new DashboardApiClient(session.accessToken as string);
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

// Orders hooks
export function useDashboardOrders(params?: { status?: string; search?: string }) {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const api = new DashboardApiClient(session.accessToken as string);
      const data = await api.getOrders(params);
      setOrders(data.data);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, params?.status, params?.search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, total, loading, error, refetch: fetchOrders };
}

export function useDashboardOrder(orderId: string | null) {
  const { data: session } = useSession();
  const [order, setOrder] = useState<DashboardOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!session?.accessToken || !orderId) return;

    setLoading(true);
    setError(null);

    try {
      const api = new DashboardApiClient(session.accessToken as string);
      const data = await api.getOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading order');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, orderId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { order, loading, error, refetch };
}

// Coupons hooks
export function useDashboardCoupons() {
  const { data: session } = useSession();
  const [coupons, setCoupons] = useState<DashboardCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const api = new DashboardApiClient(session.accessToken as string);
      const data = await api.getCoupons();
      setCoupons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading coupons');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  return { coupons, loading, error, refetch: fetchCoupons };
}

// Branding hooks
export function useDashboardBranding() {
  const { data: session } = useSession();
  const [branding, setBranding] = useState<DashboardBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBranding = useCallback(async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const api = new DashboardApiClient(session.accessToken as string);
      const data = await api.getBranding();
      setBranding(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading branding');
      setBranding(null);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  return { branding, loading, error, refetch: fetchBranding };
}

// Stats hooks
export function useDashboardStats(period?: 'day' | 'week' | 'month') {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const api = new DashboardApiClient(session.accessToken as string);
      const data = await api.getStats(period);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, period]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stats, loading, error, refetch };
}
