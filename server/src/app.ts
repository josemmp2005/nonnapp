import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env, isProd } from './env.js';
import { createApiRateLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';
import recipesRoutes from './routes/recipes.js';
import profileRoutes from './routes/profile.js';
import subscriptionRoutes from './routes/subscription.js';
import aiRoutes from './routes/ai.js';

// Extraído de index.ts para que los tests puedan importar la app de Express
// (con supertest) sin arrancar un servidor real ni aplicar el esquema —
// index.ts sigue siendo el único que hace app.listen()/shutdown.
export const app = express();

// Detrás de un proxy inverso en producción (Render/Railway/nginx), sin esto
// `req.ip` sería siempre la IP del proxy y el rate-limiting por IP no serviría
// de nada (todo el tráfico contaría como un único cliente).
if (isProd) app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Backstop general contra abuso/DoS básico. Las rutas sensibles (login,
// signup, IA) ya tienen sus propios límites más estrictos por debajo de este.
app.use('/api', createApiRateLimiter());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/ai', aiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});
