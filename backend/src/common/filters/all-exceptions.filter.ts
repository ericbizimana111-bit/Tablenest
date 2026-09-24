import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

type ErrorBody = {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  requestId?: string;
  timestamp: string;
};

/**
 * One error shape for every failure: `{ statusCode, error, message, path, requestId, timestamp }`.
 * Internal details (stack traces, driver errors) are logged, never returned.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request & { id?: string }>();

    const { status, message } = this.resolve(exception);
    const body: ErrorBody = {
      statusCode: status,
      error: HttpStatus[status]?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) || 'Error',
      message,
      path: req.originalUrl || req.url,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      const err = exception as Error;
      this.logger.error(`${req.method} ${req.originalUrl} → ${status} [${req.id}] ${err?.message}`, err?.stack);
    }

    if (!res.headersSent) res.status(status).json(body);
  }

  private resolve(exception: unknown): { status: number; message: string | string[] } {
    if (exception instanceof HttpException) {
      const r = exception.getResponse();
      const message =
        typeof r === 'string' ? r : ((r as { message?: string | string[] }).message ?? exception.message);
      return { status: exception.getStatus(), message };
    }

    const e = exception as { code?: number; type?: string; status?: number; name?: string; keyValue?: object };

    // Mongo duplicate key — a uniqueness rule was violated.
    if (e?.code === 11000) return { status: HttpStatus.CONFLICT, message: 'A record with these details already exists' };
    if (exception instanceof MongooseError.CastError) return { status: HttpStatus.BAD_REQUEST, message: 'Invalid identifier' };
    if (exception instanceof MongooseError.ValidationError) {
      return { status: HttpStatus.BAD_REQUEST, message: Object.values(exception.errors).map((x) => x.message) };
    }

    // body-parser errors surface as plain errors with a `type`.
    if (e?.type === 'entity.parse.failed') return { status: HttpStatus.BAD_REQUEST, message: 'Request body is not valid JSON' };
    if (e?.type === 'entity.too.large') return { status: HttpStatus.PAYLOAD_TOO_LARGE, message: 'Request body is too large' };
    if (typeof e?.status === 'number' && e.status >= 400 && e.status < 500) {
      return { status: e.status, message: 'Bad request' };
    }

    return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Something went wrong. Please try again.' };
  }
}
