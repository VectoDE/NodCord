import express from 'express';
import type { Request, Response } from 'express';
import logger from '@/services/logger.service';
import monitorService from '@/services/monitor.service';

const router = express.Router();

// Discord Bots
router.get('/bots', async (_req: Request, res: Response) => {
  try {
    const { botData } = await monitorService.getBots();
    res.render('discord/discordbots', {
      botData,
      botCount: botData.length,
      logoImage: '/assets/img/logo.png',
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
    });
  } catch (error) {
    logger.error('Error fetching bots', { error });
    res.status(500).send('Internal Server Error');
  }
});

// Discord Members
router.get('/members', async (_req: Request, res: Response) => {
  try {
    const { memberData } = await monitorService.getMembers();
    res.render('discord/discordmembers', {
      memberData,
      memberCount: memberData.length,
      logoImage: '/assets/img/logo.png',
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
    });
  } catch (error) {
    logger.error('Error fetching members', { error });
    res.status(500).send('Internal Server Error');
  }
});

// Discord Servers
router.get('/servers', async (_req: Request, res: Response) => {
  try {
    const { serverData } = await monitorService.getServers();
    res.render('discord/discordservers', {
      serverData,
      serverCount: serverData.length,
      logoImage: '/assets/img/logo.png',
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
    });
  } catch (error) {
    logger.error('Error fetching servers', { error });
    res.status(500).send('Internal Server Error');
  }
});

export default router;
