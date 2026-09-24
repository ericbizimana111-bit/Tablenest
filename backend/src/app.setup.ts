import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as express from 'express';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { requestLogger } from './common/middleware/request-logger.middleware';
import { SAFE_KEY } from './modules/uploads/storage/storage.driver';
import { uploadDir } from './modules/uploads/uploads.module';

export type SetupOptions = { rateLimit?: boolean; swagger?: boolean };

/**
 * Everything that turns the Nest app into the HTTP API: security headers, CORS, rate limits,
 * body limits, validation, error format, static uploads and docs. Shared by main.ts and the e2e
 * tests so the tests exercise the exact production pipeline.
 */
export function configureApp(app: NestExpressApplication, opts: SetupOptions = {}) {
  const config = app.get(ConfigService);
  const isProd = config.get('NODE_ENV') === 'production';

  app.set('trust proxy', Number(config.get('TRUST_PROXY') ?? 1));
  app.disable('x-powered-by');
  app.use(requestLogger);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  // Body-parser failures happen before Nest routing; answer them in the standard error shape.
  app.use((err: { type?: string }, req: express.Request & { id?: string }, res: express.Response, next: express.NextFunction) => {
    const known: Record<string, [number, string]> = {
      'entity.parse.failed': [400, 'Request body is not valid JSON'],
      'entity.too.large': [413, 'Request body is too large'],
    };
    const hit = err?.type ? known[err.type] : undefined;
    if (!hit) return next(err);
    res.status(hit[0]).json({
      statusCode: hit[0],
      error: hit[0] === 400 ? 'Bad Request' : 'Payload Too Large',
      message: hit[1],
      path: req.originalUrl,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    });
  });

  if (opts.rateLimit !== false) {
    const limiter = (windowMin: number, max: number, message: string) =>
      rateLimit({
        windowMs: windowMin * 60 * 1000,
        limit: max,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { statusCode: 429, error: 'Too Many Requests', message },
      });
    app.use('/api/auth/login', limiter(15, 20, 'Too many sign-in attempts. Please wait a few minutes.'));
    app.use(['/api/auth/register', '/api/auth/register-owner'], limiter(60, 10, 'Too many accounts created from this network. Try again later.'));
    app.use(['/api/auth/forgot-password', '/api/auth/reset-password'], limiter(15, 10, 'Too many requests. Please wait a few minutes.'));
    app.use('/api/uploads', limiter(15, 60, 'Too many uploads. Please wait a few minutes.'));
    app.use('/api', limiter(15, Number(config.get('RATE_LIMIT_PER_15_MIN') || 1500), 'Too many requests. Please slow down.'));
  }

  const origins = (config.get<string>('CORS_ORIGINS') || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  });

  // Uploaded images: only server-generated names are served, never sniffed or executed.
  if (config.get('UPLOAD_DRIVER', 'local') === 'local') {
    app.use(
      '/uploads',
      (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (!SAFE_KEY.test(req.path.replace(/^\//, ''))) return res.status(404).end();
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; sandbox");
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        next();
      },
      express.static(uploadDir(config), { index: false, dotfiles: 'deny', maxAge: '7d', fallthrough: false }),
    );
  }

  app.useGlobalPipes(
    new ValidationPipe({
      // Unknown fields are stripped (never persisted), so clients may send whole objects safely.
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      stopAtFirstError: false,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  if (opts.swagger ?? (!isProd || config.get('SWAGGER_ENABLED') === 'true')) {
    const doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('TableNest API')
        .setDescription('Restaurant discovery, table booking and food ordering. See docs/API.md for workflows and roles.')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('api/docs', app, doc);
  }
  return app;
}
