import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  // ============ Availability ============
  async getAvailability(tenantId: string, date: string, serviceId?: string): Promise<any | null> {
    const key = `avail:${tenantId}:${date}:${serviceId || 'all'}`;
    return this.cache.get(key);
  }

  async setAvailability(tenantId: string, date: string, data: any, serviceId?: string): Promise<void> {
    const key = `avail:${tenantId}:${date}:${serviceId || 'all'}`;
    await this.cache.set(key, data, 10 * 1000); // 10s TTL
  }

  async invalidateAvailability(tenantId: string, date: string): Promise<void> {
    // Invalidate all service variants for this date
    const store = (this.cache as any).store;
    if (store?.keys) {
      const keys: string[] = await store.keys(`avail:${tenantId}:${date}:*`);
      if (keys.length > 0) {
        await Promise.all(keys.map((k: string) => this.cache.del(k)));
      }
    }
  }

  // ============ Tenant Settings ============
  async getTenantSettings(tenantId: string): Promise<any | null> {
    return this.cache.get(`tenant-settings:${tenantId}`);
  }

  async setTenantSettings(tenantId: string, data: any): Promise<void> {
    await this.cache.set(`tenant-settings:${tenantId}`, data, 60 * 60 * 1000); // 1h TTL
  }

  async invalidateTenantSettings(tenantId: string): Promise<void> {
    await this.cache.del(`tenant-settings:${tenantId}`);
  }

  // ============ Tenant Services ============
  async getTenantServices(tenantId: string): Promise<any | null> {
    return this.cache.get(`tenant-services:${tenantId}`);
  }

  async setTenantServices(tenantId: string, data: any): Promise<void> {
    await this.cache.set(`tenant-services:${tenantId}`, data, 30 * 60 * 1000); // 30min TTL
  }

  async invalidateTenantServices(tenantId: string): Promise<void> {
    await this.cache.del(`tenant-services:${tenantId}`);
  }

  // ============ Tenant By Slug ============
  async getTenantBySlug(slug: string): Promise<any | null> {
    return this.cache.get(`tenant-slug:${slug}`);
  }

  async setTenantBySlug(slug: string, data: any): Promise<void> {
    await this.cache.set(`tenant-slug:${slug}`, data, 5 * 60 * 1000); // 5min TTL
  }

  async invalidateTenantBySlug(slug: string): Promise<void> {
    await this.cache.del(`tenant-slug:${slug}`);
  }

  // ============ Public Products ============
  async getPublicProducts(tenantId: string, categorySlug?: string): Promise<any | null> {
    const key = `products:${tenantId}:${categorySlug || 'all'}`;
    return this.cache.get(key);
  }

  async setPublicProducts(tenantId: string, data: any, categorySlug?: string): Promise<void> {
    const key = `products:${tenantId}:${categorySlug || 'all'}`;
    await this.cache.set(key, data, 2 * 60 * 1000); // 2min TTL
  }

  async invalidatePublicProducts(tenantId: string): Promise<void> {
    const store = (this.cache as any).store;
    if (store?.keys) {
      const keys: string[] = await store.keys(`products:${tenantId}:*`);
      if (keys.length > 0) {
        await Promise.all(keys.map((k: string) => this.cache.del(k)));
      }
    }
  }

  // ============ Schedules ============
  async getSchedules(tenantId: string): Promise<any | null> {
    return this.cache.get(`schedules:${tenantId}`);
  }

  async setSchedules(tenantId: string, data: any): Promise<void> {
    await this.cache.set(`schedules:${tenantId}`, data, 30 * 1000); // 30s TTL
  }

  async invalidateSchedules(tenantId: string): Promise<void> {
    await this.cache.del(`schedules:${tenantId}`);
  }
}
