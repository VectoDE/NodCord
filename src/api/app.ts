import cookieParser from 'cookie-parser';
import express, { type RequestHandler } from 'express';
import helmet from 'helmet';
import http from 'node:http';
import passport from 'passport';

import { compressionMiddleware } from '@/middlewares/compression.middleware';
import { corsMiddleware } from '@/middlewares/cors.middleware';
import { csrfIssueToken, csrfVerify, sendCsrfToken } from '@/middlewares/csrf.middleware';
import { loggingMiddleware } from '@/middlewares/logging.middleware';
import { rateLimiterMiddleware } from '@/middlewares/rateLimiter.middleware';
import { securityHeaderMiddleware } from '@/middlewares/securityHeader.middleware';
import { requireAuth } from '@/middlewares/authentication.middleware';
import { requireAnyRole } from '@/middlewares/role.middleware';
import { requireDeveloperProgram } from '@/middlewares/developerProgram.middleware';
import { requireApiKey } from '@/middlewares/apiKeyMiddleware';
import { startMonitor } from '@/services/monitor.service';
import logger from '@/services/logger.service';
import { initSocketIOServer } from '@/services/socketio.service';
import { safeAsync } from '@/utils/async.util';
import { Once } from '@/utils/sync.util';
import { standardResponse } from '@/utils/response.util';
import crudRoutes from '@/api/routers/index';

import '@/configs/passport.config';

type RawBodyRequest = express.Request & { rawBody?: Buffer };

const app = express();
const initOnce = new Once<void>();

const isProd = process.env['NODE_ENV'] === 'production';

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  express.json({
    limit: '1mb',
    verify: (req, _res, buf) => {
      if (buf && buf.length > 0) {
        (req as RawBodyRequest).rawBody = Buffer.from(buf);
      }
    },
  }),
);
app.use(
  express.urlencoded({
    extended: true,
    verify: (req, _res, buf) => {
      if (buf && buf.length > 0) {
        (req as RawBodyRequest).rawBody = Buffer.from(buf);
      }
    },
  }),
);
app.use(cookieParser());

if (isProd) {
  app.use(helmet());
} else {
  app.use(helmet({ crossOriginEmbedderPolicy: false }));
}

app.use(loggingMiddleware());
app.use(rateLimiterMiddleware({ tokensPerSecond: 10, burst: 30 }));
app.use(corsMiddleware({ origin: ['https://nodcord.hauknetz.de', 'http://localhost:3000'] }));
app.use(securityHeaderMiddleware());
app.use(compressionMiddleware({ minSize: 1024 }));
app.use(csrfIssueToken());
app.use(
  csrfVerify({
    exclude: [/^\/api\/v1\/payments\/webhook$/],
  }),
);
app.use(passport.initialize());

app.get('/api/v1/csrf-token', sendCsrfToken());

const crudRoutePolicies: Record<string, () => RequestHandler[]> = {
  '/api/v1/api-keys': () => [requireAnyRole(['admin'])],
  '/api/v1/developer-programs': () => [requireDeveloperProgram({ keyCanBypassJwt: false })],
  '/api/v1/logs': () => [requireAnyRole(['admin']), requireApiKey()],
  '/api/v1/roles': () => [requireAnyRole(['admin'])],
  '/api/v1/orders': () => [requireAnyRole(['admin', 'manager'])],
};

crudRoutes.forEach(({ path, router }) => {
  if (path === '/api/v1/payments') {
    app.use(path, router);
    return;
  }

  const guards = crudRoutePolicies[path]?.() ?? [];
  app.use(path, requireAuth(), ...guards, router);
});

app.use((_req, res) => standardResponse(res, 404, { error: 'Not Found' }, 'Not Found'));

app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('[GLOBAL ERROR]', { error: msg });
    return standardResponse(res, 500, { error: msg }, 'Internal Server Error');
  },
);

export const createServer = safeAsync(async () => {
  const PORT = Number(process.env['PORT'] ?? 8080);
  const ENV = process.env['NODE_ENV'] ?? 'development';

  const server = http.createServer(app);

  await initOnce.run(async () => {
    logger.info('[APP] Starting API Server...', { port: PORT, env: ENV });
    await startMonitor(app, { routePrefix: '/system', protectMetrics: true });
  });

  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  logger.info(`[APP] Listening on port ${PORT} [${ENV}]`);

  await initSocketIOServer(server);

  const shutdown = async (signal: string) => {
    logger.warn(`[APP] Received ${signal}, shutting down gracefully...`);
    await new Promise<void>((resolve) => server.close(() => resolve()));
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
});

export default app;
