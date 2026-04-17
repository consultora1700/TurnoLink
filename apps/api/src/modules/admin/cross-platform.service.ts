import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service that forwards admin API calls to connected platform instances.
 * Turnolink acts as the central admin; write operations are mirrored to Colmen.
 * Read operations aggregate results from both platforms.
 */
@Injectable()
export class CrossPlatformService {
  private readonly logger = new Logger(CrossPlatformService.name);
  private readonly remoteUrl: string | null;
  private readonly remoteAdminKey: string | null;
  private readonly remotePlatformName: string;

  constructor(private readonly configService: ConfigService) {
    this.remoteUrl = this.configService.get<string>('REMOTE_PLATFORM_API_URL') || null;
    this.remoteAdminKey = this.configService.get<string>('REMOTE_PLATFORM_ADMIN_KEY') || null;
    this.remotePlatformName = this.configService.get<string>('REMOTE_PLATFORM_NAME') || 'colmen';
  }

  /** Whether a remote platform is configured */
  get isEnabled(): boolean {
    return !!(this.remoteUrl && this.remoteAdminKey);
  }

  get platformName(): string {
    return this.remotePlatformName;
  }

  /**
   * Forward a write operation to the remote platform.
   * Returns the remote response or null if disabled/failed.
   */
  async forwardWrite<T = any>(
    method: 'POST' | 'PATCH' | 'DELETE',
    endpoint: string,
    body?: any,
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    if (!this.isEnabled) {
      return { success: false, error: 'Remote platform not configured' };
    }

    try {
      const url = `${this.remoteUrl}/api${endpoint}`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': this.remoteAdminKey!,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        this.logger.warn(`Remote ${method} ${endpoint} failed: ${res.status} ${errBody}`);
        return { success: false, error: `HTTP ${res.status}` };
      }

      const data = await res.json().catch(() => ({}));
      this.logger.log(`Remote ${method} ${endpoint} OK`);
      return { success: true, data };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Remote ${method} ${endpoint} error: ${msg}`);
      return { success: false, error: msg };
    }
  }

  /**
   * Fetch data from the remote platform (GET).
   * Returns the response or null if disabled/failed.
   */
  async forwardRead<T = any>(
    endpoint: string,
    query?: Record<string, string>,
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    if (!this.isEnabled) {
      return { success: false, error: 'Remote platform not configured' };
    }

    try {
      let url = `${this.remoteUrl}/api${endpoint}`;
      if (query) {
        const params = new URLSearchParams(query);
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': this.remoteAdminKey!,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        this.logger.warn(`Remote GET ${endpoint} failed: ${res.status}`);
        return { success: false, error: `HTTP ${res.status}` };
      }

      const data = await res.json().catch(() => ({}));
      return { success: true, data };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Remote GET ${endpoint} error: ${msg}`);
      return { success: false, error: msg };
    }
  }

  /**
   * Tag an array of items with a platform field.
   */
  tagPlatform<T>(items: T[], platform: string): (T & { platform: string })[] {
    return items.map(item => ({ ...item, platform }));
  }

  /**
   * Merge local + remote stats (sum numeric fields).
   */
  mergeStats(local: Record<string, any>, remote: Record<string, any>): Record<string, any> {
    const merged: Record<string, any> = {};
    for (const key of Object.keys(local)) {
      if (typeof local[key] === 'number' && typeof remote[key] === 'number') {
        merged[key] = local[key] + remote[key];
      } else {
        merged[key] = local[key];
      }
    }
    // Add per-platform breakdown
    merged._platforms = {
      turnolink: local,
      [this.remotePlatformName]: remote,
    };
    return merged;
  }

  /**
   * Merge paginated responses from both platforms.
   * Supports both { data, total } and { data, pagination: { total, page, limit } } shapes.
   */
  mergePaginated<T>(
    local: { data: T[]; pagination?: { total: number; page?: number; limit?: number }; total?: number },
    remote: { data: T[]; pagination?: { total: number }; total?: number },
    localPlatform = 'turnolink',
  ) {
    const localTagged = this.tagPlatform(local.data, localPlatform);
    const remoteTagged = this.tagPlatform(remote.data, this.remotePlatformName);
    const localTotal = local.pagination?.total ?? local.total ?? local.data.length;
    const remoteTotal = remote.pagination?.total ?? remote.total ?? remote.data.length;
    return {
      data: [...localTagged, ...remoteTagged],
      pagination: {
        total: localTotal + remoteTotal,
        page: local.pagination?.page,
        limit: local.pagination?.limit,
      },
    };
  }
}
