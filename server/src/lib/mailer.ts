import { Resend } from 'resend';
import { env } from '../env.js';

// Resend en vez de SMTP/Gmail: el plan gratuito de Render (y de PaaS similares)
// bloquea el tráfico SMTP saliente (puertos 25/465/587) para evitar spam —
// nada que hagamos con DNS o el driver puede saltarse eso. Resend manda el
// email vía una petición HTTPS normal (puerto 443), que nunca está bloqueado.
const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

export const sendMail = async (to: string, subject: string, html: string, text?: string) => {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY no configurada: email no enviado (solo log).');
    console.log(`[email omitido] to=${to} subject=${subject}${text ? `\n${text}` : ''}`);
    return { skipped: true };
  }

  const { data, error } = await resend.emails.send({
    from: env.resendFrom,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(`Resend: ${error.message}`);
  }

  return { skipped: false, messageId: data?.id };
};
