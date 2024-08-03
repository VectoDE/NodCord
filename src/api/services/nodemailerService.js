const nodemailer = require('nodemailer');

// Erstelle einen Transporter für SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // true für Port 465, false für andere Ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Funktion zum Versenden von E-Mails
const sendMail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Registrierungsverifikation
const sendRegistrationVerificationEmail = async (to, name, verificationLink) => {
  const subject = 'Verify Your Email Address';
  const text = `Hello ${name},\n\nPlease verify your email address by clicking on the following link: ${verificationLink}\n\nThank you!`;
  const html = `<p>Hello ${name},</p><p>Please verify your email address by clicking on the following link: <a href="${verificationLink}">${verificationLink}</a></p><p>Thank you!</p>`;
  await sendMail(to, subject, text, html);
};

// Bestellbestätigung
const sendOrderConfirmationEmail = async (to, orderDetails) => {
  const subject = 'Order Confirmation';
  const text = `Thank you for your order! Here are your order details:\n\n${orderDetails}\n\nThank you for shopping with us!`;
  const html = `<p>Thank you for your order! Here are your order details:</p><pre>${orderDetails}</pre><p>Thank you for shopping with us!</p>`;
  await sendMail(to, subject, text, html);
};

// Ware wurde losgeschickt
const sendShippingNotificationEmail = async (to, trackingNumber) => {
  const subject = 'Your Order Has Shipped';
  const text = `Your order has been shipped! You can track your shipment using the following tracking number: ${trackingNumber}.`;
  const html = `<p>Your order has been shipped!</p><p>You can track your shipment using the following tracking number: <strong>${trackingNumber}</strong>.</p>`;
  await sendMail(to, subject, text, html);
};

// Einladung
const sendInvitationEmail = async (to, eventDetails) => {
  const subject = 'You Are Invited!';
  const text = `You are invited to the following event:\n\n${eventDetails}\n\nWe hope to see you there!`;
  const html = `<p>You are invited to the following event:</p><pre>${eventDetails}</pre><p>We hope to see you there!</p>`;
  await sendMail(to, subject, text, html);
};

// Rücksendung
const sendReturnOrderEmail = async (to, returnDetails) => {
  const subject = 'Return Order Confirmation';
  const text = `Your return order has been processed. Here are the details:\n\n${returnDetails}\n\nThank you!`;
  const html = `<p>Your return order has been processed. Here are the details:</p><pre>${returnDetails}</pre><p>Thank you!</p>`;
  await sendMail(to, subject, text, html);
};

// Ticket erstellt
const sendTicketCreatedEmail = async (to, ticketDetails) => {
  const subject = 'New Ticket Created';
  const text = `A new ticket has been created. Here are the details:\n\n${ticketDetails}\n\nThank you!`;
  const html = `<p>A new ticket has been created. Here are the details:</p><pre>${ticketDetails}</pre><p>Thank you!</p>`;
  await sendMail(to, subject, text, html);
};

// Ticket geschlossen
const sendTicketClosedEmail = async (to, ticketDetails) => {
  const subject = 'Ticket Closed';
  const text = `Your ticket has been closed. Here are the details:\n\n${ticketDetails}\n\nThank you!`;
  const html = `<p>Your ticket has been closed. Here are the details:</p><pre>${ticketDetails}</pre><p>Thank you!</p>`;
  await sendMail(to, subject, text, html);
};

// Ticketantwort
const sendTicketReplyEmail = async (to, replyDetails) => {
  const subject = 'Ticket Reply';
  const text = `You have received a reply to your ticket. Here are the details:\n\n${replyDetails}\n\nThank you!`;
  const html = `<p>You have received a reply to your ticket. Here are the details:</p><pre>${replyDetails}</pre><p>Thank you!</p>`;
  await sendMail(to, subject, text, html);
};

// Projektstatus-Update
const sendProjectStatusUpdateEmail = async (to, projectUpdateDetails) => {
  const subject = 'Project Status Update';
  const text = `There is an update on your project. Here are the details:\n\n${projectUpdateDetails}\n\nThank you!`;
  const html = `<p>There is an update on your project. Here are the details:</p><pre>${projectUpdateDetails}</pre><p>Thank you!</p>`;
  await sendMail(to, subject, text, html);
};

// Newsletter-Abonnentenbestätigung
const sendSubscriptionConfirmation = async (to, name) => {
  const subject = 'Subscription Confirmation';
  const text = `Dear ${name},\n\nThank you for subscribing to our newsletter! We're excited to keep you updated with the latest news and offers.\n\nBest regards,\nYour Company`;
  const html = `<p>Dear ${name},</p><p>Thank you for subscribing to our newsletter! We're excited to keep you updated with the latest news and offers.</p><p>Best regards,<br>Your Company</p>`;
  await sendMail(to, subject, text, html);
};

module.exports = {
  sendRegistrationVerificationEmail,
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendInvitationEmail,
  sendReturnOrderEmail,
  sendTicketCreatedEmail,
  sendTicketClosedEmail,
  sendTicketReplyEmail,
  sendProjectStatusUpdateEmail,
  sendSubscriptionConfirmation
};
