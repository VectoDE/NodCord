import type { Request } from 'express';

/**
 * Client-IP für Rate-Limits und Logs.
 *
 * Nutzt ausschließlich req.ip. Express wertet X-Forwarded-For dabei nur so weit
 * aus, wie `trust proxy` (TRUST_PROXY_HOPS) es erlaubt. Den Header selbst liest
 * diese Funktion nie: Sein linker Eintrag ist vom Client frei setzbar.
 */
export function resolveClientIp(req: Pick<Request, 'ip' | 'socket'>): string | undefined {
  return req.ip || req.socket?.remoteAddress || undefined;
}
