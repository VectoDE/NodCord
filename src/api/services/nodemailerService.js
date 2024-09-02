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

const sendMail = async (fromName, to, subject, text, html) => {
  try {
    const fromEmail = process.env.SMTP_USER;
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    };

    logger.info('Sending email', { fromName, fromEmail, to, subject, text, html });
    await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { fromName, fromEmail, to, subject });
  } catch (error) {
    logger.error('Error sending email', { fromName, fromEmail, to, subject, error: error.message });
    throw error;
  }
};

const sendRegistrationVerificationEmail = async (to, username, verificationToken) => {
  const fromName = 'Verification | Hauknetz';
  const verificationLink = `https://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/verify-email/${verificationToken}`;

  const subject = 'Verify Your Email Address';
  const text = `Hello ${username},\n\nPlease verify your email address by clicking on the following link: ${verificationLink}\n\nThank you!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <header style="border-bottom: 1px solid #dddddd; padding-bottom: 20px; margin-bottom: 20px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <a href="https://nodcord.hauknetz.de/" style="display: inline-block;">
                    <img src="http://hauknetz.de:3000/assets/img/logo.png" alt="Logo" style="height: 40px;">
                </a>
            </div>

            <nav style="text-align: center; margin-bottom: 20px;">
                <a href="https://nodcord.hauknetz.de/" style="color: #007bff; text-decoration: none; display: inline-block; margin: 0 10px;">Home</a>
                <a href="https://nodcord.hauknetz.de/news" style="color: #007bff; text-decoration: none; display: inline-block; margin: 0 10px;">Blog</a>
                <a href="https://nodcord.hauknetz.de/tutorials" style="color: #007bff; text-decoration: none; display: inline-block; margin: 0 10px;">Tutorials</a>
                <a href="https://nodcord.hauknetz.de/support" style="color: #007bff; text-decoration: none; display: inline-block; margin: 0 10px;">Support</a>
            </nav>
        </header>

        <main style="text-align: center;">
            <h2 style="color: #333333; margin-bottom: 20px;">Hi ${username},</h2>

            <p style="color: #666666; line-height: 1.6; margin-bottom: 20px;">
                We’re glad to have you onboard! You’re already on your way to
                creating beautiful visual products. Whether you’re here for your brand,
                for a cause, or just for fun — welcome! If there’s anything you need,
                we’ll be here every step of the way.
            </p>

            <p style="color: #666666; margin-bottom: 20px;">
                Please verify your email address by clicking on the button below:
            </p>

            <a href="${verificationLink}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 0 auto; text-align: center;">Verify Email</a>

            <p style="color: #666666; margin-bottom: 20px;">
                Thanks, <br>
                The Hauknetz team
            </p>
        </main>

        <footer style="border-top: 1px solid #dddddd; padding-top: 20px; margin-top: 20px;">
            <p style="text-align: center; color: #999999; margin-bottom: 10px;">
              This email was sent to <a href="mailto:${to}" style="color: #007bff; text-decoration: underline;">${to}</a>.
            </p>

            <p style="text-align: center; color: #999999;">${new Date().getFullYear()} © Hauknetz. All rights reserved.</p>
        </footer>
    </div>
  `;

  logger.info('Preparing registration verification email', { fromName, to, username });
  await sendMail(fromName, to, subject, text, html);
};

const sendVerificationSuccessEmail = async (to, username) => {
  const fromName = 'Verification | Hauknetz';
  const subject = 'Email Verification Successful';
  const text = `Hello ${username},\n\nYour email address has been successfully verified. You can now log in to your account.\n\nThank you!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <header style="border-bottom: 1px solid #dddddd; padding-bottom: 20px; margin-bottom: 20px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <a href="https://nodcord.hauknetz.de/" style="display: inline-block;">
                    <img src="http://hauknetz.de:3000/assets/img/logo.png" alt="Logo" style="height: 40px;">
                </a>
            </div>

            <nav style="text-align: center; margin-bottom: 20px;">
                <a href="https://nodcord.hauknetz.de/" style="color: #007bff; text-decoration: none; display: inline-block; margin: 0 10px;">Home</a>
                <a href="https://nodcord.hauknetz.de/news" style="color: #007bff; text-decoration: none; display: inline-block; margin: 0 10px;">Blog</a>
                <a href="https://nodcord.hauknetz.de/tutorials" style="color: #007bff; text-decoration: none; display: inline-block; margin: 0 10px;">Tutorials</a>
                <a href="https://nodcord.hauknetz.de/support" style="color: #007bff; text-decoration: none; display: inline-block; margin: 0 10px;">Support</a>
            </nav>
        </header>

        <main style="text-align: center;">
            <h2 style="color: #333333; margin-bottom: 20px;">Hello ${username},</h2>

            <p style="color: #666666; line-height: 1.6; margin-bottom: 20px;">
                Your email address has been successfully verified. You can now log in to your account.
            </p>

            <p style="color: #666666; margin-bottom: 20px;">
                Thank you for verifying your email!
            </p>
        </main>

        <footer style="border-top: 1px solid #dddddd; padding-top: 20px; margin-top: 20px;">
            <p style="text-align: center; color: #999999; margin-bottom: 10px;">
              This email was sent to <a href="mailto:${to}" style="color: #007bff; text-decoration: underline;">${to}</a>.
            </p>

            <p style="text-align: center; color: #999999;">${new Date().getFullYear()} © Hauknetz. All rights reserved.</p>
        </footer>
    </div>
  `;

  logger.info('Preparing verification success email', { fromName, to, username });
  await sendMail(fromName, to, subject, text, html);
};

const sendOAuth2CodeVerificationEmail = async (to, username, verificationCode) => {
  const fromName = 'Verification | Hauknetz';
  const subject = 'OAuth2 Code Verification';
  const text = `Hello ${username},\n\nYour verification code is: ${verificationCode}\n\nPlease use this code to complete the OAuth2 verification process.\n\nThank you!`;
  const html = `
    <section style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <header style="margin-bottom: 20px;">
            <a href="https://nodcord.hauknetz.de/">
                <img src="http://hauknetz.de:3000/assets/img/logo.png" alt="Logo" style="height: 40px; width: auto;">
            </a>
        </header>

        <main>
            <p style="font-size: 20px; color: #333333;">Hello ${username},</p>

            <p style="margin-top: 16px; color: #666666; line-height: 1.6;">
                We have received a request to verify your account. Here is your verification code:
            </p>

            <div style="background-color: #f1f1f1; padding: 16px; border-radius: 4px; margin-top: 16px;">
                <p style="font-size: 18px; color: #333333; text-align: center;">${verificationCode}</p>
            </div>

            <p style="margin-top: 16px; color: #666666;">
                Please use this code to complete the OAuth2 verification process. If you did not request this, please ignore this email.
            </p>

            <button style="display: inline-block; padding: 10px 20px; margin-top: 16px; font-size: 14px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px; transition: background-color 0.3s;">
                <a href="#" style="color: #ffffff; text-decoration: none;">Complete Verification</a>
            </button>
        </main>

        <footer style="margin-top: 20px; text-align: center;">
            <p style="color: #999999; margin-bottom: 10px;">
                This email was sent to <a href="mailto:${to}" style="color: #007bff; text-decoration: underline;">${to}</a>.
                If you'd rather not receive this kind of email, you can <a href="#" style="color: #007bff; text-decoration: underline;">unsubscribe</a> or <a href="#" style="color: #007bff; text-decoration: underline;">manage your email preferences</a>.
            </p>

            <p style="color: #999999;">${new Date().getFullYear()} © Hauknetz. All Rights Reserved.</p>
        </footer>
    </section>
  `;

  logger.info('Preparing OAuth2 code verification email', { fromName, to, username });
  await sendMail(fromName, to, subject, text, html);
};

const sendSubscriptionConfirmation = async (to, name) => {
  const fromName = 'Subscription | Hauknetz';
  const subject = 'Subscription Confirmation';
  const text = `Dear ${name},\n\nThank you for subscribing to our newsletter! We're excited to keep you updated with the latest news and offers.\n\nBest regards,\nYour Company`;
  const html = `<p>Dear ${name},</p><p>Thank you for subscribing to our newsletter! We're excited to keep you updated with the latest news and offers.</p><p>Best regards,<br>Your Company</p>`;

  logger.info('Preparing subscription confirmation email', { fromName, to, name });
  await sendMail(fromName, to, subject, text, html);
};

const sendOrderConfirmationEmail = async (to, orderDetails) => {
  const fromName = 'Order | Hauknetz';
  const subject = 'Order Confirmation';
  const text = `Thank you for your order! Here are your order details:\n\n${orderDetails}\n\nThank you for shopping with us!`;
  const html = `<p>Thank you for your order! Here are your order details:</p><pre>${orderDetails}</pre><p>Thank you for shopping with us!</p>`;

  logger.info('Preparing order confirmation email', { fromName, to, orderDetails });
  await sendMail(fromName, to, subject, text, html);
};

const sendShippingNotificationEmail = async (to, trackingNumber) => {
  const fromName = 'Order Shipping | Hauknetz';
  const subject = 'Your Order Has Shipped';
  const text = `Your order has been shipped! You can track your shipment using the following tracking number: ${trackingNumber}.`;
  const html = `<p>Your order has been shipped!</p><p>You can track your shipment using the following tracking number: <strong>${trackingNumber}</strong>.</p>`;

  logger.info('Preparing shipping notification email', { fromName, to, trackingNumber });
  await sendMail(fromName, to, subject, text, html);
};

const sendReturnOrderEmail = async (to, returnDetails) => {
  const fromName = 'Order Return | Hauknetz';
  const subject = 'Return Order Confirmation';
  const text = `Your return order has been processed. Here are the details:\n\n${returnDetails}\n\nThank you!`;
  const html = `<p>Your return order has been processed. Here are the details:</p><pre>${returnDetails}</pre><p>Thank you!</p>`;

  logger.info('Preparing return order confirmation email', { fromName, to, returnDetails });
  await sendMail(fromName, to, subject, text, html);
};

const sendInvitationEmail = async (to, eventDetails) => {
  const fromName = 'Invitation | Hauknetz';
  const subject = 'You Are Invited!';
  const text = `You are invited to the following event:\n\n${eventDetails}\n\nWe hope to see you there!`;
  const html = `<p>You are invited to the following event:</p><pre>${eventDetails}</pre><p>We hope to see you there!</p>`;

  logger.info('Preparing invitation email', { fromName, to, eventDetails });
  await sendMail(fromName, to, subject, text, html);
};

const sendTicketCreatedEmail = async (to, ticketDetails) => {
  const fromName = 'Ticket | Hauknetz';
  const subject = 'New Ticket Created';
  const text = `A new ticket has been created. Here are the details:\n\n${ticketDetails}\n\nThank you!`;
  const html = `<p>A new ticket has been created. Here are the details:</p><pre>${ticketDetails}</pre><p>Thank you!</p>`;

  logger.info('Preparing ticket created email', { fromName, to, ticketDetails });
  await sendMail(fromName, to, subject, text, html);
};

const sendTicketClosedEmail = async (to, ticketDetails) => {
  const fromName = 'Ticket | Hauknetz';
  const subject = 'Ticket Closed';
  const text = `Your ticket has been closed. Here are the details:\n\n${ticketDetails}\n\nThank you!`;
  const html = `<p>Your ticket has been closed. Here are the details:</p><pre>${ticketDetails}</pre><p>Thank you!</p>`;

  logger.info('Preparing ticket closed email', { fromName, to, ticketDetails });
  await sendMail(fromName, to, subject, text, html);
};

const sendTicketReplyEmail = async (to, replyDetails) => {
  const fromName = 'Ticket | Hauknetz';
  const subject = 'Ticket Reply';
  const text = `You have received a reply to your ticket. Here are the details:\n\n${replyDetails}\n\nThank you!`;
  const html = `<p>You have received a reply to your ticket. Here are the details:</p><pre>${replyDetails}</pre><p>Thank you!</p>`;

  logger.info('Preparing ticket reply email', { fromName, to, replyDetails });
  await sendMail(fromName, to, subject, text, html);
};

const sendProjectStatusUpdateEmail = async (to, projectUpdateDetails) => {
  const fromName = 'Project | Hauknetz';
  const subject = 'Project Status Update';
  const text = `There is an update on your project. Here are the details:\n\n${projectUpdateDetails}\n\nThank you!`;
  const html = `<p>There is an update on your project. Here are the details:</p><pre>${projectUpdateDetails}</pre><p>Thank you!</p>`;

  logger.info('Preparing project status update email', { fromName, to, projectUpdateDetails });
  await sendMail(fromName, to, subject, text, html);
};

const sendDeveloperProgramJoinEmail = async (to, username) => {
  const fromName = 'Developer Program | Hauknetz';
  const subject = 'Developer Program Confirmation';
  const text = `Hello ${username},\n\nYou have successfully joined the developer program. You can now generate and use API keys for your projects.\n\nThank you!`;
  const html = `<p>Hello ${username},</p><p>You have successfully joined the developer program. You can now generate and use API keys for your projects.</p><p>Thank you!</p>`;

  logger.info('Preparing developer program join email', { fromName, to, username });
  await sendMail(fromName, to, subject, text, html);
};

const sendDeveloperProgramLeaveEmail = async (to, username) => {
  const fromName = 'Developer Program | Hauknetz';
  const subject = 'Developer Program Exit Confirmation';
  const text = `Hello ${username},\n\nYou have successfully left the developer program. Your API keys will no longer be valid.\n\nThank you!`;
  const html = `<p>Hello ${username},</p><p>You have successfully left the developer program. Your API keys will no longer be valid.</p><p>Thank you!</p>`;

  logger.info('Preparing developer program leave email', { fromName, to, username });
  await sendMail(fromName, to, subject, text, html);
};

const sendUpdateNotificationEmail = async (to, updateTitle, updateDescription, updateLink) => {
  const fromName = 'Updates | Hauknetz';
  const subject = 'Exciting Update Available!';
  const text = `Hello,\n\nWe are excited to announce a new update for our software. ${updateTitle}\n\n${updateDescription}\n\nYou can learn more about this update and download it here: ${updateLink}\n\nThank you!`;
  const html = `
    <section style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <header style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #dddddd; padding-bottom: 20px; margin-bottom: 20px;">
            <a href="https://nodcord.hauknetz.de/">
                <img src="http://hauknetz.de:3000/assets/img/logo.png" alt="Logo" style="height: 40px; width: auto;">
            </a>

            <div style="display: flex; gap: 16px;">
                <a href="https://nodcord.hauknetz.de/login" style="text-decoration: none; color: #007bff; font-size: 14px; transition: color 0.3s;">Login</a>
                <a href="https://nodcord.hauknetz.de/register" style="text-decoration: none; color: #007bff; font-size: 14px; transition: color 0.3s;">Register</a>
            </div>
        </header>

        <main>
            <img src="https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80" alt="Update Image" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;">

            <h2 style="color: #333333; margin-bottom: 16px; font-size: 24px;">${updateTitle}</h2>

            <p style="color: #666666; line-height: 1.6; margin-bottom: 20px;">
                ${updateDescription}
            </p>

            <a href="${updateLink}" style="display: inline-flex; align-items: center; padding: 10px 20px; font-size: 14px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px; transition: background-color 0.3s;">
                Learn More
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 16px; height: 16px; margin-left: 8px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
            </a>
        </main>

        <footer style="border-top: 1px solid #dddddd; padding-top: 20px; margin-top: 20px; text-align: center;">
            <p style="color: #999999; margin-bottom: 10px;">
                This email was sent to <a href="mailto:${to}" style="color: #007bff; text-decoration: underline;">${to}</a>.
            </p>

            <p style="color: #999999;">${new Date().getFullYear()} © Hauknetz. All Rights Reserved.</p>
        </footer>
    </section>
  `;

  logger.info('Preparing update notification email', { fromName, to, updateTitle });
  await sendMail(fromName, to, subject, text, html);
};

module.exports = {
  sendRegistrationVerificationEmail,
  sendVerificationSuccessEmail,
  sendOAuth2CodeVerificationEmail,
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
  sendDeveloperProgramLeaveEmail,
  sendUpdateNotificationEmail,
};
