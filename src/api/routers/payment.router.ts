import { Router } from 'express';

import { createCrudRouter } from '@/api/shared/crud.factory';
import controller, {
  createOneTimeCheckout,
  createSubscriptionCheckout,
  listStripePrices,
  listStripeProducts,
  stripeWebhook,
} from '@/api/controllers/payment.controller';
import { requireAuth } from '@/middlewares/authentication.middleware';
import { requireAnyRole } from '@/middlewares/role.middleware';
import {
  validationMiddleware,
  v,
  type ValidatorFn,
} from '@/middlewares/validation.middleware';

const router = Router();

const optional =
  <T>(validator: ValidatorFn<T>): ValidatorFn<T | undefined> =>
  (value): value is T | undefined =>
    value === undefined || validator(value);

const stringRecord: ValidatorFn<Record<string, string>> = (value): value is Record<string, string> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value as Record<string, unknown>).every((entry) => typeof entry === 'string');

const checkoutValidator = validationMiddleware({
  body: {
    priceId: v.string(1, 128),
    customerEmail: optional(v.email()),
    metadata: optional(stringRecord),
    successUrl: optional(v.string(1, 2048)),
    cancelUrl: optional(v.string(1, 2048)),
  },
});

router.post('/webhook', stripeWebhook);

router.get('/products', requireAuth(), listStripeProducts);
router.get('/prices', requireAuth(), listStripePrices);

router.post('/checkout/one-time', requireAuth(), checkoutValidator, createOneTimeCheckout);
router.post(
  '/checkout/subscription',
  requireAuth(),
  checkoutValidator,
  createSubscriptionCheckout,
);

const adminRouter = Router();
adminRouter.use(requireAuth(), requireAnyRole(['admin', 'finance']));
adminRouter.use('/', createCrudRouter(controller));

router.use('/', adminRouter);

export default router;
