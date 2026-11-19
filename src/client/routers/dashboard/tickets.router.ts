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
router.use(roleMiddleware(['admin', 'moderator', 'support']));

router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

// ------------------------------------------------------------
// 🎫 Tickets Übersicht
// ------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, email: true } },
        assignedTo: { select: { id: true, username: true } },
        project: { select: { id: true, title: true } },
      },
    });

    res.render('dashboard/tickets/tickets', {
      tickets,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'tickets',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error fetching tickets', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Tickets',
      errormessage: 'Ein interner Fehler ist aufgetreten. Bitte versuche es später erneut.',
      errorstatus: 500,
      errorstack: null,
    });
  }
});

// ------------------------------------------------------------
// ➕ Neues Ticket erstellen (Formular)
// ------------------------------------------------------------
router.get('/create', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true },
      orderBy: { username: 'asc' },
    });

    const projects = await prisma.project.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    });

    res.render('dashboard/tickets/createTicket', {
      users,
      projects,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'tickets',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error rendering create ticket form', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Öffnen des Ticketformulars',
      errormessage: 'Ein interner Fehler ist aufgetreten. Bitte versuche es später erneut.',
      errorstatus: 500,
      errorstack: null,
    });
  }
});

// ------------------------------------------------------------
// 📨 Ticket beantworten (Answer View)
// ------------------------------------------------------------
router.get('/answer/:id', async (req: Request, res: Response) => {
  try {
    const ticketId = (req.params as Record<string, string>)['id'];
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, username: true, email: true } },
        assignedTo: { select: { id: true, username: true } },
        project: { select: { id: true, title: true } },
      },
    });

    if (!ticket) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Ticket nicht gefunden',
        errormessage: 'Dieses Ticket existiert nicht.',
        errorstatus: 404,
      });
    }

    res.render('dashboard/tickets/answerTicket', {
      ticket,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'tickets',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error rendering ticket answer view', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Öffnen des Tickets',
      errormessage: 'Ein interner Fehler ist aufgetreten. Bitte versuche es später erneut.',
      errorstatus: 500,
      errorstack: null,
    });
  }
});

// ------------------------------------------------------------
// ✏️ Ticket bearbeiten
// ------------------------------------------------------------
router.get('/update/:id', async (req: Request, res: Response) => {
  try {
    const ticketId = (req.params as Record<string, string>)['id'];
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, username: true } },
        assignedTo: { select: { id: true, username: true } },
        project: { select: { id: true, title: true } },
      },
    });

    if (!ticket) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Ticket nicht gefunden',
        errormessage: 'Dieses Ticket existiert nicht.',
        errorstatus: 404,
      });
    }

    const users = await prisma.user.findMany({
      select: { id: true, username: true },
    });

    const projects = await prisma.project.findMany({
      select: { id: true, title: true },
    });

    res.render('dashboard/tickets/editTicket', {
      ticket,
      users,
      projects,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'tickets',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error loading ticket edit view', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden des Tickets',
      errormessage: 'Ein interner Fehler ist aufgetreten. Bitte versuche es später erneut.',
      errorstatus: 500,
      errorstack: null,
    });
  }
});

// ------------------------------------------------------------
// 🗑️ Ticket löschen
// ------------------------------------------------------------
router.get('/delete/:id', async (req: Request, res: Response) => {
  try {
    const ticketId = (req.params as Record<string, string>)['id'];
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!ticket) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Ticket nicht gefunden',
        errormessage: 'Dieses Ticket existiert nicht oder wurde bereits gelöscht.',
        errorstatus: 404,
      });
    }

    await prisma.ticket.delete({ where: { id: ticketId } });
    logger.info(`Ticket "${ticket.title}" wurde gelöscht.`);
    res.redirect('/dashboard/tickets');
  } catch (error: any) {
    logger.error('Error deleting ticket', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Löschen des Tickets',
      errormessage: 'Ein interner Fehler ist aufgetreten. Bitte versuche es später erneut.',
      errorstatus: 500,
      errorstack: null,
    });
  }
});

export default router;
