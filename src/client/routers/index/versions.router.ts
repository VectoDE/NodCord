import express from 'express';
import type { Request, Response } from 'express';
import prisma from '@/client/lib/prisma';
import logger from '@/services/logger.service';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const versions = await prisma.version.findMany({
      where: { isArchived: false },
      orderBy: { releasedAt: 'desc' },
      include: {
        versionTag: true,
        featureRecords: true,
        additionRecords: true,
        fixRecords: true,
        bugRecords: true,
        developerRecords: true,
      },
    });
    res.render('index/versions', {
      versions,
      logoImage: '/assets/img/logo.png',
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
    });
  } catch (error: any) {
    logger.error('Error fetching versions', { error });
    res.status(500).render('index/versions', {
      versions: [],
      logoImage: '/assets/img/logo.png',
      errorstack: error.message,
    });
  }
});

export default router;
