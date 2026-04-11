import { Controller, Get, Inject, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { SentryService } from '../../common/sentry/sentry.service';
import Redis from 'ioredis';
import * as fs from 'fs';
import * as os from 'os';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sentry: SentryService,
    @Optional() @Inject('REDIS_CLIENT') private readonly redis?: Redis,
  ) {}

  @Public()
  @Get('sentry-test')
  @ApiOperation({ summary: 'Test Sentry error tracking' })
  sentryTest() {
    const err = new Error('Test error — Sentry verification from TurnoLink');
    this.sentry.captureException(err, { test: true, timestamp: new Date().toISOString() });
    return { sent: true, message: 'Test error sent to Sentry' };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Full health check — DB, Redis, disk, memory' })
  async check() {
    const startTime = Date.now();

    // Database
    let dbStatus = 'healthy';
    let dbLatency = 0;
    try {
      const t = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - t;
    } catch {
      dbStatus = 'unhealthy';
    }

    // Redis
    let redisStatus = 'healthy';
    let redisLatency = 0;
    try {
      if (this.redis) {
        const t = Date.now();
        await this.redis.ping();
        redisLatency = Date.now() - t;
      } else {
        redisStatus = 'not_configured';
      }
    } catch {
      redisStatus = 'unhealthy';
    }

    // Disk (uploads partition)
    let diskStatus = 'healthy';
    let diskFreeGB = 0;
    try {
      const stats = fs.statfsSync('/var/www/turnolink/backend/uploads');
      diskFreeGB = Math.round((stats.bavail * stats.bsize) / (1024 ** 3) * 10) / 10;
      if (diskFreeGB < 1) diskStatus = 'low';
    } catch {
      diskStatus = 'unknown';
    }

    // Memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedPercent = Math.round((1 - freeMem / totalMem) * 100);
    const memStatus = usedPercent > 90 ? 'critical' : usedPercent > 80 ? 'warning' : 'healthy';

    const allHealthy = dbStatus === 'healthy' && redisStatus !== 'unhealthy' && diskStatus === 'healthy' && memStatus === 'healthy';

    return {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      responseTime: Date.now() - startTime,
      services: {
        database: { status: dbStatus, latency: dbLatency },
        redis: { status: redisStatus, latency: redisLatency },
        disk: { status: diskStatus, freeGB: diskFreeGB },
        memory: { status: memStatus, usedPercent, freeGB: Math.round(freeMem / (1024 ** 3) * 10) / 10 },
        api: 'healthy',
      },
    };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch {
      return { status: 'not_ready' };
    }
  }

  @Public()
  @Get('live')
  @ApiOperation({ summary: 'Liveness check' })
  live() {
    return { status: 'alive' };
  }
}
