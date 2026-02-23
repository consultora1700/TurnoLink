import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

/**
 * Custom format for development - human readable with colors
 */
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, context, trace, ...meta }) => {
    const contextStr = context ? `[${context}]` : '';
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    const traceStr = trace ? `\n${trace}` : '';
    return `${timestamp} ${level} ${contextStr} ${message}${metaStr}${traceStr}`;
  }),
);

/**
 * Custom format for production - JSON for log aggregation (ELK, CloudWatch, etc.)
 */
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

/**
 * Log levels following RFC 5424 severity
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
};

/**
 * Determine log level based on environment
 */
const getLogLevel = (): string => {
  const env = process.env.NODE_ENV || 'development';
  const level = process.env.LOG_LEVEL;

  if (level) return level;

  switch (env) {
    case 'production':
      return 'info';
    case 'test':
      return 'warn';
    default:
      return 'debug';
  }
};

/**
 * Create transports based on environment
 */
const createTransports = (): winston.transport[] => {
  const transports: winston.transport[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  // Console transport - always enabled
  transports.push(
    new winston.transports.Console({
      format: isProduction ? prodFormat : devFormat,
    }),
  );

  // File transports - only in production
  if (isProduction) {
    // Error logs
    transports.push(
      new winston.transports.File({
        filename: '/var/www/turnolink/logs/error.log',
        level: 'error',
        format: prodFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        tailable: true,
      }),
    );

    // Combined logs
    transports.push(
      new winston.transports.File({
        filename: '/var/www/turnolink/logs/combined.log',
        format: prodFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        tailable: true,
      }),
    );
  }

  return transports;
};

/**
 * Winston configuration for NestJS
 */
export const winstonConfig: WinstonModuleOptions = {
  levels,
  level: getLogLevel(),
  transports: createTransports(),
  // Handle uncaught exceptions
  exceptionHandlers: process.env.NODE_ENV === 'production'
    ? [
        new winston.transports.File({
          filename: '/var/www/turnolink/logs/exceptions.log',
        }),
      ]
    : undefined,
  // Handle unhandled promise rejections
  rejectionHandlers: process.env.NODE_ENV === 'production'
    ? [
        new winston.transports.File({
          filename: '/var/www/turnolink/logs/rejections.log',
        }),
      ]
    : undefined,
};
