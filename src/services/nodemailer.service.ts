/**
 * ------------------------------------------------------------
 * Mailer Service – Email Delivery System
 * ------------------------------------------------------------
 *
 * Features:
 * - Centralized and configurable email sending via Nodemailer
 * - Uses external HTML templates for professional email layouts
 * - Robust error handling and Winston logging
 * - Supports multiple email use cases (verification, updates, orders, etc.)
 *
 * Directory:
 * - Templates are loaded from /src/assets/templates/emails/*.html
 *
 * Environment variables required:
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS,
 *   CLIENT_BASE_URL, CLIENT_PORT
 */

import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import logger from '@/services/logger.service';

// Type-only imports (ESM + NodeNext)
import type { Transporter } from 'nodemailer';

// ============================================================
// Configuration
// ============================================================

const SMTP_HOST = process.env['SMTP_HOST'] ?? 'localhost';
const SMTP_PORT = Number(process.env['SMTP_PORT'] ?? 587);
const SMTP_SECURE = process.env['SMTP_SECURE'] === 'true';
const SMTP_USER = process.env['SMTP_USER'] ?? '';
const SMTP_PASS = process.env['SMTP_PASS'] ?? '';
const CLIENT_BASE_URL = process.env['CLIENT_BASE_URL'] ?? 'localhost';
const CLIENT_PORT = process.env['CLIENT_PORT'] ?? '3000';

// Path to email templates
const TEMPLATE_DIR = path.join(process.cwd(), 'src', 'assets', 'template', 'emails');

// ============================================================
// Mail Transporter Setup
// ============================================================

const transporter: Transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// ============================================================
// Utility: Load Email Template
// ============================================================

/**
 * Loads an HTML email template from the template directory.
 * Optionally replaces variables like {{username}} or {{link}}.
 */
const loadTemplate = async (templateName: string, variables: Record<string, string>): Promise<string> => {
  try {
    const filePath = path.join(TEMPLATE_DIR, `${templateName}.html`);
    let html = await fs.readFile(filePath, 'utf8');

    // Replace placeholders {{variable}}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      html = html.replace(regex, value);
    }

    return html;
  } catch (error) {
    logger.error(`[MAILER] Failed to load template: ${templateName}`, error);
    throw new Error(`Template "${templateName}" not found or invalid.`);
  }
};

// ============================================================
// Utility: Send Mail
// ============================================================

/**
 * Sends an email using configured SMTP credentials.
 */
export const sendMail = async (
  fromName: string,
  to: string,
  subject: string,
  text: string,
  html: string
): Promise<void> => {
  const fromEmail = SMTP_USER;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    logger.info('[MAILER] Sending email', { fromName, to, subject });
    await transporter.sendMail(mailOptions);
    logger.info('[MAILER] Email sent successfully', { to, subject });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[MAILER] Failed to send email', { to, subject, error: err.message });
    throw err;
  }
};

// ============================================================
// High-Level Email Functions
// ============================================================

export const sendRegistrationVerificationEmail = async (
  to: string,
  username: string,
  verificationToken: string
): Promise<void> => {
  const fromName = 'Verification | NodCord';
  const subject = 'Verify Your Email Address';
  const verificationLink = `https://${CLIENT_BASE_URL}:${CLIENT_PORT}/verify-email/${verificationToken}`;
  const text = `Hello ${username}, please verify your email using the link: ${verificationLink}`;

  const html = await loadTemplate('registration-verification', {
    username,
    link: verificationLink,
    to,
    year: new Date().getFullYear().toString(),
  });

  await sendMail(fromName, to, subject, text, html);
};

export const sendVerificationSuccessEmail = async (to: string, username: string): Promise<void> => {
  const fromName = 'Verification | NodCord';
  const subject = 'Email Verification Successful';
  const text = `Hello ${username}, your email has been successfully verified.`;

  const html = await loadTemplate('verification-success', {
    username,
    to,
    year: new Date().getFullYear().toString(),
  });

  await sendMail(fromName, to, subject, text, html);
};

export const sendOAuth2CodeVerificationEmail = async (
  to: string,
  username: string,
  verificationCode: string
): Promise<void> => {
  const fromName = 'Verification | NodCord';
  const subject = 'OAuth2 Code Verification';
  const text = `Hello ${username}, your OAuth2 verification code is: ${verificationCode}`;

  const html = await loadTemplate('oauth2-verification', {
    username,
    code: verificationCode,
    to,
    year: new Date().getFullYear().toString(),
  });

  await sendMail(fromName, to, subject, text, html);
};

// Generic mailer helper for simple templates (order, ticket, etc.)
const sendSimpleTemplateEmail = async (
  fromName: string,
  to: string,
  subject: string,
  template: string,
  variables: Record<string, string>,
  text: string
): Promise<void> => {
  const html = await loadTemplate(template, { ...variables, to, year: new Date().getFullYear().toString() });
  await sendMail(fromName, to, subject, text, html);
};

// ============================================================
// Other Email Types
// ============================================================

export const sendOrderConfirmationEmail = async (to: string, orderDetails: string) =>
  sendSimpleTemplateEmail(
    'Order | NodCord',
    to,
    'Order Confirmation',
    'order-confirmation',
    { orderDetails },
    `Thank you for your order!\n\n${orderDetails}`
  );

export const sendShippingNotificationEmail = async (to: string, trackingNumber: string) =>
  sendSimpleTemplateEmail(
    'Order Shipping | NodCord',
    to,
    'Your Order Has Shipped',
    'shipping-notification',
    { trackingNumber },
    `Your order has shipped! Tracking number: ${trackingNumber}`
  );

export const sendTicketCreatedEmail = async (to: string, ticketDetails: string) =>
  sendSimpleTemplateEmail(
    'Ticket | NodCord',
    to,
    'New Ticket Created',
    'ticket-created',
    { ticketDetails },
    `A new ticket has been created.\n\n${ticketDetails}`
  );

export const sendUpdateNotificationEmail = async (
  to: string,
  updateTitle: string,
  updateDescription: string,
  updateLink: string
) =>
  sendSimpleTemplateEmail(
    'Updates | NodCord',
    to,
    'Exciting Update Available!',
    'update-notification',
    { updateTitle, updateDescription, updateLink },
    `${updateTitle}\n\n${updateDescription}\n\n${updateLink}`
  );

// ============================================================
// Export Default (Convenience)
// ============================================================

export default {
  sendMail,
  sendRegistrationVerificationEmail,
  sendVerificationSuccessEmail,
  sendOAuth2CodeVerificationEmail,
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendTicketCreatedEmail,
  sendUpdateNotificationEmail,
};
