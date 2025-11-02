import express from 'express';

import imprintRouter from '@/client/routers/legal/imprint.router';
import privacyPolicyRouter from '@/client/routers/legal/privacy-policy.router';
import termsOfServiceRouter from '@/client/routers/legal/terms-of-service.router';
import eulaRouter from '@/client/routers/legal/eula.router';
import cookiePolicyRouter from '@/client/routers/legal/cookie-policy.router';

const router = express.Router();

// Mount subroutes
router.use('/imprint', imprintRouter);
router.use('/privacy-policy', privacyPolicyRouter);
router.use('/terms-of-service', termsOfServiceRouter);
router.use('/eula', eulaRouter);
router.use('/cookie-policy', cookiePolicyRouter);

// Optional: Root-Redirect → /legal/imprint
router.get('/', (_req, res) => res.redirect('/legal/imprint'));

export default router;
