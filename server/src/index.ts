import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './env.js';
import { pool } from './db.js';
import authRoutes from './routes/auth.js';
import recipesRoutes from './routes/recipes.js';
import profileRoutes from './routes/profile.js';
import subscriptionRoutes from './routes/subscription.js';
import aiRoutes from './routes/ai.js';

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/ai', aiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

const server = app.listen(env.port, () => {
  console.log(`🚀 Sabora API escuchando en http://localhost:${env.port}`);
});

// `docker stop` (y Ctrl+C) mandan SIGTERM/SIGINT — sin manejarlos, Node mata
// el proceso en seco a mitad de una request o con conexiones a Postgres
// todavía abiertas. Aquí se deja de aceptar conexiones nuevas, se espera a
// que terminen las que ya estaban en curso, se cierra el pool, y solo
// entonces se sale.
const shutdown = (signal: string) => {
  console.log(`\n${signal} recibido, cerrando servidor...`);

  server.close(async (err) => {
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
