/**
 * ------------------------------------------------------------
 * Mailer Service – Email Delivery System
 * ------------------------------------------------------------
 *
 * Features:
 * - Centralized, async-safe, and cached HTML email sending
 * - Template variable validation and substitution
 * - Robust error handling with unified async.util
 * - Mutex-protected template reads (no race conditions)
 * - Winston structured logging
 * - Util integration: async, sync, number, baseUrl, response
 *
 * Tech:
 * - TypeScript 5.x (strict, verbatimModuleSyntax)
 * - Node.js 20+
 * - Nodemailer 6+
 */

import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs/promises';
import logger from '@/services/logger.service';

// Type-only imports
import type { Transporter } from 'nodemailer';
import type { Request, Response } from 'express';

// Utilities
import { tryAsync } from '@/utils/async.util';
import { Mutex } from '@/utils/sync.util';
import { getBaseUrl } from '@/utils/baseUrl.util';
import responseUtil from '@/utils/response.util';

// ============================================================
// Configuration
// ============================================================

const RAW_SMTP_HOST = process.env['SMTP_HOST'] ?? '';
const SMTP_PORT = Number(process.env['SMTP_PORT'] ?? 587);
const SMTP_SECURE = process.env['SMTP_SECURE'] === 'true';
const SMTP_USER = process.env['SMTP_USER'] ?? '';
const SMTP_PASS = process.env['SMTP_PASS'] ?? '';

export const isMailerConfigured = Boolean(RAW_SMTP_HOST && SMTP_USER && SMTP_PASS);

if (!isMailerConfigured) {
  logger.warn('[MAILER] SMTP credentials not configured – mailer disabled.');
}

const TEMPLATE_DIR = path.join(process.cwd(), 'src', 'assets', 'templates', 'emails');

// ============================================================
// Transporter
// ============================================================

const transporter: Transporter | null = isMailerConfigured
  ? nodemailer.createTransport({
      host: RAW_SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

// ============================================================
// Template Cache + Mutex
// ============================================================

const templateCache = new Map<string, string>();
const templateLock = new Mutex();

// ============================================================
// Template Loader
// ============================================================

async function loadTemplate(templateName: string): Promise<string> {
  if (templateCache.has(templateName)) return templateCache.get(templateName)!;

  return await templateLock.runExclusive(async () => {
    if (templateCache.has(templateName)) return templateCache.get(templateName)!;

    const filePath = path.join(TEMPLATE_DIR, `${templateName}.html`);
    const result = await tryAsync(() => fs.readFile(filePath, 'utf8'));

    if (!result.ok) {
      logger.error('[MAILER] Template load failed', { templateName, error: result.error.message });
      throw new Error(`Template "${templateName}" not found`);
    }

    const content = result.value;
    templateCache.set(templateName, content);
    logger.debug(`[MAILER] Cached template: ${templateName}`);
    return content;
  });
}

// ============================================================
// Variable Injection
// ============================================================

function applyVariables(template: string, vars: Record<string, string>): string {
  let html = template;
  for (const [key, val] of Object.entries(vars)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    html = html.replace(regex, val);
  }
  return html;
}

// ============================================================
// Email Sender
// ============================================================

export async function sendMail(
  fromName: string,
  to: string,
  subject: string,
  text: string,
  html: string,
): Promise<void> {
  if (!isMailerConfigured || !transporter) {
    logger.warn('[MAILER] sendMail skipped because mailer is disabled', { to, subject });
    return;
  }

  const mailOptions = {
    from: `"${fromName}" <${SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  };

  const result = await tryAsync(() => transporter.sendMail(mailOptions));
  if (!result.ok) {
    logger.error('[MAILER] Failed to send email', { to, subject, error: result.error.message });
    throw result.error;
  }

  logger.info('[MAILER] Email sent successfully', { to, subject });
}

// ============================================================
// High-Level Template Email Builder
// ============================================================

async function sendTemplateMail(
  fromName: string,
  to: string,
  subject: string,
  templateName: string,
  variables: Record<string, string>,
  text: string,
): Promise<void> {
  if (!isMailerConfigured) {
    logger.warn('[MAILER] sendTemplateMail skipped because mailer is disabled', {
      to,
      templateName,
    });
    return;
  }

  const baseTemplate = await loadTemplate(templateName);
  const html = applyVariables(baseTemplate, {
    ...variables,
    year: new Date().getFullYear().toString(),
  });
  await sendMail(fromName, to, subject, text, html);
}

// ============================================================
// Predefined Email Types
// ============================================================

export async function sendRegistrationVerificationEmail(
  to: string,
  username: string,
  token: string,
): Promise<void> {
  const subject = 'Verify Your Email Address';
  const verificationLink = `${getBaseUrl()}/verify-email/${token}`;
  const text = `Hello ${username}, please verify your email: ${verificationLink}`;

  await sendTemplateMail(
    'Verification | NodCord',
    to,
    subject,
    'registration-verification',
    { username, link: verificationLink },
    text,
  );
}

export async function sendVerificationSuccessEmail(to: string, username: string): Promise<void> {
  const subject = 'Email Verification Successful';
  const text = `Hello ${username}, your email has been successfully verified.`;

  await sendTemplateMail(
    'Verification | NodCord',
    to,
    subject,
    'verification-success',
    { username },
    text,
  );
}

export async function sendOAuth2CodeVerificationEmail(
  to: string,
  username: string,
  code: string,
): Promise<void> {
  const subject = 'OAuth2 Code Verification';
  const text = `Hello ${username}, your verification code is: ${code}`;

  await sendTemplateMail(
    'Verification | NodCord',
    to,
    subject,
    'oauth2-verification',
    { username, code },
    text,
  );
}

export async function sendOrderConfirmationEmail(to: string, orderDetails: string): Promise<void> {
  const subject = 'Order Confirmation';
  const text = `Thank you for your order!\n\n${orderDetails}`;

  await sendTemplateMail(
    'Orders | NodCord',
    to,
    subject,
    'order-confirmation',
    { orderDetails },
    text,
  );
}

export async function sendShippingNotificationEmail(
  to: string,
  trackingNumber: string,
): Promise<void> {
  const subject = 'Your Order Has Shipped';
  const text = `Your order has shipped! Tracking number: ${trackingNumber}`;

  await sendTemplateMail(
    'Shipping | NodCord',
    to,
    subject,
    'shipping-notification',
    { trackingNumber },
    text,
  );
}

export async function sendTicketCreatedEmail(to: string, ticketDetails: string): Promise<void> {
  const subject = 'New Ticket Created';
  const text = `A new support ticket has been created.\n\n${ticketDetails}`;

  await sendTemplateMail(
    'Support | NodCord',
    to,
    subject,
    'ticket-created',
    { ticketDetails },
    text,
  );
}

export async function sendUpdateNotificationEmail(
  to: string,
  updateTitle: string,
  updateDescription: string,
  updateLink: string,
): Promise<void> {
  const subject = 'New Update Available';
  const text = `${updateTitle}\n\n${updateDescription}\n\n${updateLink}`;

  await sendTemplateMail(
    'Updates | NodCord',
    to,
    subject,
    'update-notification',
    { updateTitle, updateDescription, updateLink },
    text,
  );
}

// ============================================================
// API-Friendly Wrapper
// ============================================================

export async function handleSendMailAPI(req: Request, res: Response): Promise<void> {
  const { to, subject, text, template, variables } = req.body;

  if (!to || !subject || !template) {
    responseUtil.standardResponse(
      res,
      400,
      { error: 'Missing required fields (to, subject, template)' },
      'Missing required fields',
    );
  }

  const result = await tryAsync(() =>
    sendTemplateMail('Mailer | NodCord', to, subject, template, variables ?? {}, text ?? ''),
  );

  if (!result.ok) {
    logger.error('[MAILER] API Send Failed', { error: result.error.message });
    responseUtil.standardResponse(
      res,
      500,
      { error: result.error.message },
      result.error.message ?? 'Failed to send email.',
    );
  }

  responseUtil.standardResponse(res, 200, { to, subject, template }, 'Email sent successfully.');
}

// ============================================================
// Default Export (Immutable)
// ============================================================

export default Object.freeze({
  isMailerConfigured,
  sendMail,
  sendTemplateMail,
  sendRegistrationVerificationEmail,
  sendVerificationSuccessEmail,
  sendOAuth2CodeVerificationEmail,
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendTicketCreatedEmail,
  sendUpdateNotificationEmail,
  handleSendMailAPI,
});
