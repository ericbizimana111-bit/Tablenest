import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

const logger = new Logger('HTTP');

/**
 * Tags every request with an id (echoed as X-Request-Id) and logs one line per response.
 * Only method, path (without query string), status, duration and user id are logged — never
 * bodies, headers or tokens.
 */
export function requestLogger(req: Request & { id?: string; user?: { _id?: unknown } }, res: Response, next: NextFunction) {
  const incoming = req.headers['x-request-id'];
  req.id = typeof incoming === 'string' && /^[\w-]{8,64}$/.test(incoming) ? incoming : randomUUID();
  res.setHeader('X-Request-Id', req.id);

  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const path = (req.originalUrl || req.url).split('?')[0];
    const uid = req.user?._id ? ` uid=${String(req.user._id)}` : '';
    const line = `${req.method} ${path} ${res.statusCode} ${ms.toFixed(1)}ms${uid} rid=${req.id}`;
    if (res.statusCode >= 500) logger.error(line);
    else if (res.statusCode >= 400) logger.warn(line);
    else logger.log(line);
  });
  next();
}
