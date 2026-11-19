/**
 * ------------------------------------------------------------
 * HTTP Rate Limits (express-rate-limit)
 * ------------------------------------------------------------
 *
 * Ergaenzt den internen Token-Bucket-Limiter (rateLimiter.middleware.ts)
 * um feste Fenster-Limits, die zusaetzlich auf App- und Router-Ebene
 * greifen. Die Schluessel kommen aus req.ip; `trust proxy` kommt aus
 * TRUST_PROXY_HOPS (src/utils/trustProxy.util.ts), damit hinter dem
 * Reverse Proxy die Client-IP und nicht die Proxy-IP gezaehlt wird.
 */

import { rateLimit } from 'express-rate-limit';
import type { Request } from 'express';

const STRIPE_WEBHOOK_PATH = /^\/api\/v1\/payments\/webhook\/?$/;

/** Stripe-Webhooks kommen von Stripe-IPs in Wellen und werden per Signatur geprueft. */
const isStripeWebhook = (req: Request): boolean =>
  STRIPE_WEBHOOK_PATH.test(req.originalUrl.split('?')[0] ?? '');

const common = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too Many Requests' },
} as const;

/** Globales Limit: 300 Anfragen pro Minute und IP. */
export const globalApiLimiter = rateLimit({
  ...common,
  windowMs: 60_000,
  limit: 300,
  skip: isStripeWebhook,
});

/** Router-Limit (zusaetzlich zum globalen, eigener Zaehler): 120 Anfragen pro Minute und IP. */
export const routerLimiter = rateLimit({
  ...common,
  windowMs: 60_000,
  limit: 120,
  skip: isStripeWebhook,
});

/** Auth-Routen (Login, OAuth, Session): 30 Anfragen pro 15 Minuten und IP. */
export const authLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60_000,
  limit: 30,
});

/** Zahlungsrouten (Checkout, Listen): 30 Anfragen pro Minute und IP; Webhook ausgenommen. */
export const paymentLimiter = rateLimit({
  ...common,
  windowMs: 60_000,
  limit: 30,
  skip: isStripeWebhook,
});

/** Monitoring-Endpunkte (Metrics etc.): 60 Anfragen pro Minute und IP. */
export const monitorLimiter = rateLimit({
  ...common,
  windowMs: 60_000,
  limit: 60,
});
