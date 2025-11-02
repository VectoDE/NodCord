import express from 'express';
import type { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import logger from '@/services/logger.service';

const router = express.Router();

const CONTACT_HOST = process.env['CONTACT_SMTP_HOST'] ?? '';
const CONTACT_PORT = Number(process.env['CONTACT_SMTP_PORT'] ?? 587);
const CONTACT_SECURE = process.env['CONTACT_SMTP_SECURE'] === 'true';
const CONTACT_USER = process.env['CONTACT_SMTP_USER'] ?? '';
const CONTACT_PASS = process.env['CONTACT_SMTP_PASS'] ?? '';
const CONTACT_EMAIL = process.env['CONTACT_EMAIL'] ?? '';

const contactMailerConfigured = Boolean(CONTACT_HOST && CONTACT_USER && CONTACT_PASS && CONTACT_EMAIL);

const transporter = contactMailerConfigured
  ? nodemailer.createTransport({
      host: CONTACT_HOST,
      port: CONTACT_PORT,
      secure: CONTACT_SECURE,
      auth: {
        user: CONTACT_USER,
        pass: CONTACT_PASS,
      },
    })
  : null;

if (!contactMailerConfigured) {
  logger.warn('[CONTACT] Contact mailer disabled – missing SMTP configuration.');
}

// Send contact form
router.post('/', async (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  if (!transporter || !contactMailerConfigured) {
    logger.warn('[CONTACT] Skipping contact mail send – mailer not configured.');
    res.redirect('/contact?error=true');
    return;
  }

  const mailOptions = {
    from: CONTACT_USER,
    to: CONTACT_EMAIL,
    subject: `Kontaktanfrage von ${name}`,
    text: `Name: ${name}\nE-Mail: ${email}\nNachricht:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.redirect('/contact?success=true');
  } catch (error) {
    logger.error('Error sending contact mail', { error });
    res.redirect('/contact?error=true');
  }
});

// Contact page
router.get('/', (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const successMessage =
    query['success'] === 'true'
      ? 'Vielen Dank für Ihre Nachricht. Wir werden uns bald bei Ihnen melden.'
      : null;
  const errorMessage =
    query['error'] === 'true'
      ? 'Es gab ein Problem beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut.'
      : null;

  res.render('index/contact', {
    successMessage,
    errorMessage,
    logoImage: '/assets/img/logo.png',
    isAuthenticated: res.locals['isAuthenticated'] ?? false,
  });
});

export default router;
