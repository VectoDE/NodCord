/**
 * ------------------------------------------------------------
 * Same-Origin CSRF Guard
 * ------------------------------------------------------------
 *
 * Schutz vor Cross-Site Request Forgery für das EJS-Frontend (Client),
 * das mit Cookies (Session- und JWT-Cookie) arbeitet.
 *
 * Verfahren (OWASP "Verifying Origin With Standard Headers"):
 * - Sichere Methoden (GET/HEAD/OPTIONS) werden durchgelassen.
 * - Zustandsändernde Methoden (POST/PUT/PATCH/DELETE u. a.) müssen einen
 *   `Origin`-Header (ersatzweise `Referer`) tragen, der dem eigenen Origin
 *   oder einem Eintrag der expliziten Allowlist entspricht.
 * - Fehlen beide Header oder ist der Origin "null", wird mit 403 abgelehnt
 *   (fail-closed). Moderne Browser senden `Origin` bei jeder nicht-GET-Anfrage.
 *
 * Ergänzt wird der Schutz durch `SameSite=Lax` am Session-Cookie.
 */

import type { Request, Response, NextFunction } from 'express';
import logger from '@/services/logger.service';
import { normalizeOrigin, requestSourceOrigin } from '@/utils/origin.util';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export interface SameOriginGuardOptions {
  /** Zusätzlich vertrauenswürdige Origins (z. B. öffentliche URL hinter einem Proxy). */
  trustedOrigins?: readonly string[];
  /** Pfade, die ausgenommen sind (z. B. Webhooks mit eigener Signaturprüfung). */
  exclude?: readonly (string | RegExp)[];
}

function isExcluded(path: string, rules: readonly (string | RegExp)[]): boolean {
  for (const rule of rules) {
    if (typeof rule === 'string' ? rule === path : rule.test(path)) return true;
  }
  return false;
}

/**
 * Express-Middleware: lehnt zustandsändernde Anfragen fremder Herkunft mit 403 ab.
 */
export function sameOriginGuard(options: SameOriginGuardOptions = {}) {
  const trusted = new Set(
    (options.trustedOrigins ?? [])
      .map((o) => normalizeOrigin(o))
      .filter((o): o is string => o !== null),
  );
  const exclude = options.exclude ?? [];

  return function sameOriginCsrfGuard(req: Request, res: Response, next: NextFunction): void {
    if (SAFE_METHODS.has(req.method)) return next();
    if (exclude.length && isExcluded(req.path, exclude)) return next();

    const source = requestSourceOrigin(
      req.get('origin') ?? undefined,
      req.get('referer') ?? undefined,
    );
    const host = req.get('host');
    const self = host ? normalizeOrigin(`${req.protocol}://${host}`) : null;

    if (source && (source === self || trusted.has(source))) return next();

    logger.warn('[CSRF] Cross-Origin-Anfrage abgelehnt', {
      method: req.method,
      path: req.path,
      origin: req.get('origin') ?? null,
      hasReferer: Boolean(req.get('referer')),
    });

    const accept = req.get('accept') ?? '';
    if (req.xhr || accept.includes('application/json')) {
      res.status(403).json({ error: 'CSRF-Prüfung fehlgeschlagen: Herkunft nicht erlaubt.' });
      return;
    }
    res.status(403).type('text/plain').send('CSRF-Prüfung fehlgeschlagen: Herkunft nicht erlaubt.');
  };
}

export default Object.freeze({ sameOriginGuard });
