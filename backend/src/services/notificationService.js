// backend/src/services/notificationService.js

const { buildEmail } = require("../emails");
const { sendEmail } = require("./emailService");
const { EmailTemplateId } = require("../emails/types");

/**
 * 1. WELCOME EMAIL
 */
async function sendWelcomeEmail(params) {
  const { to, userName, appUrl, unsubscribeUrl } = params;

  const content = buildEmail(EmailTemplateId.WELCOME, {
    userName,
    appUrl,
    unsubscribeUrl,
  });

  await sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });
}

/**
 * 2. REGISTRATION CONFIRMATION EMAIL
 */
async function sendRegistrationConfirmationEmail(params) {
  const {
    to,
    userName,
    eventName,
    eventDate,
    eventLocation,
    eventUrl,
    unsubscribeUrl,
  } = params;

  const content = buildEmail(EmailTemplateId
    .REGISTRATION_CONFIRMATION, {
    userName,
    eventName,
    eventDate,
    eventLocation,
    eventUrl,
    unsubscribeUrl,
  });

  await sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });
}

/**
 * 3. EVENT REMINDER EMAIL
 */
async function sendEventReminderEmail(params) {
  const {
    to,
    userName,
    eventName,
    eventDate,
    eventLocation,
    eventUrl,
    unsubscribeUrl,
  } = params;

  const content = buildEmail(EmailTemplateId.EVENT_REMINDER, {
    userName,
    eventName,
    eventDate,
    eventLocation,
    eventUrl,
    unsubscribeUrl,
  });

  await sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });
}

/**
 * 4. EVENT UPDATE EMAIL
 */
async function sendEventUpdateEmail(params) {
  const {
    to,
    userName,
    eventName,
    eventDate,
    eventLocation,
    eventUrl,
    unsubscribeUrl,
  } = params;

  const content = buildEmail(EmailTemplateId.EVENT_UPDATE, {
    userName,
    eventName,
    eventDate,
    eventLocation,
    eventUrl,
    unsubscribeUrl,
  });

  await sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });
}

/**
 * 5. EVENT CANCELLATION EMAIL
 */
async function sendEventCancellationEmail(params) {
  const {
    to,
    userName,
    eventName,
    eventDate,
    eventLocation,
    eventUrl,
    unsubscribeUrl,
  } = params;

  const content = buildEmail(EmailTemplateId.EVENT_CANCELLATION, {
    userName,
    eventName,
    eventDate,
    eventLocation,
    eventUrl,
    unsubscribeUrl,
  });

  await sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });
}

/**
 * 6. PASSWORD RESET EMAIL
 */
async function sendPasswordResetEmail(params) {
  const { to, userName, resetUrl, unsubscribeUrl } = params;

  const content = buildEmail(EmailTemplateId.PASSWORD_RESET, {
    userName,
    resetUrl,
    unsubscribeUrl,
  });

  await sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });
}

/**
 * 7. PASSWORD CHANGED EMAIL
 */
async function sendPasswordChangedEmail(params) {
  const { to, userName, unsubscribeUrl } = params;

  const content = buildEmail(EmailTemplateId.PASSWORD_CHANGED, {
    userName,
    unsubscribeUrl,
  });

  await sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });
}


module.exports = {
  sendWelcomeEmail,
  sendRegistrationConfirmationEmail,
  sendEventReminderEmail,
  sendEventUpdateEmail,
  sendEventCancellationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
};
