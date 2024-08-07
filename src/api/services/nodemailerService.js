const nodemailer = require('nodemailer');
const logger = require('./loggerService');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendMail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully to:', to);
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

const sendRegistrationVerificationEmail = async (to, username, verificationToken) => {
  const verificationLink = `http://${process.env.BASE_URL}:${process.env.PORT}/verify-email/${verificationToken}`;
  const subject = 'Verify Your Email Address';
  const text = `Hello ${username},\n\nPlease verify your email address by clicking on the following link: ${verificationLink}\n\nThank you!`;
  const html = `<p>Hello ${username},</p><p>Please verify your email address by clicking on the following link: <a href="${verificationLink}">${verificationLink}</a></p><p>Thank you!</p>`;
  await sendMail(to, subject, text, html);
};

const sendVerificationSuccessEmail = async (to, username) => {
  const subject = 'Email Verification Successful';
  const text = `Hello ${username},\n\nYour email address has been successfully verified. You can now log in to your account.\n\nThank you!`;
  const html = `<p>Hello ${username},</p><p>Your email address has been successfully verified. You can now log in to your account.</p><p>Thank you!</p>`;
  await sendMail(to, subject, text, html);
};

const sendSubscriptionConfirmation = async (to, name) => {
  const subject = 'Subscription Confirmation';
  const text = `Dear ${name},\n\nThank you for subscribing to our newsletter! We're excited to keep you updated with the latest news and offers.\n\nBest regards,\nYour Company`;
  const html = `<p>Dear ${name},</p><p>Thank you for subscribing to our newsletter! We're excited to keep you updated with the latest news and offers.</p><p>Best regards,<br>Your Company</p>`;
  await sendMail(to, subject, text, html);
};

const sendOrderConfirmationEmail = async (to, orderDetails) => {
  const subject = 'Order Confirmation';
  const text = `Thank you for your order! Here are your order details:\n\n${orderDetails}\n\nThank you for shopping with us!`;
  const html = `<p>Thank you for your order! Here are your order details:</p><pre>${orderDetails}</pre><p>Thank you for shopping with us!</p>`;
  await sendMail(to, subject, text, html);
};

const sendShippingNotificationEmail = async (to, trackingNumber) => {
  const subject = 'Your Order Has Shipped';
  const text = `Your order has been shipped! You can track your shipment using the following tracking number: ${trackingNumber}.`;
  const html = `<p>Your order has been shipped!</p><p>You can track your shipment using the following tracking number: <strong>${trackingNumber}</strong>.</p>`;
  await sendMail(to, subject, text, html);
};

const sendInvitationEmail = async (to, eventDetails) => {
  const subject = 'You Are Invited!';
  const text = `You are invited to the following event:\n\n${eventDetails}\n\nWe hope to see you there!`;
  const html = `<p>You are invited to the following event:</p><pre>${eventDetails}</pre><p>We hope to see you there!</p>`;
  await sendMail(to, subject, text, html);
};

const sendReturnOrderEmail = async (to, returnDetails) => {
  const subject = 'Return Order Confirmation';
  const text = `Your return order has been processed. Here are the details:\n\n${returnDetails}\n\nThank you!`;
  const html = `<p>Your return order has been processed. Here are the details:</p><pre>${returnDetails}</pre><p>Thank you!</p>`;
  await sendMail(to, subject, text, html);
};

const sendTicketCreatedEmail = async (to, ticketDetails) => {
  const subject = 'New Ticket Created';
  const text = `A new ticket has been created. Here are the details:\n\n${ticketDetails}\n\nThank you!`;
  const html = `<p>A new ticket has been created. Here are the details:</p><pre>${ticketDetails}</pre><p>Thank you!</p>`;
  await sendMail(to, subject, text, html);
};

const sendTicketClosedEmail = async (to, ticketDetails) => {
  const subject = 'Ticket Closed';
  const text = `Your ticket has been closed. Here are the details:\n\n${ticketDetails}\n\nThank you!`;
  const html = `<p>Your ticket has been closed. Here are the details:</p><pre>${ticketDetails}</pre><p>Thank you!</p>`;
  await sendMail(to, subject, text, html);
};

const sendTicketReplyEmail = async (to, replyDetails) => {
  const subject = 'Ticket Reply';
  const text = `You have received a reply to your ticket. Here are the details:\n\n${replyDetails}\n\nThank you!`;
  const html = `<p>You have received a reply to your ticket. Here are the details:</p><pre>${replyDetails}</pre><p>Thank you!</p>`;
  await sendMail(to, subject, text, html);
};

const sendProjectStatusUpdateEmail = async (to, projectUpdateDetails) => {
  const subject = 'Project Status Update';
  const text = `There is an update on your project. Here are the details:\n\n${projectUpdateDetails}\n\nThank you!`;
  const html = `<p>There is an update on your project. Here are the details:</p><pre>${projectUpdateDetails}</pre><p>Thank you!</p>`;
  await sendMail(to, subject, text, html);
};

const sendDeveloperProgramJoinEmail = async (to, username) => {
  const subject = 'Developer Program Confirmation';
  const text = `Hello ${username},\n\nYou have successfully joined the developer program. You can now generate and use API keys for your projects.\n\nThank you!`;
  const html = `<p>Hello ${username},</p><p>You have successfully joined the developer program. You can now generate and use API keys for your projects.</p><p>Thank you!</p>`;
  await sendMail(to, subject, text, html);
};

const sendDeveloperProgramLeaveEmail = async (to, username) => {
  const subject = 'Developer Program Exit Confirmation';
  const text = `Hello ${username},\n\nYou have successfully left the developer program. Your API keys will no longer be valid.\n\nThank you!`;
  const html = `<p>Hello ${username},</p><p>You have successfully left the developer program. Your API keys will no longer be valid.</p><p>Thank you!</p>`;
  await sendMail(to, subject, text, html);
};

module.exports = {
  sendRegistrationVerificationEmail,
  sendVerificationSuccessEmail,
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendInvitationEmail,
  sendReturnOrderEmail,
  sendTicketCreatedEmail,
  sendTicketClosedEmail,
  sendTicketReplyEmail,
  sendProjectStatusUpdateEmail,
  sendSubscriptionConfirmation,
  sendDeveloperProgramJoinEmail,
  sendDeveloperProgramLeaveEmail
};
