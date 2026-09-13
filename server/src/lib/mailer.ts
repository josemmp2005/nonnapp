import nodemailer from 'nodemailer';
import { env } from '../env.js';

const transporter =
  env.gmailUser && env.gmailAppPassword
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: { user: env.gmailUser, pass: env.gmailAppPassword },
      })
    : null;

export const sendMail = async (to: string, subject: string, html: string, text?: string) => {
  if (!transporter) {
    console.warn('⚠️ GMAIL_USER/GMAIL_APP_PASSWORD no configurados: email no enviado (solo log).');
    console.log(`[email omitido] to=${to} subject=${subject}${text ? `\n${text}` : ''}`);
    return { skipped: true };
  }

  const info = await transporter.sendMail({
    from: `Sabora App <${env.gmailUser}>`,
    to,
    subject,
    html,
    text: text || '',
  });

  return { skipped: false, messageId: info.messageId };
};
