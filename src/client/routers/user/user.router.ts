import express from 'express';

import indexRouter from '@/client/routers/user/index.user.router';
import viewRouter from '@/client/routers/user/view.user.router';
import editRouter from '@/client/routers/user/edit.user.router';
import updateRouter from '@/client/routers/user/update.user.router';
import settingsRouter from '@/client/routers/user/settings.user.router';
import updateSettingsRouter from '@/client/routers/user/update-settings.user.router';
import verifyRouter from '@/client/routers/user/verify.user.router';
import logoutRouter from '@/client/routers/user/logout.user.router';
import deleteRouter from '@/client/routers/user/delete.user.router';

const router = express.Router();

router.use('/', indexRouter);
router.use('/', viewRouter);
router.use('/', editRouter);
router.use('/', updateRouter);
router.use('/', settingsRouter);
router.use('/', updateSettingsRouter);
router.use('/', verifyRouter);
router.use('/', logoutRouter);
router.use('/', deleteRouter);

export default router;
