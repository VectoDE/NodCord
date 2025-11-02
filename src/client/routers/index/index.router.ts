import express from 'express';

import rootRouter from '@/client/routers/index/root.router';
import newsRouter from '@/client/routers/index/news.router';
import docsRouter from '@/client/routers/index/docs.router';
import statusRouter from '@/client/routers/index/status.router';
import infoRouter from '@/client/routers/index/info.router';
import versionsRouter from '@/client/routers/index/versions.router';
import discordRouter from '@/client/routers/index/discord.router';
import contactRouter from '@/client/routers/index/contact.router';

const router = express.Router();

router.use('/', rootRouter);
router.use('/news', newsRouter);
router.use('/docs', docsRouter);
router.use('/status', statusRouter);
router.use('/info', infoRouter);
router.use('/versions', versionsRouter);
router.use('/discord', discordRouter);
router.use('/contact', contactRouter);

export default router;
