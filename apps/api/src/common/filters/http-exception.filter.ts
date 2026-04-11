import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Optional,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { SentryService } from '../sentry/sentry.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(@Optional() private readonly sentryService?: SentryService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let code = 'INTERNAL_ERROR';
    let details: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || message;
        code = (responseObj.error as string) || code;

        // Handle class-validator errors
        if (Array.isArray(responseObj.message)) {
          details = { validation: responseObj.message as string[] };
          message = 'Error de validación';
        }
      }
    } else if (
      exception instanceof Prisma.PrismaClientKnownRequestError
    ) {
      // Map common Prisma error codes to HTTP responses
      switch (exception.code) {
        case 'P2002': // Unique constraint violation
          status = HttpStatus.CONFLICT;
          message = 'El registro ya existe';
          code = 'DUPLICATE_ENTRY';
          break;
        case 'P2025': // Record not found
          status = HttpStatus.NOT_FOUND;
          message = 'Registro no encontrado';
          code = 'NOT_FOUND';
          break;
        case 'P2003': // Foreign key constraint
          status = HttpStatus.BAD_REQUEST;
          message = 'Referencia inválida';
          code = 'INVALID_REFERENCE';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Error de base de datos';
          code = 'DATABASE_ERROR';
      }
    } else if (
      exception instanceof Prisma.PrismaClientValidationError
    ) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Datos inválidos';
      code = 'VALIDATION_ERROR';
    }

    // Log 5xx errors always with stack, 4xx always at warn level
    if (status >= 500) {
      this.logger.error(
        `${status} ${code}: ${exception instanceof Error ? exception.message : String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );

      // Report 5xx errors to Sentry
      if (exception instanceof Error) {
        this.sentryService?.captureException(exception);
      }
    } else {
      const detailStr = details ? ` | ${JSON.stringify(details)}` : '';
      this.logger.warn(`${status} ${code}: ${message}${detailStr}`);
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
    });
  }
}
