import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { IncomingMessage } from 'http';
import crypto from 'node:crypto';

import passport from 'passport';
import path from 'path';
import fs from 'fs';
import morgan from 'morgan';
import flash from 'connect-flash';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import logger from '@/services/logger.service';

import { corsMiddleware } from '@/middlewares/cors.middleware';
import { sameOriginGuard } from '@/middlewares/sameOrigin.middleware';
import { securityHeaderMiddleware } from '@/middlewares/securityHeader.middleware';
import { compressionMiddleware } from '@/middlewares/compression.middleware';
import { loggingMiddleware, errorLoggingMiddleware } from '@/middlewares/logging.middleware';
import { resolveTrustProxyHops } from '@/utils/trustProxy.util';

import indexRoutes from '@/client/routers/index.router';
import { normalizeOrigin, parseOriginList } from '@/utils/origin.util';

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
client.set('trust proxy', resolveTrustProxyHops());
client.use(express.urlencoded({ extended: true }));
client.use(express.json());
client.use(cookieParser());

// --------------------------------------------------------
// Sicherheits-Setup (Session, CORS, CSRF)
// --------------------------------------------------------
// Wird erst beim ersten Request bzw. in startClient() aufgebaut, damit die
// Umgebungsvariablen (dotenv) sicher geladen sind. Fehlkonfigurationen in
// Produktion (jedes NODE_ENV außer development/test) führen so in
// startClient() zum Startabbruch.

const MIN_SESSION_SECRET_LENGTH = 32;
const PLACEHOLDER_SECRETS = new Set(['session_secret', 'change_me', 'changeme', 'secret']);

/**
 * Nur ausdrücklich gesetzte Entwicklungs-/Testumgebungen gelten als unsicher
 * erlaubt. Fehlt NODE_ENV oder hat einen anderen Wert, gelten die strengen
 * Regeln wie in Produktion (fail-closed).
 */
function isDevelopmentOrTest(): boolean {
  const env = process.env['NODE_ENV'];
  return env === 'development' || env === 'test';
}

/** Liefert das Session-Secret; in Produktion fail-closed ohne Fallback. */
function resolveSessionSecret(): string {
  const secret = process.env['SESSION_SECRET']?.trim() ?? '';
  const weak =
    secret.length < MIN_SESSION_SECRET_LENGTH || PLACEHOLDER_SECRETS.has(secret.toLowerCase());

  if (secret && !weak) return secret;

  if (!isDevelopmentOrTest()) {
    throw new Error(
      `[CLIENT] SESSION_SECRET fehlt oder ist zu schwach (mindestens ${MIN_SESSION_SECRET_LENGTH} Zeichen, kein Platzhalter). Start abgebrochen.`,
    );
  }

  if (secret) {
    logger.warn('[CLIENT] SESSION_SECRET ist schwach. Außerhalb von development/test würde der Start abgebrochen.');
    return secret;
  }

  logger.warn(
    '[CLIENT] SESSION_SECRET fehlt. Es wird ein zufälliges, flüchtiges Secret verwendet (nur bei NODE_ENV=development oder test).',
  );
  return crypto.randomBytes(48).toString('hex');
}

/**
 * Vertrauenswürdige Origins des Frontends: CLIENT_BASE_URL (sofern vollständige URL)
 * plus CLIENT_TRUSTED_ORIGINS (kommagetrennt). Gilt für CORS mit Credentials
 * und für die Origin-Prüfung des CSRF-Schutzes.
 */
function resolveTrustedOrigins(): string[] {
  const origins = new Set(parseOriginList(process.env['CLIENT_TRUSTED_ORIGINS']));
  const base = normalizeOrigin(process.env['CLIENT_BASE_URL']);
  if (base) origins.add(base);
  return [...origins];
}

type Middleware = (req: Request, res: Response, next: NextFunction) => unknown;

interface ClientSecurityStack {
  session: Middleware;
  cors: Middleware;
  csrf: Middleware;
}

let securityStack: ClientSecurityStack | null = null;

export function initClientSecurity(): ClientSecurityStack {
  if (securityStack) return securityStack;

  const trustedOrigins = resolveTrustedOrigins();

  securityStack = {
    session: session({
      secret: resolveSessionSecret(),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: !isDevelopmentOrTest(),
      },
    }),
    cors: corsMiddleware({ credentials: true, origin: trustedOrigins, verboseLog: false }),
    csrf: sameOriginGuard({ trustedOrigins }),
  };
  return securityStack;
}

client.use((req: Request, res: Response, next: NextFunction) =>
  initClientSecurity().session(req, res, next),
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
client.use((req: Request, res: Response, next: NextFunction) =>
  initClientSecurity().cors(req, res, next),
);
// CSRF-Schutz: zustandsändernde Anfragen nur vom eigenen bzw. erlaubten Origin
client.use((req: Request, res: Response, next: NextFunction) =>
  initClientSecurity().csrf(req, res, next),
);
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
    // 4xx-Meldung nur, wenn der Fehler sie ausdrücklich freigibt (http-errors: expose).
    errormessage:
      statusCode < 500 && err.expose === true && typeof err.message === 'string'
        ? err.message
        : statusCode >= 500
          ? 'Ein interner Fehler ist aufgetreten.'
          : 'Die Anfrage konnte nicht verarbeitet werden.',
    errorstatus: statusCode,
    // Nur bei ausdrücklich gesetztem NODE_ENV=development, nie als Rückfall.
    errorstack: process.env['NODE_ENV'] === 'development' ? err.stack : null,
    currentUser,
  };

  if (wantsJson) {
    // Keine Nutzerdaten in JSON-Fehlerantworten.
    const { currentUser: _currentUser, ...jsonPayload } = payload;
    return res.json({ error: jsonPayload });
  }
  return res.render('index/error', payload);
});

// --------------------------------------------------------
// Start Server
// --------------------------------------------------------
export function startClient(): void {
  // Sicherheitskonfiguration vor dem Listen prüfen (wirft in Produktion bei fehlendem Secret)
  initClientSecurity();

  const protocol = process.env['CLIENT_HTTPS'] ?? 'http';
  const port = Number(process.env['CLIENT_PORT'] ?? 4000);
  const baseURL = process.env['CLIENT_BASE_URL'] ?? 'localhost';

  client.listen(port, () => {
    logger.info(`[CLIENT] Frontend running at ${protocol}://${baseURL}:${port}`);
  });
}
