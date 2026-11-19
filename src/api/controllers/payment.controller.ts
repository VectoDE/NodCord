import type { Request, Response } from 'express';

import { getController } from '@/api/controllers/registry';
import { safeAsync } from '@/utils/async.util';
import { standardResponse } from '@/utils/response.util';
import {
  createProductCheckoutSession,
  createSubscriptionCheckoutSession,
  listActivePrices,
  listActiveProducts,
  handleStripeWebhook,
} from '@/services/stripe.service';
import type { AuthUser } from '@/middlewares/authentication.middleware';
import { buildMetadata, normalizeMetadata } from '@/utils/paymentMetadata.util';

export const paymentController = getController('payment');

export const listStripeProducts = safeAsync(
  async (_req: Request, res: Response) => {
    const products = await listActiveProducts();
    return standardResponse(res, 200, products, 'Active products fetched');
  },
  { label: 'payments#products' },
);

export const listStripePrices = safeAsync(
  async (_req: Request, res: Response) => {
    const prices = await listActivePrices();
    return standardResponse(res, 200, prices, 'Active prices fetched');
  },
  { label: 'payments#prices' },
);

export const createOneTimeCheckout = safeAsync(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser | undefined;
    const { priceId, customerEmail, metadata, successUrl, cancelUrl } = req.body as Record<
      string,
      unknown
    >;

    if (typeof priceId !== 'string' || priceId.length === 0) {
      return standardResponse(
        res,
        400,
        { error: 'Missing priceId' },
        'priceId is required',
      );
    }

    const email = (customerEmail as string | undefined) ?? user?.email;
    if (!email) {
      return standardResponse(
        res,
        400,
        { error: 'Missing customer email' },
        'Customer email required',
      );
    }

    const checkoutOptions = {
      priceId,
      customerEmail: email,
      metadata: buildMetadata(user, normalizeMetadata(metadata), 'one_time'),
      ...(typeof successUrl === 'string' ? { successUrl } : {}),
      ...(typeof cancelUrl === 'string' ? { cancelUrl } : {}),
    };

    const session = await createProductCheckoutSession(checkoutOptions);
    if (!session) {
      return standardResponse(
        res,
        502,
        { error: 'Unable to create checkout session' },
        'Checkout session failed',
      );
    }

    return standardResponse(
      res,
      201,
      {
        sessionId: session.id,
        url: session.url,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        mode: session.mode,
      },
      'One-time checkout session created',
    );
  },
  { label: 'payments#checkout:one_time' },
);

export const createSubscriptionCheckout = safeAsync(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser | undefined;
    const { priceId, customerEmail, metadata, successUrl, cancelUrl } = req.body as Record<
      string,
      unknown
    >;

    if (typeof priceId !== 'string' || priceId.length === 0) {
      return standardResponse(
        res,
        400,
        { error: 'Missing priceId' },
        'priceId is required',
      );
    }

    const email = (customerEmail as string | undefined) ?? user?.email;
    if (!email) {
      return standardResponse(
        res,
        400,
        { error: 'Missing customer email' },
        'Customer email required',
      );
    }

    const checkoutOptions = {
      priceId,
      customerEmail: email,
      metadata: buildMetadata(user, normalizeMetadata(metadata), 'subscription'),
      ...(typeof successUrl === 'string' ? { successUrl } : {}),
      ...(typeof cancelUrl === 'string' ? { cancelUrl } : {}),
    };

    const session = await createSubscriptionCheckoutSession(checkoutOptions);
    if (!session) {
      return standardResponse(
        res,
        502,
        { error: 'Unable to create subscription session' },
        'Subscription checkout failed',
      );
    }

    return standardResponse(
      res,
      201,
      {
        sessionId: session.id,
        url: session.url,
        subscription: session.subscription,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        mode: session.mode,
      },
      'Subscription checkout session created',
    );
  },
  { label: 'payments#checkout:subscription' },
);

export const stripeWebhook = safeAsync(handleStripeWebhook, {
  label: 'payments#webhook',
  rethrow: false,
});

export default paymentController;
