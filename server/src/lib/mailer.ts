import { env } from '../env.js';

// Brevo (antes Sendinblue) en vez de SMTP/Gmail: el plan gratuito de Render
// (y de PaaS similares) bloquea el tráfico SMTP saliente (puertos 25/465/587)
// para evitar spam — Brevo manda el email vía una petición HTTPS normal
// (puerto 443), que nunca está bloqueado. A diferencia de Resend, su plan
// gratuito permite verificar un email normal (sin dominio propio) como
// remitente autorizado y mandar a cualquier destinatario, no solo al dueño
// de la cuenta — necesario porque el proyecto no tiene un dominio propio.
const FROM_RE = /^(.*)<(.+)>$/;

const parseSender = (from: string) => {
  const match = FROM_RE.exec(from.trim());
  if (!match) return { name: 'Nonnapp', email: from.trim() };
  return { name: match[1].trim(), email: match[2].trim() };
};

export const sendMail = async (to: string, subject: string, html: string, text?: string) => {
  if (!env.brevoApiKey) {
    console.warn('⚠️ BREVO_API_KEY no configurada: email no enviado (solo log).');
    console.log(`[email omitido] to=${to} subject=${subject}${text ? `\n${text}` : ''}`);
    return { skipped: true };
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'api-key': env.brevoApiKey,
    },
    body: JSON.stringify({
      sender: parseSender(env.brevoFrom),
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo: ${response.status} - ${errorText.substring(0, 300)}`);
  }

  const data = await response.json();
  return { skipped: false, messageId: data?.messageId };
};
