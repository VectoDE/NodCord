import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import prisma from '@/client/lib/prisma';

import authMiddleware from '@/middlewares/authentication.middleware';
import roleMiddleware from '@/middlewares/role.middleware';
import logger from '@/services/logger.service';

const router = express.Router();

// ------------------------------------------------------------
// Middleware Setup
// ------------------------------------------------------------
router.use(authMiddleware(true));
router.use(roleMiddleware(['admin', 'moderator', 'developer', 'event_manager']));

router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

// ------------------------------------------------------------
// 🏆 Turnierübersicht
// ------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        game: { select: { id: true, title: true } },
        teams: { select: { id: true, name: true } },
        matches: true,
      },
    });

    res.render('dashboard/tournaments/tournaments', {
      tournaments,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'tournaments',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error fetching tournaments', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Turniere',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ➕ Neues Turnier erstellen (Formular)
// ------------------------------------------------------------
router.get('/create', async (_req: Request, res: Response) => {
  try {
    const games = await prisma.game.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    });

    res.render('dashboard/tournaments/createTournament', {
      games,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'tournaments',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error rendering create tournament form', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Öffnen des Turnierformulars',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ✏️ Turnier bearbeiten
// ------------------------------------------------------------
router.get('/update/:id', async (req: Request, res: Response) => {
  try {
    const tournamentId = (req.params as Record<string, string>)['id'];
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        game: true,
        teams: true,
        matches: true,
      },
    });

    if (!tournament) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Turnier nicht gefunden',
        errormessage: 'Dieses Turnier existiert nicht.',
        errorstatus: 404,
      });
    }

    const games = await prisma.game.findMany({
      select: { id: true, title: true },
    });

    res.render('dashboard/tournaments/editTournament', {
      tournament,
      games,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'tournaments',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error loading tournament edit view', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden des Turniers',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🗑️ Turnier löschen
// ------------------------------------------------------------
router.get('/delete/:id', async (req: Request, res: Response) => {
  try {
    const tournamentId = (req.params as Record<string, string>)['id'];
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });

    if (!tournament) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Turnier nicht gefunden',
        errormessage: 'Dieses Turnier existiert nicht oder wurde bereits gelöscht.',
        errorstatus: 404,
      });
    }

    await prisma.tournament.delete({ where: { id: tournamentId } });
    logger.info(`Turnier "${tournament.title}" wurde gelöscht.`);
    res.redirect('/dashboard/tournaments');
  } catch (error: any) {
    logger.error('Error deleting tournament', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Löschen des Turniers',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🕹️ Turnier-Games
// ------------------------------------------------------------
router.get('/games', async (_req: Request, res: Response) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: { game: true },
    });

    res.render('dashboard/tournaments/games/tournamentGames', {
      tournaments,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'tournaments/games',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error fetching tournament games', { error });
    res.status(500).send('Internal Server Error');
  }
});

// ------------------------------------------------------------
// ⚔️ Turnier-Matches
// ------------------------------------------------------------
router.get('/matches', async (_req: Request, res: Response) => {
  try {
    const matches = await prisma.tournamentMatch.findMany({
      include: {
        tournament: { select: { id: true, title: true } },
        teamA: { select: { id: true, name: true } },
        teamB: { select: { id: true, name: true } },
      },
    });

    res.render('dashboard/tournaments/matches/tournamentMatches', {
      matches,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'tournaments/matches',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error fetching tournament matches', { error });
    res.status(500).send('Internal Server Error');
  }
});

// ------------------------------------------------------------
// 👥 Turnier-Teams
// ------------------------------------------------------------
router.get('/teams', async (_req: Request, res: Response) => {
  try {
    const tournamentTeams = await prisma.tournamentTeam.findMany({
      include: {
        tournament: { select: { id: true, title: true } },
        members: { select: { id: true, username: true } },
      },
    });

    res.render('dashboard/tournaments/teams/tournamentTeams', {
      tournamentTeams,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'tournaments/teams',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error fetching tournament teams', { error });
    res.status(500).send('Internal Server Error');
  }
});

// ------------------------------------------------------------
// 🧍‍♂️ Turnier-Spieler
// ------------------------------------------------------------
router.get('/players', async (_req: Request, res: Response) => {
  try {
    const players = await prisma.user.findMany({
      where: { role: { in: ['player', 'competitor'] } },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    res.render('dashboard/tournaments/players/tournamentPlayers', {
      players,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'tournaments/players',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error fetching tournament players', { error });
    res.status(500).send('Internal Server Error');
  }
});

export default router;
