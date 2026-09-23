// Plantillas de los emails transaccionales (verificación, bienvenida, reset
// de contraseña). HTML con estilos en línea y layout de tablas a propósito
// —es lo único que Gmail/Outlook/Apple Mail renderizan de forma fiable en un
// email, `<style>` y CSS moderno se ignoran o se recortan según el cliente.
// Colores de marca: crema `#FCF6EC`, texto `#241B10`, acento `#F97316`
// (mismos que la app — ver tailwind.config.js).

const BRAND = {
  bg: '#FCF6EC',
  card: '#FFFFFF',
  text: '#241B10',
  muted: '#6B5D48',
  primary: '#F97316',
  primaryDark: '#EA580C',
  border: '#241B10',
};

interface LayoutOptions {
  preheader: string; // texto de vista previa en la bandeja de entrada, oculto en el cuerpo
  heading: string;
  bodyHtml: string; // párrafos ya formados, sin envoltorio
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
}

const renderEmailLayout = ({ preheader, heading, bodyHtml, ctaText, ctaUrl, footerNote }: LayoutOptions): string => `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${heading}</title>
  </head>
  <body style="margin:0; padding:0; background-color:${BRAND.bg}; font-family:'Segoe UI', Helvetica, Arial, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg}; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:${BRAND.card}; border-radius:16px; overflow:hidden; border:1px solid rgba(36,27,16,0.08);">
            <tr>
              <td style="background-color:${BRAND.text}; padding:28px 32px; text-align:center;">
                <span style="font-family:Georgia, 'Times New Roman', serif; font-size:26px; font-weight:700; color:${BRAND.primary};">Nonnapp</span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 8px;">
                <h1 style="margin:0 0 16px; font-size:22px; line-height:1.3; color:${BRAND.text};">${heading}</h1>
                <div style="font-size:15px; line-height:1.6; color:${BRAND.text};">
                  ${bodyHtml}
                </div>
              </td>
            </tr>
            ${
              ctaText && ctaUrl
                ? `
            <tr>
              <td style="padding:8px 32px 12px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:10px; background-color:${BRAND.primary};">
                      <a href="${ctaUrl}" style="display:inline-block; padding:13px 28px; font-size:15px; font-weight:700; color:#FFFFFF; text-decoration:none; border-radius:10px; background-color:${BRAND.primary};">
                        ${ctaText}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:16px 0 0; font-size:12px; line-height:1.5; color:${BRAND.muted}; word-break:break-all;">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                  <a href="${ctaUrl}" style="color:${BRAND.primaryDark};">${ctaUrl}</a>
                </p>
              </td>
            </tr>`
                : ''
            }
            ${
              footerNote
                ? `
            <tr>
              <td style="padding:0 32px 28px;">
                <p style="margin:0; font-size:13px; line-height:1.5; color:${BRAND.muted};">${footerNote}</p>
              </td>
            </tr>`
                : ''
            }
            <tr>
              <td style="padding:20px 32px; border-top:1px solid rgba(36,27,16,0.08); text-align:center;">
                <p style="margin:0; font-size:12px; color:${BRAND.muted};">Nonnapp · Tu chef de IA personal</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();

export const verificationEmailTemplate = (username: string, verifyLink: string) => ({
  subject: 'Confirma tu email en Nonnapp',
  html: renderEmailLayout({
    preheader: 'Confirma tu cuenta para empezar a generar recetas con IA.',
    heading: `¡Hola, ${username}! 👋`,
    bodyHtml: `
      <p style="margin:0 0 12px;">Gracias por registrarte en Nonnapp. Confirma tu email para activar tu cuenta y empezar a generar recetas con IA.</p>
      <p style="margin:0; color:${BRAND.muted}; font-size:13px;">Este enlace caduca en 24 horas.</p>
    `,
    ctaText: 'Confirmar mi email',
    ctaUrl: verifyLink,
  }),
  text: `Hola ${username}, confirma tu email en Nonnapp para activar tu cuenta: ${verifyLink} (caduca en 24 horas)`,
});

export const welcomeEmailTemplate = (username: string, appUrl: string) => ({
  subject: '¡Bienvenido a Nonnapp! 🍳',
  html: renderEmailLayout({
    preheader: 'Tu cocina inteligente ya está lista.',
    heading: `¡Bienvenido a Nonnapp, ${username}!`,
    bodyHtml: `
      <p style="margin:0 0 12px;">Gracias por unirte. A partir de ahora, describe lo que te apetece comer o los ingredientes que tienes en la nevera, y Nonnapp te prepara una receta a medida en segundos.</p>
      <p style="margin:0;">Cuando confirmes tu email, ya podrás generar tu primera receta.</p>
    `,
    ctaText: 'Ir a Nonnapp',
    ctaUrl: appUrl,
  }),
  text: `Hola ${username}, gracias por unirte a Nonnapp. Entra en ${appUrl} para empezar a cocinar.`,
});

export const resetPasswordEmailTemplate = (resetLink: string) => ({
  subject: 'Restablece tu contraseña de Nonnapp',
  html: renderEmailLayout({
    preheader: 'Restablece tu contraseña de Nonnapp.',
    heading: 'Restablece tu contraseña',
    bodyHtml: `
      <p style="margin:0 0 12px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta de Nonnapp.</p>
      <p style="margin:0; color:${BRAND.muted}; font-size:13px;">Este enlace caduca en 30 minutos. Si no fuiste tú, puedes ignorar este email.</p>
    `,
    ctaText: 'Restablecer contraseña',
    ctaUrl: resetLink,
  }),
  text: `Restablece tu contraseña de Nonnapp aquí: ${resetLink} (caduca en 30 minutos). Si no fuiste tú, ignora este email.`,
});
