import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compression = require('compression');
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';

async function bootstrap() {
  // Fail fast: validate required environment variables
  const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
  const optionalButWarn = ['JWT_REFRESH_SECRET', 'CORS_ORIGINS', 'RESEND_API_KEY'];
  for (const env of requiredEnvVars) {
    if (!process.env[env]) {
      throw new Error(`FATAL: Missing required environment variable: ${env}`);
    }
  }
  for (const env of optionalButWarn) {
    if (!process.env[env]) {
      console.warn(`WARNING: Environment variable ${env} is not set. Some features may not work.`);
    }
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true, // Buffer logs until Winston is ready
  });

  // Use Winston as the NestJS logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Trust proxy (nginx) so rate-limiting and IP detection use the real client IP
  app.set('trust proxy', 1);

  // Global exception filter (catches Prisma errors, hides stack traces)
  app.useGlobalFilters(new HttpExceptionFilter());

  // Serve static files from uploads directory (30-day cache, UUID = immutable)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    immutable: true,
  });

  // Compress responses (gzip/brotli) — reduces payload ~70% for JSON/HTML
  app.use(compression());

  // Security with proper CSP for images
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Development localhost URLs
  const devLocalhost = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", ...(isDevelopment ? ["'unsafe-inline'", "'unsafe-eval'"] : [])],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: [
            "'self'",
            'data:',
            'blob:',
            'https:',
            // Allow localhost in development
            ...(isDevelopment ? devLocalhost : []),
          ],
          connectSrc: [
            "'self'",
            'https:',
            'wss:',
            ...(isDevelopment ? [...devLocalhost, 'ws://localhost:3000', 'ws://localhost:3001'] : []),
          ],
          mediaSrc: ["'self'", 'https:', 'data:', 'blob:'],
          objectSrc: ["'none'"],
          frameSrc: ["'self'", 'https:'],
          upgradeInsecureRequests: isDevelopment ? null : [],
        },
      },
    }),
  );

  // CORS - Soporta múltiples orígenes desde CORS_ORIGINS
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : [process.env.APP_URL || 'http://localhost:3000'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Performance monitoring — log slow requests (>3s)
  app.use((req: any, res: any, next: any) => {
    const start = Date.now();
    const originalEnd = res.end;
    res.end = function (...args: any[]) {
      const duration = Date.now() - start;
      if (duration > 3000) {
        logger.warn(
          `SLOW REQUEST: ${req.method} ${req.originalUrl} — ${duration}ms (status ${res.statusCode})`,
          'PerformanceMonitor',
        );
      }
      originalEnd.apply(res, args);
    };
    next();
  });

  // Global prefix — exclude socket.io path so WebSocket gateway is reachable
  app.setGlobalPrefix('api', {
    exclude: ['/socket.io(.*)'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('TurnoLink API')
      .setDescription('API para el Sistema de Turnos Online Multi-Tenant')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Autenticación')
      .addTag('tenants', 'Gestión de negocios')
      .addTag('services', 'Gestión de servicios')
      .addTag('bookings', 'Gestión de turnos')
      .addTag('customers', 'Gestión de clientes')
      .addTag('schedules', 'Gestión de horarios')
      .addTag('media', 'Gestión de archivos')
      .addTag('admin', 'Super Admin')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // WebSocket adapter with Redis for PM2 cluster mode
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  // Graceful shutdown — required for PM2 zero-downtime reload
  // When PM2 sends SIGINT, NestJS closes DB connections, WebSockets, etc. before exiting
  app.enableShutdownHooks();

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  // Signal PM2 that this instance is ready to receive traffic
  if (process.send) {
    process.send('ready');
  }

  logger.log(`API running on http://localhost:${port}`, 'Bootstrap');
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap();
