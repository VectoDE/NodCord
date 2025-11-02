import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { IncomingMessage } from 'http';

import passport from 'passport';
import path from 'path';
import fs from 'fs';
import morgan from 'morgan';
import flash from 'connect-flash';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import logger from '@/services/logger.service';

import { corsMiddleware } from '@/middlewares/cors.middleware';
import { securityHeaderMiddleware } from '@/middlewares/securityHeader.middleware';
import { compressionMiddleware } from '@/middlewares/compression.middleware';
import { loggingMiddleware, errorLoggingMiddleware } from '@/middlewares/logging.middleware';

import indexRoutes from '@/client/routers/index.router';

function resolveClientPath(...segments: string[]): string {
  const distPath = path.join(process.cwd(), 'dist', 'client', ...segments);
  if (fs.existsSync(distPath)) return distPath;
  return path.join(process.cwd(), 'src', 'client', ...segments);
}

export const client = express();

// --------------------------------------------------------
// Helpers – Header-Normalisierung
// --------------------------------------------------------
function headerFirstString(req: IncomingMessage, name: string): string | undefined {
  const v = req.headers[name];
  if (Array.isArray(v)) return v[0];
  return typeof v === 'string' ? v : undefined;
}

// --------------------------------------------------------
// Grundkonfiguration
// --------------------------------------------------------
client.set('trust proxy', 1);
client.use(express.urlencoded({ extended: true }));
client.use(express.json());
client.use(cookieParser());

// --------------------------------------------------------
// Session-Setup
// --------------------------------------------------------
client.use(
  session({
    secret: process.env['SESSION_SECRET'] ?? 'session_secret',
    resave: true,
    saveUninitialized: false,
    cookie: { secure: process.env['NODE_ENV'] === 'production' },
  }),
);

// --------------------------------------------------------
// Passport + Flash
// --------------------------------------------------------
client.use(passport.initialize());
client.use(passport.session());
client.use(flash());

// --------------------------------------------------------
// Core-Middlewares (CORS, Security, Compression, Logging)
// --------------------------------------------------------
client.use(corsMiddleware({ credentials: true, verboseLog: false }));
client.use(securityHeaderMiddleware({ logInit: true }));
client.use(compressionMiddleware({ brotli: true }));
client.use(loggingMiddleware());

// --------------------------------------------------------
// HTTP Access Logging (Morgan → logger.service)
// --------------------------------------------------------
morgan.token('remote-addr', (req: IncomingMessage) => {
  return headerFirstString(req, 'x-forwarded-for') ?? req.socket?.remoteAddress ?? '';
});

morgan.token('url', (req: IncomingMessage) => {
  const request = req as Request;
  return request.originalUrl ?? req.url ?? '';
});

const logFormat =
  '[CLIENT] :remote-addr - :method :url :status :response-time ms - :res[content-length]';

client.use(
  morgan(logFormat, {
    stream: { write: (msg: string) => logger.info(msg.trim()) },
  }),
);

// --------------------------------------------------------
// Views & Static Files
// --------------------------------------------------------
client.set('view engine', 'ejs');
client.set('views', resolveClientPath('views'));
client.use(express.static(path.join(process.cwd(), 'public')));

// --------------------------------------------------------
// Routes
// --------------------------------------------------------
client.use('/', indexRoutes);

// --------------------------------------------------------
// Local User Context & Error Handling
// --------------------------------------------------------
client.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

// 404 Not Found
client.use((_req, _res, next: NextFunction) => {
  const err = new Error('Not Found') as Error & { status?: number };
  err.status = 404;
  next(err);
});

// Zentrales Error Logging (aus Middleware)
client.use(errorLoggingMiddleware());

// Fehler-Renderer (HTML + JSON)
client.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.status || 500;
  const currentUser = req.user;
  const isAuthenticated = res.locals['isAuthenticated'] ?? false;

  res.status(statusCode);
  logger.error(`[CLIENT] ${statusCode}: ${err.message}`, { stack: err.stack });

  const acceptHeader = req.headers['accept'];
  const acceptsJson = Array.isArray(acceptHeader)
    ? acceptHeader.some((value) => value.includes('application/json'))
    : (acceptHeader?.includes('application/json') ?? false);

  const wantsJson = req.xhr || acceptsJson;

  const payload = {
    isAuthenticated,
    logoImage: '/assets/img/logo.png',
    logo404: '/assets/img/404.png',
    errortitle: statusCode === 401 ? 'Unauthorized' : statusCode === 404 ? 'Not Found' : 'Error',
    errormessage: err.message,
    errorstatus: statusCode,
    errorstack: client.get('env') === 'development' ? err.stack : null,
    currentUser,
  };

  if (wantsJson) return res.json({ error: payload });
  return res.render('index/error', payload);
});

// --------------------------------------------------------
// Start Server
// --------------------------------------------------------
export function startClient(): void {
  const protocol = process.env['CLIENT_HTTPS'] ?? 'http';
  const port = Number(process.env['CLIENT_PORT'] ?? 4000);
  const baseURL = process.env['CLIENT_BASE_URL'] ?? 'localhost';

  client.listen(port, () => {
    logger.info(`[CLIENT] Frontend running at ${protocol}://${baseURL}:${port}`);
  });
}
