/**
 * ------------------------------------------------------------
 * Stripe Service – Secure Payment & Subscription Handling
 * ------------------------------------------------------------
 *
 * Integrations:
 * - Stripe Checkout (one-time & recurring)
 * - Webhook verification with concurrency safety
 * - Product & Price listing
 * - Unified logging and async error safety
 *
 * Utilities used:
 * - async.util.ts (safeAsync)
 * - number.util.ts (toCurrency)
 * - response.util.ts (standardResponse)
 * - baseUrl.util.ts (buildBaseUrl)
 * - sync.util.ts (Mutex)
 * - jwt.util.ts (verifyJWT)
 */

import Stripe from 'stripe';
import { Prisma, PaymentMethod, PaymentStatus } from '@prisma/client';
import logger from '@/services/logger.service';
import { safeAsync } from '@/utils/async.util';
import { toCurrency } from '@/utils/number.util';
import { buildBaseUrl } from '@/utils/baseUrl.util';
import { standardResponse } from '@/utils/response.util';
import { Mutex } from '@/utils/sync.util';
import prisma from '@/services/prisma.service';

import type { Request, Response } from 'express';

// ============================================================
// Initialization
// ============================================================

const stripeSecretKey = process.env['STRIPE_SECRET_KEY'];

let stripeClient: Stripe | null = null;

if (stripeSecretKey) {
  stripeClient = new Stripe(stripeSecretKey, {
    apiVersion: '2025-09-30.clover',
    typescript: true,
  });
  logger.info('[STRIPE] Stripe service initialized successfully.');
} else {
  logger.warn('[STRIPE] Stripe service disabled – STRIPE_SECRET_KEY not configured.');
}

export const stripe = stripeClient;
export const isStripeConfigured = stripeClient !== null;

const webhookLock = new Mutex();

// ============================================================
// Utility – Dynamic URLs
// ============================================================

const DEFAULT_SUCCESS_URL = process.env['STRIPE_SUCCESS_URL'] ?? '/success';
const DEFAULT_CANCEL_URL = process.env['STRIPE_CANCEL_URL'] ?? '/cancel';

function resolveStripeUrl(input: string | undefined, fallback: string): string {
  const target = input && input.trim().length > 0 ? input.trim() : fallback;
  if (/^https?:\/\//i.test(target)) {
    return target;
  }

  const base = buildBaseUrl();
  if (target.startsWith('/')) {
    return `${base}${target}`;
  }
  return `${base}/${target}`;
}

const toDecimal = (cents?: number | null): Prisma.Decimal =>
  new Prisma.Decimal(((cents ?? 0) / 100).toFixed(2));

const extractStripeId = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
    const id = (value as Record<string, unknown>)['id'];
    return typeof id === 'string' ? id : null;
  }
  return null;
};

interface CheckoutSessionOptions {
  customerEmail: string;
  priceId: string;
  metadata?: Record<string, string> | undefined;
  successUrl?: string | undefined;
  cancelUrl?: string | undefined;
}

type WebhookInvoice = Stripe.Invoice & {
  payment_intent?: string | Stripe.PaymentIntent | null;
  subscription?: string | Stripe.Subscription | null;
  paid?: boolean;
};

// ============================================================
// Create Checkout Session – One-Time Product
// ============================================================

export const createProductCheckoutSession = safeAsync(
  async ({ customerEmail, priceId, metadata, successUrl, cancelUrl }: CheckoutSessionOptions) => {
    if (!stripeClient) {
      logger.warn('[STRIPE] Checkout session requested but Stripe is not configured');
      return null;
    }

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: resolveStripeUrl(successUrl, DEFAULT_SUCCESS_URL),
      cancel_url: resolveStripeUrl(cancelUrl, DEFAULT_CANCEL_URL),
      automatic_tax: { enabled: true },
      billing_address_collection: 'auto',
    };

    if (metadata && Object.keys(metadata).length > 0) {
      params.metadata = metadata;
    }

    const session = await stripeClient.checkout.sessions.create(params);

    logger.info('[STRIPE] Product checkout session created', {
      email: customerEmail,
      sessionId: session.id,
      priceId,
    });

    return session;
  },
);

// ============================================================
// Create Checkout Session – Subscription
// ============================================================

export const createSubscriptionCheckoutSession = safeAsync(
  async ({ customerEmail, priceId, metadata, successUrl, cancelUrl }: CheckoutSessionOptions) => {
    if (!stripeClient) {
      logger.warn('[STRIPE] Subscription checkout requested but Stripe is not configured');
      return null;
    }

    const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
      trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
    };

    if (metadata && Object.keys(metadata).length > 0) {
      subscriptionData.metadata = metadata;
    }

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      customer_email: customerEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: resolveStripeUrl(successUrl, DEFAULT_SUCCESS_URL),
      cancel_url: resolveStripeUrl(cancelUrl, DEFAULT_CANCEL_URL),
      subscription_data: subscriptionData,
    };

    if (metadata && Object.keys(metadata).length > 0) {
      params.metadata = metadata;
    }

    const session = await stripeClient.checkout.sessions.create(params);

    logger.info('[STRIPE] Subscription session created', {
      email: customerEmail,
      sessionId: session.id,
      priceId,
    });

    return session;
  },
);

// ============================================================
// Product & Price Listing
// ============================================================

export const listActiveProducts = safeAsync(async () => {
  if (!stripeClient) {
    logger.warn('[STRIPE] listActiveProducts called but Stripe is not configured');
    return [];
  }

  const products = await stripeClient.products.list({ active: true });
  logger.debug(`[STRIPE] Retrieved ${products.data.length} active products`);
  return products.data;
});

export const listActivePrices = safeAsync(async () => {
  if (!stripeClient) {
    logger.warn('[STRIPE] listActivePrices called but Stripe is not configured');
    return [];
  }

  const prices = await stripeClient.prices.list({ active: true, expand: ['data.product'] });
  logger.debug(`[STRIPE] Retrieved ${prices.data.length} active prices`);
  return prices.data.map((price) => ({
    id: price.id,
    productName: (price.product as Stripe.Product)?.name ?? 'Unknown',
    amount: toCurrency((price.unit_amount ?? 0) / 100),
    interval: (price.recurring && price.recurring.interval) || 'one_time',
  }));
});

// ============================================================
// Persistence Helpers
// ============================================================

async function upsertPaymentFromSession(session: Stripe.Checkout.Session): Promise<void> {
  const metadata = session.metadata ?? {};
  const userId = metadata['userId'];

  if (!userId) {
    logger.warn('[STRIPE] Skipping payment persistence for session without userId metadata', {
      sessionId: session.id,
    });
    return;
  }

  const tenantId = metadata['tenantId'];
  const transactionId = extractStripeId(session.payment_intent);
  const subscriptionId = extractStripeId(session.subscription);
  const customerId = extractStripeId(session.customer);
  const status =
    session.mode === 'subscription' ? PaymentStatus.PENDING : PaymentStatus.COMPLETED;
  const processedAt = status === PaymentStatus.COMPLETED ? new Date() : undefined;
  const amount = toDecimal(session.amount_total ?? session.amount_subtotal);

  const invoiceId = extractStripeId(session.invoice as unknown);

  const payload: Prisma.JsonValue = {
    stripeSessionId: session.id,
    mode: session.mode,
    customerId,
    subscriptionId,
    invoiceId,
    metadata,
  };

  try {
    await prisma.payment.upsert({
      where: { id: session.id },
      create: {
        id: session.id,
        userId,
        tenantId: typeof tenantId === 'string' ? tenantId : undefined,
        amount,
        method: PaymentMethod.STRIPE,
        status,
        transactionId,
        metadata: payload,
        processedAt,
      },
      update: {
        amount,
        status,
        transactionId,
        metadata: payload,
        processedAt,
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[STRIPE] Failed to persist checkout session', {
      sessionId: session.id,
      error: err.message,
    });
  }
}

async function persistInvoicePayment(
  invoice: WebhookInvoice,
  overrideStatus?: PaymentStatus,
): Promise<void> {
  const metadata = invoice.metadata ?? {};
  const userId = metadata['userId'];

  if (!userId) {
    logger.warn('[STRIPE] Skipping invoice persistence without userId metadata', {
      invoiceId: invoice.id,
    });
    return;
  }

  const tenantId = metadata['tenantId'];
  const status =
    overrideStatus ?? (invoice.status === 'paid' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING);
  const amount = toDecimal(invoice.amount_paid ?? invoice.amount_due);
  const transactionId = extractStripeId(invoice.payment_intent);
  const processedAt = status === PaymentStatus.COMPLETED ? new Date() : undefined;
  const subscriptionId = extractStripeId(invoice.subscription);

  const payload: Prisma.JsonValue = {
    stripeInvoiceId: invoice.id,
    subscriptionId,
    metadata,
    customerEmail: invoice.customer_email ?? null,
  };

  try {
    if (transactionId) {
      const { count } = await prisma.payment.updateMany({
        where: { transactionId },
        data: {
        amount,
        status,
        metadata: payload,
        processedAt,
      },
      });
      if (count > 0) {
        return;
      }
    }

    await prisma.payment.upsert({
      where: { id: invoice.id },
      create: {
        id: invoice.id,
        userId,
        tenantId: typeof tenantId === 'string' ? tenantId : undefined,
        amount,
        method: PaymentMethod.STRIPE,
        status,
        transactionId,
        metadata: payload,
        processedAt,
      },
      update: {
        amount,
        status,
        transactionId,
        metadata: payload,
        processedAt,
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[STRIPE] Failed to persist invoice payment', {
      invoiceId: invoice.id,
      error: err.message,
    });
  }
}

async function cancelSubscription(subscriptionId: string): Promise<void> {
  if (!stripeClient) {
    logger.warn('[STRIPE] cancelSubscription invoked while Stripe is disabled', {
      subscriptionId,
    });
    return;
  }

  try {
    await stripeClient.subscriptions.cancel(subscriptionId, {
      invoice_now: false,
      prorate: false,
    });
    logger.warn('[STRIPE] Subscription cancelled due to payment issue', {
      subscriptionId,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (err.message.includes('No such subscription')) {
      logger.warn('[STRIPE] Subscription already cancelled', { subscriptionId });
    } else {
      logger.error('[STRIPE] Failed to cancel subscription', {
        subscriptionId,
        error: err.message,
      });
    }
  }
}

// ============================================================
// Webhook Handling (Thread-Safe)
// ============================================================

export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
  const sig = req.headers['stripe-signature'];

  if (!stripeClient || !webhookSecret) {
    logger.warn('[STRIPE] Webhook received but Stripe integration is disabled or misconfigured.');
    standardResponse(res, 503, { error: 'Stripe integration disabled' }, 'Stripe disabled');
    return;
  }

  let event: Stripe.Event;

  try {
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    event = stripeClient.webhooks.constructEvent(rawBody, sig as string, webhookSecret);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[STRIPE] Webhook signature verification failed', { error: err.message });
    standardResponse(res, 400, { error: `Webhook Error: ${err.message}` }, 'Webhook Error');
    return;
  }

  try {
    await webhookLock.runExclusive(async () => {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          logger.info('[STRIPE] Checkout session completed', {
            sessionId: session.id,
            customerEmail: session.customer_email,
            mode: session.mode,
          });
          await upsertPaymentFromSession(session);
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as WebhookInvoice;
          logger.info('[STRIPE] Invoice payment succeeded', {
            invoiceId: invoice.id,
            customer: invoice.customer_email,
            amountPaid: toCurrency((invoice.amount_paid ?? 0) / 100),
          });
          await persistInvoicePayment(invoice, PaymentStatus.COMPLETED);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as WebhookInvoice;
          const subscriptionId = extractStripeId(invoice.subscription);
          logger.warn('[STRIPE] Invoice payment failed', {
            invoiceId: invoice.id,
            customer: invoice.customer_email,
            amountDue: toCurrency((invoice.amount_due ?? 0) / 100),
            subscription: subscriptionId,
          });
          await persistInvoicePayment(invoice, PaymentStatus.FAILED);
          if (subscriptionId) {
            await cancelSubscription(subscriptionId);
          }
          break;
        }

        case 'customer.subscription.created': {
          const sub = event.data.object as Stripe.Subscription;
          logger.info('[STRIPE] Subscription created', {
            subscriptionId: sub.id,
            status: sub.status,
          });
          break;
        }

        case 'customer.subscription.updated': {
          const sub = event.data.object as Stripe.Subscription;
          logger.info('[STRIPE] Subscription updated', {
            subscriptionId: sub.id,
            status: sub.status,
          });
          if (sub.status === 'past_due' || sub.status === 'unpaid') {
            await cancelSubscription(sub.id);
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const sub = event.data.object as Stripe.Subscription;
          logger.warn('[STRIPE] Subscription cancelled', {
            subscriptionId: sub.id,
            status: sub.status,
          });
          break;
        }

        default:
          logger.debug(`[STRIPE] Unhandled event type: ${event.type}`);
      }
    });

    standardResponse(res, 200, { received: true });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[STRIPE] Webhook event handler failed', { error: err.message });
    standardResponse(res, 500, { error: 'Webhook handler error' }, 'Webhook handler error');
  }
};

// ============================================================
// Retrieve Customer by Email
// ============================================================

export const getCustomerByEmail = safeAsync(async (email: string) => {
  if (!stripeClient) {
    logger.warn('[STRIPE] getCustomerByEmail called but Stripe is not configured');
    return null;
  }

  const customers = await stripeClient.customers.list({ email, limit: 1 });
  const customer = customers.data[0] ?? null;
  logger.debug(`[STRIPE] Retrieved customer by email`, { email, found: !!customer });
  return customer;
});

// ============================================================
// Default Export
// ============================================================

export default Object.freeze({
  stripe,
  isStripeConfigured,
  createProductCheckoutSession,
  createSubscriptionCheckoutSession,
  listActiveProducts,
  listActivePrices,
  handleStripeWebhook,
  getCustomerByEmail,
});
