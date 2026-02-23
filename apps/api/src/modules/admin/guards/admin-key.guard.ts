import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class AdminKeyGuard implements CanActivate {
  private readonly logger = new Logger(AdminKeyGuard.name);
  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_DURATION_MINUTES = 15;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ipAddress = this.getClientIp(request);

    // Check if IP is blocked
    const isBlocked = await this.isIpBlocked(ipAddress);
    if (isBlocked) {
      this.logger.warn(`Blocked IP attempted access: ${ipAddress}`);
      await this.logSecurityAlert(
        'ADMIN_LOGIN_FAILED',
        'MEDIUM',
        'Blocked IP Attempted Access',
        `IP ${ipAddress} attempted to access admin while blocked`,
        { ipAddress },
      );
      throw new UnauthorizedException('Too many failed attempts. Please try again later.');
    }

    // Get admin key from header or query parameter
    const adminKey = this.extractAdminKey(request);

    if (!adminKey) {
      await this.recordFailedAttempt(ipAddress);
      throw new UnauthorizedException('Admin key is required');
    }

    // Get expected key from environment
    const expectedKey = this.configService.get<string>('ADMIN_API_KEY');

    if (!expectedKey) {
      this.logger.error('ADMIN_API_KEY not configured');
      throw new UnauthorizedException('Admin access not configured');
    }

    // Timing-safe comparison
    const isValid = this.timingSafeCompare(adminKey, expectedKey);

    if (!isValid) {
      await this.recordFailedAttempt(ipAddress);
      this.logger.warn(`Invalid admin key attempt from IP: ${ipAddress}`);

      // Check if this triggers a block
      const attempts = await this.getAttemptCount(ipAddress);
      if (attempts >= this.MAX_ATTEMPTS) {
        await this.logSecurityAlert(
          'MULTIPLE_FAILED_LOGINS',
          'HIGH',
          'Multiple Failed Admin Login Attempts',
          `IP ${ipAddress} has been blocked after ${attempts} failed attempts`,
          { ipAddress, attempts },
        );
      }

      throw new UnauthorizedException('Invalid admin key');
    }

    // Clear any previous failed attempts on successful auth
    await this.clearFailedAttempts(ipAddress);

    // Log successful admin access
    await this.logAuditEntry(
      'ADMIN_LOGIN',
      'AdminSession',
      null,
      null,
      null,
      ipAddress,
      request.headers['user-agent'] || null,
      { path: request.path },
    );

    // Attach admin flag to request
    (request as any).isAdmin = true;

    return true;
  }

  private extractAdminKey(request: Request): string | null {
    // Check header first (preferred for security)
    const headerKey = request.headers['x-admin-key'] as string;
    if (headerKey) return headerKey;

    // Check Authorization header
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('AdminKey ')) {
      return authHeader.substring(9);
    }

    // Fallback to query parameter (less secure, but useful for redirects)
    const queryKey = request.query['admin_key'] as string;
    if (queryKey) return queryKey;

    return null;
  }

  private getClientIp(request: Request): string {
    const xForwardedFor = request.headers['x-forwarded-for'];
    if (xForwardedFor) {
      const ips = (xForwardedFor as string).split(',');
      return ips[0].trim();
    }
    return request.ip || request.socket.remoteAddress || 'unknown';
  }

  private timingSafeCompare(a: string, b: string): boolean {
    try {
      const bufA = Buffer.from(a);
      const bufB = Buffer.from(b);

      if (bufA.length !== bufB.length) {
        // Still do comparison to maintain constant time
        crypto.timingSafeEqual(bufA, bufA);
        return false;
      }

      return crypto.timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }

  private async isIpBlocked(ipAddress: string): Promise<boolean> {
    const rateLimit = await this.prisma.adminRateLimit.findUnique({
      where: { ipAddress },
    });

    if (!rateLimit) return false;

    if (rateLimit.blockedUntil && rateLimit.blockedUntil > new Date()) {
      return true;
    }

    return false;
  }

  private async getAttemptCount(ipAddress: string): Promise<number> {
    const rateLimit = await this.prisma.adminRateLimit.findUnique({
      where: { ipAddress },
    });
    return rateLimit?.attempts || 0;
  }

  private async recordFailedAttempt(ipAddress: string): Promise<void> {
    const existing = await this.prisma.adminRateLimit.findUnique({
      where: { ipAddress },
    });

    const now = new Date();
    const attempts = (existing?.attempts || 0) + 1;
    const shouldBlock = attempts >= this.MAX_ATTEMPTS;
    const blockedUntil = shouldBlock
      ? new Date(now.getTime() + this.BLOCK_DURATION_MINUTES * 60 * 1000)
      : null;

    await this.prisma.adminRateLimit.upsert({
      where: { ipAddress },
      create: {
        ipAddress,
        attempts: 1,
        lastAttemptAt: now,
      },
      update: {
        attempts,
        lastAttemptAt: now,
        blockedUntil,
      },
    });

    // Log failed attempt
    await this.logAuditEntry(
      'ADMIN_LOGIN_FAILED',
      'AdminSession',
      null,
      null,
      null,
      ipAddress,
      null,
      { attempts },
      'WARNING',
    );
  }

  private async clearFailedAttempts(ipAddress: string): Promise<void> {
    await this.prisma.adminRateLimit.deleteMany({
      where: { ipAddress },
    });
  }

  private async logAuditEntry(
    action: string,
    entityType: string,
    entityId: string | null,
    userId: string | null,
    tenantId: string | null,
    ipAddress: string | null,
    userAgent: string | null,
    details: any,
    severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO',
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          entityType,
          entityId,
          userId,
          tenantId,
          ipAddress,
          userAgent,
          details,
          severity,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
    }
  }

  private async logSecurityAlert(
    type: string,
    severity: string,
    title: string,
    description: string,
    metadata: any,
  ): Promise<void> {
    try {
      await this.prisma.securityAlert.create({
        data: {
          type: type as any,
          severity: severity as any,
          title,
          description,
          metadata,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create security alert', error);
    }
  }
}
