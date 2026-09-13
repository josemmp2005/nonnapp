# Sabora

App de recetas con IA: describe qué tienes en la despensa (o qué te apetece) y genera una receta completa con foto, pasos y un chef de IA para resolver dudas mientras cocinas.

Este documento es la referencia **de código** (stack, arquitectura, cómo levantar el proyecto, API, esquema de datos). Para entender **qué hace la app** desde el punto de vista de un usuario, ver [`docs/FUNCIONAMIENTO.md`](docs/FUNCIONAMIENTO.md).

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + React Router.
- **Backend**: Node.js + Express + TypeScript, driver `pg` directo (sin ORM).
- **Base de datos**: PostgreSQL (local, vía Docker).
- **IA**: [Groq](https://groq.com) (texto de las recetas y chat del chef) + Gemini (opcional, solo para generar la foto del plato).
- **Auth**: propia — email/password, JWT firmado por el servidor en una cookie `httpOnly`. No usa Supabase ni ningún proveedor externo.

## Estructura del repo

```
sabora-app/
  src/                    Frontend (Vite)
    components/           Páginas y componentes de React
    context/               Theme, Toast, Subscription (React Context)
    services/
      api.ts                Wrapper fetch de bajo nivel (cookies, JSON, errores)
      auth.ts                Login/signup/logout/reset — llama a /api/auth/*
      data.ts                Recetas/preferencias/suscripción — llama al resto de /api/*
      gemini-edge.ts          Llama a /api/ai/* (generar receta, imagen, chat)
    types.ts               Tipos compartidos del dominio (Recipe, UserProfile, ...)
  server/                 Backend (Express)
    src/
      index.ts              Punto de entrada, monta las rutas y el CORS
      db.ts                  Pool de Postgres + helper de transacciones
      schema.sql             Esquema canónico de la BBDD (fuente de verdad)
      env.ts                 Lectura/validación de variables de entorno
      middleware/auth.ts      Verifica el JWT de la cookie, exige sesión
      lib/groq.ts             Cliente HTTP a la API de Groq
      lib/mailer.ts           Envío de emails (Nodemailer / Gmail)
      routes/                 Un archivo por área: auth, recipes, profile, subscription, ai
  docker-compose.yml      Postgres + Adminer (dev) + server/web (stack completo, ver más abajo)
  Dockerfile              Imagen del frontend (build Vite + nginx)
  server/Dockerfile        Imagen del backend (build TypeScript + runtime)
  archive/                Código de la versión antigua con Supabase (referencia, no se usa)
```

## Desarrollo local

Requiere Docker (para Postgres) y Node 18+.

```bash
# 1. Levantar Postgres local (+ Adminer, interfaz web para ver la BBDD)
docker compose up -d

# 2. Backend: configurar una vez
cd server
cp .env.example .env   # y añade tu GROQ_API_KEY (ver "Variables de entorno")
npm install
npm run db:init        # aplica server/src/schema.sql

# 3. Frontend: instalar dependencias (desde la raíz)
cd ..
npm install

# 4. Arrancar TODO junto (recomendado)
npm run dev:all         # frontend :5173 + backend :3001 en una sola terminal
```

**`npm run dev:all` es el comando a usar día a día** — levanta frontend y backend juntos con [`concurrently`](https://www.npmjs.com/package/concurrently), con la salida de cada uno coloreada y etiquetada (`[web]` / `[api]`) en la misma terminal, y Ctrl+C los para a los dos a la vez. Esto existe porque el fallo más habitual en este proyecto no era ningún bug: era arrancar el frontend y olvidarse de que el backend necesita su propio proceso — con un solo comando ya no hay "olvido" posible.

Si prefieres verlos por separado (dos terminales, por ejemplo para reiniciar solo uno sin tocar el otro): `npm run dev` (frontend) y `npm run dev:server` (backend, desde la raíz) o `cd server && npm run dev`. Sea cual sea el método, **el backend tiene que seguir corriendo** mientras se usa la app — si se cierra su proceso, el login y la generación de recetas fallan con `ERR_CONNECTION_REFUSED`.

### Scripts disponibles

| Comando (raíz) | Qué hace |
|---|---|
| `npm run dev:all` | **Frontend + backend juntos** (recomendado para desarrollo día a día) |
| `npm run dev` | Solo frontend en modo desarrollo (Vite) |
| `npm run dev:server` | Solo backend en modo desarrollo (atajo a `server/`) |
| `npm run build` | `tsc -b` + build de producción del frontend |
| `npm run lint` | ESLint sobre `src/` |

| Comando (`server/`) | Qué hace |
|---|---|
| `npm run dev` | API en modo desarrollo (`tsx watch`) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm run start` | Arranca la API compilada (`dist/index.js`) |
| `npm run db:init` | Aplica `src/schema.sql` a la BBDD de `DATABASE_URL` |

### Variables de entorno

**Raíz** (`.env`, ver `.env.example`):

| Variable | Para qué |
|---|---|
| `VITE_API_URL` | URL base del backend (`http://localhost:3001` en local) |

**`server/.env`** (ver `server/.env.example`):

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Cadena de conexión a Postgres |
| `JWT_SECRET` | Firma de las cookies de sesión — cambiarlo cierra la sesión a todo el mundo |
| `CORS_ORIGIN` | Origen permitido para llamar a la API (el del frontend) |
| `APP_URL` | Usada para construir el link de "restablecer contraseña" en el email |
| `GROQ_API_KEY` / `GROQ_MODEL` | Generación de recetas y chat del chef |
| `GEMINI_API_KEY` / `GEMINI_MODEL_IMAGE` | Opcional — solo la foto del plato. Sin ella, la receta se genera igual, sin imagen |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Opcional — envío real de emails (bienvenida, reset de contraseña). Sin ellas, el email se loguea en consola en vez de enviarse |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | Opcional — login con Google. Credenciales de Google Cloud Console; `GOOGLE_REDIRECT_URI` debe coincidir exactamente con la que se da de alta ahí. Sin ellas, el botón de Google redirige con un error en vez de romper el resto del login |

### Ver la base de datos (Adminer)

Con `docker compose up -d` levantado, entra en **http://localhost:8081** y conecta con:

| Campo    | Valor    |
|----------|----------|
| Sistema  | PostgreSQL |
| Servidor | `postgres` |
| Usuario  | `sabora` |
| Contraseña | `sabora` |
| Base de datos | `sabora` |

(El puerto es 8081, no el 8080 habitual de Adminer, porque esta máquina ya tenía otro Adminer ocupándolo.)
Si prefieres un cliente de escritorio en vez del navegador, el mismo Postgres es accesible en `localhost:5434` con esas mismas credenciales (DBeaver, TablePlus, pgAdmin, etc.).

## Levantar todo con Docker

Para desarrollo normal **no hace falta esto** — `npm run dev` (con hot reload) en `server/` y en la raíz sigue siendo más rápido. Esto es para probar la app tal como correría en un servidor real, o para desplegarla.

`docker-compose.yml` incluye dos servicios más además de Postgres/Adminer:

- **`server`** — construye [`server/Dockerfile`](server/Dockerfile) (build de TypeScript a `dist/` + runtime con solo dependencias de producción) y publica la API en `http://localhost:3001`.
- **`web`** — construye [`Dockerfile`](Dockerfile) (build de Vite) y sirve el resultado estático con nginx en `http://localhost:8082`.

```bash
docker compose up -d --build      # levanta Postgres + Adminer + server + web
docker compose exec server npm run db:init:dist   # aplica el esquema (una vez, o tras cambiar schema.sql)
```

Luego entra en **http://localhost:8082**. El `server` necesita `server/.env` con las claves reales (`GROQ_API_KEY`, `JWT_SECRET`, etc. — ver la tabla de variables de entorno más arriba); `DATABASE_URL`, `CORS_ORIGIN` y `APP_URL` los sobreescribe el propio `docker-compose.yml` para que apunten a la red interna de Docker y al puerto publicado de `web`, así que no hace falta tocarlos ahí.

Para parar solo estos dos servicios y volver al flujo normal de `npm run dev` (dejando Postgres/Adminer corriendo): `docker compose stop server web`.

## Esquema de datos

Fuente de verdad: [`server/src/schema.sql`](server/src/schema.sql).

| Tabla | Para qué |
|---|---|
| `users` | Cuentas: email, hash de contraseña, username, avatar, `email_verified` |
| `password_reset_tokens` | Tokens de un solo uso para "olvidé mi contraseña" (hasheados, con caducidad) |
| `email_verification_tokens` | Tokens de un solo uso para verificar el email al registrarse (hasheados, caducan a las 24h) |
| `sessions` | Una fila por sesión activa (login). El JWT de la cookie referencia su id; revocarla (logout, cambio de contraseña) la invalida antes de que expire sola |
| `subscriptions` | Plan activo del usuario (`nipote` / `mamma` / `nonna`) |
| `user_profiles` | Preferencias del chef IA: alergias, ingredientes que no gustan, nivel de habilidad |
| `recipes` | Cabecera de cada receta generada (título, descripción, macros, imagen...) |
| `recipe_steps` | Pasos de una receta |
| `ingredients` / `recipe_ingredients` | Catálogo de ingredientes y su relación (con cantidad) con cada receta |
| `utensils` / `recipe_utensils` | Igual que ingredientes, para utensilios |

No hay ORM ni migraciones versionadas todavía: `schema.sql` usa `CREATE TABLE IF NOT EXISTS`, así que es seguro volver a ejecutar `npm run db:init`.

## API

Todas las rutas (salvo `/api/auth/signup`, `/login`, `/forgot-password`, `/reset-password`, `/verify-email`) exigen sesión — leen el JWT de la cookie `sabora_session` (`credentials: 'include'` en el fetch del frontend). Las rutas de `/api/recipes/*`, `/api/profile/*`, `/api/subscription/*` y `/api/ai/*` exigen además el email verificado (403 `EMAIL_NOT_VERIFIED` si no); solo las rutas de gestión de la propia cuenta (`me`, `logout`, `update-password`, `resend-verification`) siguen abiertas para un usuario sin verificar. `/signup`, `/login` y `/forgot-password` están limitadas a 8 intentos / 15 min por IP (cada una con su propio contador); `/reset-password`, `/verify-email` y `/resend-verification` a 20 / 15 min.

| Método | Ruta | Auth | Qué hace |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Crea cuenta + suscripción `nipote` gratis, inicia sesión, envía email de verificación |
| POST | `/api/auth/login` | — | Inicia sesión |
| POST | `/api/auth/logout` | ✔ | Revoca la sesión actual en BBDD y borra la cookie |
| GET | `/api/auth/me` | ✔ | Devuelve el usuario autenticado (restaura sesión al recargar) |
| PATCH | `/api/auth/me` | ✔ | Cambia el username |
| POST | `/api/auth/update-password` | ✔ | Cambia la contraseña; revoca todas las demás sesiones activas del usuario |
| POST | `/api/auth/forgot-password` | — | Envía email con link de recuperación (respuesta genérica siempre) |
| POST | `/api/auth/reset-password` | — | Cambia la contraseña con el token del email; revoca todas las sesiones del usuario |
| POST | `/api/auth/verify-email` | — | Marca el email como verificado con el token del email (un solo uso, caduca en 24h) |
| POST | `/api/auth/resend-verification` | ✔ | Reenvía el email de verificación si aún no está verificado |
| GET | `/api/auth/google` | — | Redirige al consentimiento de Google (navegación de página completa, no fetch) |
| GET | `/api/auth/google/callback` | — | Callback de Google: crea/enlaza la cuenta, inicia sesión, redirige a `/app` (o a `/auth?error=...`) |
| GET | `/api/recipes/recent` | ✔ + verificado | Últimas 3 recetas del usuario (Dashboard) |
| GET | `/api/recipes/history` | ✔ + verificado | Historial completo del usuario |
| GET | `/api/recipes/:id` | ✔ + verificado | Receta completa (pasos, ingredientes, utensilios) — 404 si no es tuya |
| POST | `/api/recipes` | ✔ + verificado | Guarda una receta generada (aplica el límite diario del plan gratis) |
| GET | `/api/profile/preferences` | ✔ + verificado | Preferencias del chef + si el plan es "pro" |
| PUT | `/api/profile/preferences` | ✔ + verificado | Guarda preferencias |
| GET | `/api/subscription` | ✔ + verificado | Plan activo |
| POST | `/api/subscription/toggle` | ✔ + verificado | **Demo**, sin pago real: activa/desactiva el plan Mamma |
| POST | `/api/ai/generate-recipe` | ✔ + verificado (+ Mamma/Nonna si `mode: 'pantry'`) | Genera una receta (Groq) |
| POST | `/api/ai/generate-image` | ✔ + verificado + Mamma/Nonna | Genera la foto del plato (Gemini, opcional) |
| POST | `/api/ai/chat` | ✔ + verificado + Mamma/Nonna | Chat del chef sobre una receta (Groq) |

## Notas de arquitectura

- **Sin Supabase**: la app usaba Supabase (auth + BBDD + Edge Functions) hasta que se migró a Postgres local + este backend propio. El código y los scripts SQL de esa época quedan en `archive/` solo como referencia — no se ejecutan.
- **Sesión**: JWT en cookie `httpOnly` + `SameSite=Lax`, nunca en `localStorage` (evita robo por XSS). El frontend nunca toca el token directamente. El JWT lleva además el id de una fila en la tabla `sessions` — `requireAuth` comprueba en cada request que esa sesión no esté revocada, así que se puede invalidar una sesión concreta (logout) o todas las de un usuario (cambio de contraseña, reset) sin esperar a que el JWT expire solo.
- **Verificación de email**: al registrarse se manda un email con un link de un solo uso (`/verify-email?token=...`, caduca en 24h). Hasta que se verifica, la cuenta no puede usar nada de la app: el backend devuelve 403 `EMAIL_NOT_VERIFIED` en `/api/recipes/*`, `/api/profile/*`, `/api/subscription/*` y `/api/ai/*` (middleware `requireVerifiedEmail`), y el frontend muestra una pantalla de bloqueo en cualquier ruta de `/app` en vez del contenido real (`ProtectedRoute` en `App.tsx` + `EmailVerificationGate.tsx`). Las rutas de gestión de la propia cuenta (`/me`, `/logout`, `/update-password`, `/resend-verification`) siguen abiertas para que el usuario pueda reenviar el email o cerrar sesión.
- **Rate limiting**: `express-rate-limit` en las rutas de auth más sensibles a fuerza bruta / abuso (login, signup, forgot-password, reset-password, verify-email). En memoria del proceso — se resetea si el backend se reinicia; suficiente para un solo proceso, no pensado para desplegar detrás de varias instancias sin un store compartido (Redis).
- **Validación de entrada**: todas las rutas que reciben body (`auth`, `recipes`, `profile`, `subscription`, `ai`) validan con `zod` (`server/src/lib/schemas.ts` + `server/src/lib/validate.ts`) — tipos, longitudes máximas y formatos antes de tocar la BBDD o llamar a la IA.
- **IA**: la clave de Groq/Gemini vive solo en `server/.env` — el frontend nunca ve una API key de IA, todo pasa por `/api/ai/*` con sesión y email verificado.
- **Apagado limpio**: el backend maneja `SIGTERM`/`SIGINT` (`server/src/index.ts`) — al recibirlos deja de aceptar conexiones nuevas, espera a que terminen las que ya estaban en curso, cierra el pool de Postgres y solo entonces sale (con un límite de 10s para no quedar colgado si algo no cierra). Importa sobre todo en Docker: `docker stop` manda `SIGTERM` y sin esto Node muere en seco a mitad de una request o con conexiones a Postgres abiertas.
- **Login con Google**: OAuth 2.0 implementado a mano (sin Passport ni ninguna librería — solo `fetch` contra los endpoints de Google en `server/src/lib/google.ts`), con `state` anti-CSRF en una cookie httpOnly propia. Si el email de Google coincide con una cuenta ya creada por contraseña, se enlaza esa cuenta (`google_id`) en vez de duplicarla, y se marca `email_verified = true` directamente (Google ya lo verificó). `password_hash` es `NULL` para cuentas que solo entraron por Google — el login por contraseña lo detecta y responde con el mismo error genérico. Se degrada solo (redirige con `?error=google_not_configured`) si `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` no están puestas.
- **Límites por plan, aplicados en el servidor**: los `limits.hasX` de `SubscriptionContext.tsx` (modo despensa, foto, chat) son solo para ocultar botones en la UI — la restricción real vive en `server/src/middleware/plan.ts` (`requirePlan(...planes)`) y en un chequeo puntual dentro de `POST /api/ai/generate-recipe` para el modo despensa. Llamar a esas rutas directamente sin pasar por la UI devuelve 403 `PLAN_REQUIRED` igual. El plan activo de un usuario se resuelve en un único sitio (`server/src/lib/subscription.ts`, `getActivePlan`/`getActiveSubscription`) — antes esa misma query vivía copiada en tres archivos de rutas distintos.
- **Fuera de alcance por ahora** (decisiones tomadas conscientemente, no descuidos): pasarela de pago real para los planes de pago, subida de avatar.
