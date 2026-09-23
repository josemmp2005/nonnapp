import dns from 'node:dns';

// Algunos PaaS (Render free tier incluido) no tienen salida IPv6 completa.
// smtp.gmail.com (y otros hosts) puede resolver a IPv6 primero según el
// orden por defecto del sistema, dando ENETUNREACH al conectar — esto lo
// fuerza a intentar siempre IPv4 antes en cualquier dns.lookup() del proceso,
// nodemailer incluido.
dns.setDefaultResultOrder('ipv4first');

import { env, isProd } from './env.js';
import { pool } from './db.js';
import { applySchema } from './lib/migrate.js';
import { app } from './app.js';

// schema.sql es idempotente (CREATE TABLE / ADD COLUMN IF NOT EXISTS), así
// que aplicarlo en cada arranque es seguro — evita depender de un paso manual
// de "migración" que en un PaaS gratuito (Render) es fácil olvidar en el
// primer despliegue y se traduce en 500s por tablas inexistentes.
// El error más típico del login con Google es `redirect_uri_mismatch`: la URL
// que enviamos no coincide con las registradas en Google Cloud Console. Se
// deja escrita en el log de arranque la que se está usando de verdad, para no
// tener que adivinarla.
const logGoogleConfig = () => {
  if (!env.googleClientId || !env.googleClientSecret) return;
  console.log(`🔑 Login con Google activo — redirect_uri: ${env.googleRedirectUri}`);
  console.log(
    '   Debe estar dada de alta EXACTAMENTE igual en Google Cloud Console → APIs y servicios → Credenciales → tu ID de cliente OAuth → "URI de redireccionamiento autorizados".'
  );
  if (isProd && /localhost|127\.0\.0\.1/.test(env.googleRedirectUri)) {
    console.warn(
      '⚠️ El redirect_uri de Google apunta a localhost en producción: Google lo rechazará (redirect_uri_mismatch). ' +
        'Define GOOGLE_REDIRECT_URI con la URL pública del backend + /api/auth/google/callback.'
    );
  }
};

let server: ReturnType<typeof app.listen>;
applySchema()
  .then(() => {
    server = app.listen(env.port, () => {
      console.log(`🚀 Sabora API escuchando en http://localhost:${env.port}`);
      logGoogleConfig();
    });
  })
  .catch((err) => {
    console.error('❌ No se pudo aplicar el esquema de la base de datos:', err);
    process.exit(1);
  });

// `docker stop` (y Ctrl+C) mandan SIGTERM/SIGINT — sin manejarlos, Node mata
// el proceso en seco a mitad de una request o con conexiones a Postgres
// todavía abiertas. Aquí se deja de aceptar conexiones nuevas, se espera a
// que terminen las que ya estaban en curso, se cierra el pool, y solo
// entonces se sale.
const shutdown = (signal: string) => {
  console.log(`\n${signal} recibido, cerrando servidor...`);

  const closeHttp = (cb: (err?: Error) => void) => (server ? server.close(cb) : cb());

  closeHttp(async (err) => {
    if (err) {
      console.error('Error cerrando el servidor HTTP:', err);
      process.exitCode = 1;
    }
    try {
      await pool.end();
      console.log('Conexiones a Postgres cerradas.');
    } catch (poolErr) {
      console.error('Error cerrando el pool de Postgres:', poolErr);
      process.exitCode = 1;
    }
    process.exit();
  });

  // Salvavidas: si algo se queda colgado (una request larga, una conexión
  // keep-alive que no cierra), no dejar el proceso como zombie para siempre.
  setTimeout(() => {
    console.error('Cierre forzado tras 10s de espera.');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Red de seguridad: Express 4 no atrapa un rechazo de promesa lanzado dentro
// de un handler `async` que no tenga su propio try/catch (a diferencia de un
// throw síncrono, que sí captura). Sin este listener, Node considera un
// unhandledRejection un error fatal y mata el proceso entero — una sola
// request mal formada tumbaría la API para todos los usuarios a la vez. Esto
// no soluciona el bug de origen (cada ruta debe seguir validando su propio
// input, como en lib/schemas.ts), es el último cinturón de seguridad para
// que un fallo así se quede en un log, no en una caída del servicio.
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ unhandledRejection (revisa el try/catch de la ruta que lo causó):', reason);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ uncaughtException (revisa el try/catch de la ruta que lo causó):', err);
});
