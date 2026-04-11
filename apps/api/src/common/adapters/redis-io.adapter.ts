import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';

/**
 * Custom Socket.IO adapter that uses Redis for cross-process room/event sync.
 * Required for PM2 cluster mode where multiple processes share the same port.
 *
 * Without this, each process has its own in-memory room state and events
 * emitted on process A won't reach clients connected to process B.
 */
export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

  async connectToRedis(): Promise<void> {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

    try {
      const pubClient = new Redis({ host: redisHost, port: redisPort, lazyConnect: true });
      const subClient = new Redis({ host: redisHost, port: redisPort, lazyConnect: true });

      pubClient.on('error', (err) => this.logger.warn(`Redis pub error: ${err.message}`));
      subClient.on('error', (err) => this.logger.warn(`Redis sub error: ${err.message}`));

      await Promise.all([pubClient.connect(), subClient.connect()]);

      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.logger.log('Redis adapter connected for WebSocket cluster sync');
    } catch (err: any) {
      this.logger.warn(`Redis adapter failed: ${err.message}. WebSocket will work single-process only.`);
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: true,
        credentials: true,
      },
    });

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    return server;
  }
}
