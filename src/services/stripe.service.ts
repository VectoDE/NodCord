/**
 * ------------------------------------------------------------
 * Stripe Service – Payment & Subscription Handling
 * ------------------------------------------------------------
 *
 * Provides:
 * - Secure Stripe checkout & subscription creation
 * - Webhook verification for events
 * - Product & price retrieval
 * - Logging via centralized logger.service.ts
 *
 * Technologies:
 * - Stripe SDK (latest API version)
 * - TypeScript + NodeNext
 * - Winston for audit-grade observability
 */

import Stripe from 'stripe';
import logger from '@/services/logger.service';
import type { Request, Response } from 'express';

// ============================================================
// Initialize Stripe
// ============================================================

const stripeSecretKey = process.env['STRIPE_SECRET_KEY'];
if (!stripeSecretKey) {
    throw new Error('[STRIPE] Missing STRIPE_SECRET_KEY in environment.');
}

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-09-30.clover',
    typescript: true,
});

logger.info('[STRIPE] Initialized Stripe service successfully.');

// ============================================================
// Checkout for One-Time Digital Product
// ============================================================

/**
 * Creates a checkout session for purchasing a digital product.
 * @param customerEmail Customer email (used to prefill checkout)
 * @param priceId Stripe Price ID (configured in Stripe dashboard)
 */
export async function createProductCheckoutSession(customerEmail: string, priceId: string) {
    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            customer_email: customerEmail,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: process.env['STRIPE_SUCCESS_URL'] ?? 'https://yourapp.com/success',
            cancel_url: process.env['STRIPE_CANCEL_URL'] ?? 'https://yourapp.com/cancel',
            automatic_tax: { enabled: true },
            billing_address_collection: 'auto',
        });

        logger.info('[STRIPE] Created product checkout session', {
            email: customerEmail,
            sessionId: session.id,
            priceId,
        });

        return session;
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('[STRIPE] Failed to create product checkout session', { error: err.message });
        throw err;
    }
}

// ============================================================
// Subscription Creation
// ============================================================

/**
 * Creates a subscription checkout session.
 * @param customerEmail Customer email
 * @param priceId Stripe recurring price ID
 */
export async function createSubscriptionCheckoutSession(customerEmail: string, priceId: string) {
    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer_email: customerEmail,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: process.env['STRIPE_SUCCESS_URL'] ?? 'https://yourapp.com/success',
            cancel_url: process.env['STRIPE_CANCEL_URL'] ?? 'https://yourapp.com/cancel',
            subscription_data: {
                trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
            },
        });

        logger.info('[STRIPE] Created subscription checkout session', {
            email: customerEmail,
            sessionId: session.id,
            priceId,
        });

        return session;
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('[STRIPE] Failed to create subscription session', { error: err.message });
        throw err;
    }
}

// ============================================================
// Retrieve Products and Prices
// ============================================================

export async function listActiveProducts() {
    try {
        const products = await stripe.products.list({ active: true });
        logger.debug(`[STRIPE] Retrieved ${products.data.length} active products`);
        return products.data;
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('[STRIPE] Failed to list products', { error: err.message });
        throw err;
    }
}

export async function listActivePrices() {
    try {
        const prices = await stripe.prices.list({ active: true, expand: ['data.product'] });
        logger.debug(`[STRIPE] Retrieved ${prices.data.length} active prices`);
        return prices.data;
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('[STRIPE] Failed to list prices', { error: err.message });
        throw err;
    }
}

// ============================================================
// Webhook Verification
// ============================================================

/**
 * Verifies and handles incoming Stripe webhook events.
 */
export async function handleStripeWebhook(
    req: Request,
    res: Response
): Promise<Response> {
    const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
    const sig = req.headers['stripe-signature'];

    if (!webhookSecret) {
        logger.error('[STRIPE] Missing STRIPE_WEBHOOK_SECRET in environment.');
        return res.status(500).send('Webhook misconfigured');
    }

    let event: Stripe.Event;

    try {
        const rawBody = (req as any).rawBody || JSON.stringify(req.body);
        event = stripe.webhooks.constructEvent(rawBody, sig as string, webhookSecret);
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('[STRIPE] Webhook signature verification failed', {
            error: err.message,
        });
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                logger.info('[STRIPE] Checkout session completed', {
                    sessionId: session.id,
                    customerEmail: session.customer_email,
                    mode: session.mode,
                });
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                logger.info('[STRIPE] Invoice payment succeeded', {
                    invoiceId: invoice.id,
                    customer: invoice.customer_email,
                    amountPaid: invoice.amount_paid,
                });
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

        return res.json({ received: true });
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('[STRIPE] Error handling webhook event', {
            error: err.message,
        });
        return res.status(500).json({ error: 'Webhook handler error' });
    }
}

// ============================================================
// Utility for Customer Retrieval
// ============================================================

export async function getCustomerByEmail(email: string) {
    try {
        const customers = await stripe.customers.list({ email, limit: 1 });
        const customer = customers.data[0];
        logger.debug(`[STRIPE] Fetched customer by email: ${email}`, { found: !!customer });
        return customer ?? null;
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('[STRIPE] Failed to retrieve customer', { email, error: err.message });
        throw err;
    }
}

// ============================================================
// Default Export
// ============================================================

export default {
    stripe,
    createProductCheckoutSession,
    createSubscriptionCheckoutSession,
    listActiveProducts,
    listActivePrices,
    handleStripeWebhook,
    getCustomerByEmail,
};
