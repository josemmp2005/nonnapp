import dns from 'node:dns';
import nodemailer from 'nodemailer';
import { env } from '../env.js';

const SMTP_HOST = 'smtp.gmail.com';

// nodemailer resuelve el host con dns.resolve4/resolve6 (consultas DNS
// "en bruto"), y en la red de Render la consulta IPv4 falla en silencio
// mientras la IPv6 sí responde -> ENETUNREACH al conectar, porque el plan
// gratuito no tiene salida IPv6 completa. dns.lookup() (getaddrinfo) sí
// funciona ahí, así que resolvemos la IP nosotros mismos y se la pasamos a
// nodemailer como host literal — al ser ya una IP, se salta su resolución
// interna (la que falla). `tls.servername` hace falta porque si no, con un
// host-IP el handshake TLS no sabe contra qué nombre validar el certificado.
const resolveSmtpHost = async (): Promise<string> => {
  try {
    const { address } = await dns.promises.lookup(SMTP_HOST, { family: 4 });
    return address;
  } catch {
    return SMTP_HOST;
  }
};

export const sendMail = async (to: string, subject: string, html: string, text?: string) => {
  if (!env.gmailUser || !env.gmailAppPassword) {
    console.warn('⚠️ GMAIL_USER/GMAIL_APP_PASSWORD no configurados: email no enviado (solo log).');
    console.log(`[email omitido] to=${to} subject=${subject}${text ? `\n${text}` : ''}`);
    return { skipped: true };
  }

  const host = await resolveSmtpHost();

  const transporter = nodemailer.createTransport({
    host,
    port: 465,
    secure: true,
    auth: { user: env.gmailUser, pass: env.gmailAppPassword },
    tls: { servername: SMTP_HOST },
  });

  const info = await transporter.sendMail({
    from: `Sabora App <${env.gmailUser}>`,
    to,
    subject,
    html,
    text: text || '',
  });

  return { skipped: false, messageId: info.messageId };
};
