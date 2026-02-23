import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true, // Buffer logs until Winston is ready
  });

  // Use Winston as the NestJS logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

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
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
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

  // Global prefix
  app.setGlobalPrefix('api');

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

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  logger.log(`API running on http://localhost:${port}`, 'Bootstrap');
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap();
