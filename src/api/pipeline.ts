import type { IRouter } from 'express';

import { corsMiddleware } from '@/middlewares/cors.middleware';
import { globalApiLimiter } from '@/middlewares/httpRateLimit.middleware';
import { rateLimiterMiddleware } from '@/middlewares/rateLimiter.middleware';

export interface CorsAndRateLimitOptions {
  /** Erlaubte Origins für CORS. */
  corsOrigins: readonly string[];
  /** Namespace des Token-Bucket-Limiters (Standard: global). */
  rateLimiterNamespace?: string;
}

/**
 * CORS vor den Rate-Limits: Auch eine 429-Antwort trägt so für erlaubte
 * Origins `Access-Control-Allow-Origin`, und der Browser zeigt dem Client
 * den echten Status statt eines CORS-Fehlers (#91).
 */
export function applyCorsAndRateLimits(target: IRouter, options: CorsAndRateLimitOptions): void {
  target.use(corsMiddleware({ origin: options.corsOrigins }));
  target.use(globalApiLimiter);
  target.use(
    rateLimiterMiddleware({
      tokensPerSecond: 10,
      burst: 30,
      namespace: options.rateLimiterNamespace ?? 'global',
    }),
  );
}
