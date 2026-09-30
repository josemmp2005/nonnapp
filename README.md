# Nonnapp

App de recetas con IA: describe qué tienes en la despensa (o qué te apetece) y genera una receta completa con foto, pasos y un chef de IA para resolver dudas mientras cocinas.

Este documento es la referencia **de código** (stack, arquitectura, cómo levantar el proyecto, API, esquema de datos). Para entender **qué hace la app** desde el punto de vista de un usuario, ver [`docs/FUNCIONAMIENTO.md`](docs/FUNCIONAMIENTO.md).

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + React Router. Textos en 4 idiomas con `react-i18next`.
- **Backend**: Node.js + Express + TypeScript, driver `pg` directo (sin ORM).
- **Base de datos**: PostgreSQL (local, vía Docker).
- **IA**: [Groq](https://groq.com) — texto de las recetas y chat del chef. No hay generación de imágenes.
- **Auth**: propia — email/password, JWT firmado por el servidor en una cookie `httpOnly`. No usa Supabase ni ningún proveedor externo.

## Estructura del repo

```
nonnapp/
  src/                    Frontend (Vite)
    components/           Páginas y componentes de React (ui/ = Button, Card, Input... reutilizables)
    context/               Theme, Toast, Subscription (React Context)
    i18n/                  Configuración de i18next + locales/{es,en,fr,pt}.json
    assets/                Imágenes; los fondos vienen en 4 variantes (pc/móvil x claro/oscuro), .webp
    services/
      api.ts                Wrapper fetch de bajo nivel (cookies, JSON, errores)
      auth.ts                Login/signup/logout/reset — llama a /api/auth/*
      data.ts                Recetas/preferencias/suscripción — llama al resto de /api/*
      ai.ts                   Llama a /api/ai/* (generar receta, chat)
    types.ts               Tipos compartidos del dominio (Recipe, UserProfile, ...)
  server/                 Backend (Express)
    src/
      index.ts              Punto de entrada, monta las rutas y el CORS
      db.ts                  Pool de Postgres + helper de transacciones
      schema.sql             Esquema canónico de la BBDD (fuente de verdad)
      env.ts                 Lectura/validación de variables de entorno
      app.ts                 App de Express (sin app.listen, para poder testearla con Supertest)
      middleware/auth.ts      Verifica el JWT de la cookie, exige sesión
      middleware/rateLimit.ts Límites por IP/usuario (express-rate-limit)
      middleware/sameOrigin.ts Defensa CSRF: rechaza escrituras cuyo Origin no sea el del frontend
      middleware/plan.ts      requirePlan(...): bloqueo por plan en el servidor
      lib/loginThrottle.ts    Bloqueo temporal del login por cuenta (tabla login_throttle)
      lib/groq.ts             Cliente HTTP a la API de Groq
      lib/mailer.ts           Envío de emails (Brevo, API HTTP)
      routes/                 Un archivo por área: auth, recipes, profile, subscription, ai
  docker-compose.yml      Postgres + Adminer (dev) + server/web (stack completo, ver más abajo)
  Dockerfile              Imagen del frontend (build Vite + nginx)
  server/Dockerfile        Imagen del backend (build TypeScript + runtime)
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
| `npm test` | Tests unitarios de `src/utils/` (Vitest, sin DOM/React rendering) |

| Comando (`server/`) | Qué hace |
|---|---|
| `npm run dev` | API en modo desarrollo (`tsx watch`) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm run start` | Arranca la API compilada (`dist/index.js`) |
| `npm run db:init` | Aplica `src/schema.sql` a la BBDD de `DATABASE_URL` |
| `npm test` | Tests de integración (Vitest + Supertest) contra una BBDD de test real |
| `npm run typecheck:test` | `tsc --noEmit` incluyendo `tests/` (el `build` normal no los cubre) |

### Documentación del código

Convención obligatoria: **todo archivo de código o configuración empieza con un comentario que explica qué hace** (1-3 líneas, en español), antes de los imports. Para leer el proyecto de un vistazo basta con abrir cada archivo y leer su cabecera. Formato por tipo: `/** */` en `.ts`/`.tsx`/`.js`, `/* */` en `.css`, `<!-- -->` en `.html` y `#` en `Dockerfile`, `.yml` y `nginx.conf`. Los formatos sin comentarios (`.json`, lockfiles) quedan fuera. Está recogido también en [`.claude/CLAUDE.md`](.claude/CLAUDE.md), que es lo que sigue el asistente al crear archivos nuevos.

### Tests

- **Backend** (`server/tests/`): tests de integración con Supertest contra la app de Express real (`server/src/app.ts`, sin necesidad de levantar el puerto) y una base de datos Postgres real — no se mockea `pg`, así que cubren de verdad el bloqueo por plan (`requirePlan`), el límite diario de Il Nipote, el aislamiento de recetas entre usuarios (IDOR), y los flujos de auth. Groq y Brevo sí se mockean (`vi.mock`) — nunca llaman a una API externa real.
  - Necesitan Postgres arrancado (`docker compose up -d` desde la raíz) y usan una base de datos separada de la de desarrollo: `sabora_test` (se crea sola la primera vez, ver `server/tests/globalSetup.ts`). Configuración en `server/.env.test` (sin secretos, seguro de commitear).
  - `cd server && npm test`
- **Frontend** (`src/utils/*.test.ts`): tests unitarios de lógica pura (rate limiter, caché) con Vitest. No hay tests de componentes React todavía — queda como mejora futura si se añade React Testing Library.
  - `npm test` (desde la raíz)

### CI

`.github/workflows/ci.yml` corre en cada push/PR: typecheck + lint + build + tests del frontend, y typecheck + build + tests del backend (con un Postgres de servicio real, no mockeado). El despliegue (Render/Netlify) sigue siendo aparte — cada uno redespliega solo al detectar un push a la rama que vigila, la CI de GitHub Actions no lo dispara ni lo bloquea todavía.

### Variables de entorno

**Raíz** (`.env`, ver `.env.example`):

| Variable | Para qué |
|---|---|
| `VITE_API_URL` | URL base del backend (`http://localhost:3001` en local) |

**`server/.env`** (ver `server/.env.example`):

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Cadena de conexión a Postgres |
| `DB_SSL` | `true` solo con un Postgres gestionado que exige TLS (Neon, Render...). El de docker-compose no lo soporta |
| `JWT_SECRET` | Firma de las cookies de sesión — cambiarlo cierra la sesión a todo el mundo |
| `CORS_ORIGIN` | Origen permitido para llamar a la API (el del frontend). Además de CORS, `middleware/sameOrigin.ts` rechaza con 403 cualquier `POST`/`PUT`/`PATCH`/`DELETE` cuyo header `Origin` no coincida exactamente con este valor (esquema + dominio, sin barra final) — solo se admite un origen, así que las URLs de *deploy preview* de Netlify (con hash propio) no pasan |
| `APP_URL` | URL del frontend a la que el servidor manda al usuario: redirect tras el login con Google y links de los emails (verificar, restablecer contraseña, bienvenida). Opcional: si falta se usa `CORS_ORIGIN`. En producción, un valor `localhost` se ignora a favor de `CORS_ORIGIN` (y se avisa en el log) |
| `GROQ_API_KEY` / `GROQ_MODEL` | Generación de recetas y chat del chef |
| `BREVO_API_KEY` / `BREVO_FROM` | Opcional — envío real de emails (verificación, bienvenida, reset de contraseña) vía [Brevo](https://brevo.com) (API HTTP, no SMTP — el SMTP saliente está bloqueado en el plan gratuito de Render y similares). `BREVO_FROM` debe ser un email verificado en Brevo (Senders, Domains & Dedicated IPs → Senders) — no hace falta dominio propio, y a diferencia de Resend permite mandar a cualquier destinatario en el plan gratuito. Sin `BREVO_API_KEY`, el email se loguea en consola en vez de enviarse |
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
```

El propio `server` aplica `schema.sql` solo al arrancar (es idempotente: `CREATE TABLE`/`ADD COLUMN IF NOT EXISTS`), así que no hace falta ningún paso manual — `docker compose exec server npm run db:init:dist` sigue existiendo por si quieres aplicar un cambio de esquema sin reiniciar el contenedor.

Luego entra en **http://localhost:8082**. El `server` necesita `server/.env` con las claves reales (`GROQ_API_KEY`, `JWT_SECRET`, etc. — ver la tabla de variables de entorno más arriba); `DATABASE_URL`, `CORS_ORIGIN` y `APP_URL` los sobreescribe el propio `docker-compose.yml` para que apunten a la red interna de Docker y al puerto publicado de `web`, así que no hace falta tocarlos ahí.

Para parar solo estos dos servicios y volver al flujo normal de `npm run dev` (dejando Postgres/Adminer corriendo): `docker compose stop server web`.

## Despliegue gratuito (Neon + Render + Netlify)

Frontend, backend y base de datos en tres servicios gratuitos. Backend y base de datos siempre viven en dominios distintos entre sí, pero el frontend y el backend **no tienen por qué ser cross-site para el navegador**: con el proxy de `public/_redirects` (paso 3 de abajo), Netlify reenvía `/api/*` al backend por detrás, así que el navegador solo ve un dominio — la cookie de sesión sigue siendo `SameSite=None; Secure` (gestionado por `isProd` en `server/src/routes/auth.ts`, no hay que tocar nada ahí), pero deja de ser "de terceros" para Safari/iOS, que si no la trata así y a veces la descarta (ver "Implementaciones futuras").

1. **Base de datos — [Neon](https://neon.tech)**: crea un proyecto (Postgres gratis, sin tarjeta). Copia la *connection string* que te da (incluye `?sslmode=require`).
2. **Backend — [Render](https://render.com)**: "New Web Service" → conecta el repo → Environment: **Docker** (usa [`server/Dockerfile`](server/Dockerfile) tal cual, sin cambios) → Root Directory: `server`. Variables de entorno (Render → el propio servicio → *Environment*):

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | La connection string de Neon |
   | `DB_SSL` | `true` |
   | `JWT_SECRET` | Genera uno: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `GROQ_API_KEY` / `GROQ_MODEL` | Tu clave de Groq |
   | `BREVO_API_KEY` / `BREVO_FROM` | Opcional — tu clave de Brevo y el remitente verificado, para que lleguen los emails de verdad (ver tabla de variables más abajo) |
   | `CORS_ORIGIN` / `APP_URL` | La URL de Netlify del paso 3 (se rellena después de crearla, y se vuelve a desplegar) |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Opcional — login con Google (ver [Login con Google en producción](#login-con-google-en-producción)) |
   | `GOOGLE_REDIRECT_URI` | Opcional en Render: si falta se deriva de `RENDER_EXTERNAL_URL` (que Render inyecta sola). Explícita sería `https://<tu-servicio>.onrender.com/api/auth/google/callback` |

   Render asigna su propio `PORT` (el servidor ya lo respeta vía `env.ts`) y expone la API en algo como `https://nonnapp-api.onrender.com`. El esquema de la BBDD se aplica solo al arrancar — no hace falta ningún paso manual. En el plan gratuito el servicio "duerme" tras 15 min sin tráfico y el primer request tras eso tarda ~30-50s en responder (arranque en frío) — normal, no es un fallo.

3. **Frontend — [Netlify](https://netlify.com)**: "Add new site" → importa el repo (Build command: `npm run build`, Publish directory: `dist`, se detecta solo por [`netlify.toml`](netlify.toml) si existe, o se rellena a mano). **No definas `VITE_API_URL`** (y si ya existiera de un despliegue anterior, bórrala del todo del panel de variables, no la dejes en blanco) — así las llamadas quedan relativas (`/api/...`) y las resuelve el proxy de [`public/_redirects`](public/_redirects) hacia el backend de Render, en vez de llamarlo cross-site directamente. [`public/_redirects`](public/_redirects) ya incluye ese proxy (`/api/*` → el backend) y el *fallback* de SPA para que React Router funcione en rutas como `/app/history` al recargar — actualiza en ese archivo la URL del backend si es distinta de `https://sabora.onrender.com`. Vite incrusta esto en el build en tiempo de compilación: si vienes de tener `VITE_API_URL` puesta y la borras, no basta con guardar el cambio — hay que volver a desplegar, y mejor con **"Trigger deploy" → "Clear cache and deploy site"** (una caché de build vieja puede reusar el bundle anterior con la URL antigua todavía incrustada).

   > Alternativa sin proxy: poniendo `VITE_API_URL` a la URL del backend (p.ej. `https://sabora.onrender.com`) el frontend lo llama directo, cross-site. Sigue funcionando, pero Safari/iOS trata esa cookie como "de terceros" y a veces la pierde (ver "Notas de arquitectura") — el proxy (no definir la variable) es la opción recomendada.
4. Vuelve a Render y actualiza `CORS_ORIGIN`/`APP_URL` con la URL real de Netlify, y redeploy el backend.

   > Este repo también incluye un [`vercel.json`](vercel.json) de un intento de despliegue anterior en Vercel — si el despliegue real es Netlify (como aquí), no hace falta y se puede borrar sin que afecte a nada.
   > **Si usas "Continuar con Google"**: con el proxy activo, `GOOGLE_REDIRECT_URI` debe apuntar al dominio de **Netlify**, no al de Render (`https://<tu-sitio>.netlify.app/api/auth/google/callback`), y esa es la URL que hay que registrar en Google Cloud Console — si el callback se queda en el dominio de Render, la cookie de esa sesión queda atada a Render y el navegador no la manda en las llamadas normales (que van al dominio de Netlify). Sin esta variable puesta explícita, se deriva de `RENDER_EXTERNAL_URL` (el dominio de Render), que ya NO es lo correcto con el proxy activo.

Login con Google y envío de emails son opcionales (ver tabla de variables más arriba) — se pueden dejar sin configurar para este primer despliegue sin romper nada más.

### Login con Google en producción

El error más típico es **`Error 400: redirect_uri_mismatch`**: la URL de retorno que envía nuestro backend a Google no coincide, carácter por carácter, con ninguna de las registradas en el cliente OAuth. Checklist:

1. **Google Cloud Console → APIs y servicios → Credenciales →** tu *ID de cliente de OAuth* (tipo *Aplicación web*).
2. En **"URI de redireccionamiento autorizados"** añade *exactamente* estas (mismo esquema `https`, mismo dominio de Render, sin barra final):
   - `https://<tu-servicio>.onrender.com/api/auth/google/callback` — producción
   - `http://localhost:3001/api/auth/google/callback` — desarrollo local
   
   Los "Orígenes autorizados de JavaScript" no hacen falta: el flujo es de servidor. Los cambios en Google pueden tardar unos minutos en aplicarse.
3. En Render define `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` y vuelve a desplegar. `GOOGLE_REDIRECT_URI` es opcional (se deriva de `RENDER_EXTERNAL_URL`); si la pones, que sea idéntica a la registrada en el paso 2.
4. Al arrancar, el backend escribe en el log `🔑 Login con Google activo — redirect_uri: …` con la URL **exacta** que envía (y avisa con un ⚠️ si en producción apunta a `localhost`). Esa es la que tiene que estar en Google.
5. Si sigue fallando: en la pantalla de error de Google → *"detalles del error"* → copia el `redirect_uri` que recibió y regístralo tal cual, o corrige `GOOGLE_REDIRECT_URI` para que coincida.
6. Con la pantalla de consentimiento en modo *Prueba*, solo pueden entrar las cuentas añadidas como *usuarios de prueba* (error distinto: `access_denied`).

**Tras loguear con Google vuelvo a `localhost`** — el login funciona pero el redirect final (y los links de los emails) apuntan a `APP_URL`, que por defecto es el frontend de desarrollo. En Render define `CORS_ORIGIN` con la URL real del frontend (p.ej. `https://nonnapp.vercel.app`, sin barra final): `APP_URL` la hereda si no la defines. El log de arranque muestra `🌐 Frontend — APP_URL: … | CORS_ORIGIN: …` para comprobar qué valores se están usando.

## Esquema de datos

Fuente de verdad: [`server/src/schema.sql`](server/src/schema.sql).

| Tabla | Para qué |
|---|---|
| `users` | Cuentas: email, hash de contraseña, username, avatar, `email_verified` |
| `password_reset_tokens` | Tokens de un solo uso para "olvidé mi contraseña" (hasheados, con caducidad) |
| `email_verification_tokens` | Tokens de un solo uso para verificar el email al registrarse (hasheados, caducan a las 24h) |
| `sessions` | Una fila por sesión activa (login). El JWT de la cookie referencia su id; revocarla (logout, cambio de contraseña) la invalida antes de que expire sola |
| `login_throttle` | Contador de fallos de login y `locked_until` por email normalizado. Sin FK a `users` a propósito: un email inexistente se bloquea igual que uno real (no delata qué cuentas existen). Se vacía con un login correcto o al restablecer la contraseña; las filas de más de 24 h se purgan solas |
| `subscriptions` | Plan activo del usuario (`nipote` / `mamma` / `nonna`) |
| `user_profiles` | Preferencias del chef IA: alergias, ingredientes que no gustan, nivel de habilidad |
| `recipes` | Cabecera de cada receta generada (título, descripción, macros, imagen...) |
| `recipe_steps` | Pasos de una receta |
| `ingredients` / `recipe_ingredients` | Catálogo de ingredientes y su relación (con cantidad) con cada receta |
| `utensils` / `recipe_utensils` | Igual que ingredientes, para utensilios |

No hay ORM ni migraciones versionadas todavía: `schema.sql` usa `CREATE TABLE IF NOT EXISTS`, así que es seguro volver a ejecutar `npm run db:init`.

## API

Todas las rutas (salvo `/api/auth/signup`, `/login`, `/forgot-password`, `/reset-password`, `/verify-email`) exigen sesión — leen el JWT de la cookie `nonnapp_session` (`credentials: 'include'` en el fetch del frontend). Las rutas de `/api/recipes/*`, `/api/profile/*`, `/api/subscription/*` y `/api/ai/*` exigen además el email verificado (403 `EMAIL_NOT_VERIFIED` si no); solo las rutas de gestión de la propia cuenta (`me`, `logout`, `update-password`, `resend-verification`) siguen abiertas para un usuario sin verificar. `/signup`, `/login` y `/forgot-password` están limitadas a 8 intentos / 15 min por IP (cada una con su propio contador); `/reset-password`, `/verify-email` y `/resend-verification` a 20 / 15 min; todo `/api` a 300 / 15 min por IP y `/api/ai/*` a 30 / 15 min por usuario. Además, `/login` bloquea la cuenta 15 min tras 5 fallos seguidos (429 con `Retry-After` y `retryAfterSeconds`) y `/forgot-password` no manda más de 3 emails por hora a una misma cuenta (la respuesta sigue siendo la genérica). Todas las peticiones que modifican estado deben venir del `Origin` del frontend (403 si no; las que no llevan `Origin`, como curl, pasan).

| Método | Ruta | Auth | Qué hace |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Crea cuenta + suscripción `nipote` gratis, inicia sesión, envía email de verificación |
| POST | `/api/auth/login` | — | Inicia sesión. Error genérico (401) tanto si el email no existe como si la contraseña falla; 429 si la cuenta está bloqueada |
| POST | `/api/auth/logout` | ✔ | Revoca la sesión actual en BBDD y borra la cookie |
| GET | `/api/auth/me` | ✔ | Devuelve el usuario autenticado (restaura sesión al recargar) |
| PATCH | `/api/auth/me` | ✔ | Cambia el username |
| POST | `/api/auth/update-password` | ✔ | Cambia la contraseña; revoca todas las demás sesiones activas del usuario |
| POST | `/api/auth/forgot-password` | — | Envía email con link de recuperación (respuesta genérica siempre) |
| POST | `/api/auth/reset-password` | — | Cambia la contraseña con el token del email; revoca todas las sesiones del usuario y desbloquea el login si estaba bloqueado |
| POST | `/api/auth/verify-email` | — | Marca el email como verificado con el token del email (un solo uso, caduca en 24h) |
| POST | `/api/auth/resend-verification` | ✔ | Reenvía el email de verificación si aún no está verificado |
| GET | `/api/auth/google` | — | Redirige al consentimiento de Google (navegación de página completa, no fetch) |
| GET | `/api/auth/google/callback` | — | Callback de Google: crea/enlaza la cuenta, inicia sesión, redirige a `/app` (o a `/auth?error=...`) |
| GET | `/api/recipes/recent` | ✔ + verificado | Últimas 3 recetas del usuario (Dashboard) |
| GET | `/api/recipes/history` | ✔ + verificado | Historial completo del usuario |
| GET | `/api/recipes/:id` | ✔ + verificado | Receta completa (pasos, ingredientes, utensilios) — 404 si no es tuya |
| POST | `/api/recipes` | ✔ + verificado | Guarda una receta generada (aplica el límite diario del plan gratis) |
| GET | `/api/profile/preferences` | ✔ + verificado | Preferencias del chef + si el plan es "pro" |
| PUT | `/api/profile/preferences` | ✔ + verificado (+ Mamma/Nonna si `allergies`/`disliked_ingredients` no van vacíos) | Guarda preferencias |
| GET | `/api/subscription` | ✔ + verificado | Plan activo |
| POST | `/api/subscription/change` | ✔ + verificado | **Desactivado (503 `SUBSCRIPTION_CHANGES_DISABLED`)** mientras `PLAN_CHANGES_ENABLED = false`. Cuando se active, es un endpoint de demo sin pago real: cambia el plan activo a `nipote`\|`mamma`\|`nonna` |
| POST | `/api/ai/generate-recipe` | ✔ + verificado (+ Mamma/Nonna si `mode: 'pantry'`) | Genera una receta (Groq) |
| POST | `/api/ai/chat` | ✔ + verificado + Nonna | Chat del chef sobre una receta (Groq) |

## Notas de arquitectura

- **Sin Supabase**: la app usaba Supabase (auth + BBDD + Edge Functions) hasta que se migró a Postgres local + este backend propio. El código y los scripts SQL de esa época (Edge Functions, políticas RLS) se eliminaron del repo; siguen en el historial de git por si hiciera falta consultarlos.
- **Sesión**: JWT en cookie `httpOnly` (`Secure` + `SameSite=None` en producción — ver más abajo por qué sigue siendo `None` aunque haya proxy; `Lax` en local), nunca en `localStorage` (evita robo por XSS). `localStorage` solo guarda cosas no sensibles: tema (`nonnapp_theme`), idioma (`nonnapp_lang`), contador diario de recetas y el cooldown de reenvío de verificación. El frontend nunca toca el token directamente. El JWT lleva además el id de una fila en la tabla `sessions` — `requireAuth` comprueba en cada request que esa sesión no esté revocada, así que se puede invalidar una sesión concreta (logout) o todas las de un usuario (cambio de contraseña, reset) sin esperar a que el JWT expire solo.
- **Cookie de sesión fiable en Safari/iOS**: se reportó que en iPhone/iPad (Safari y la app instalada) la cuenta a veces se veía con el plan gratis debiendo ser de pago, mientras que en Windows/Android iba bien con la misma cuenta. Causa: frontend y backend en dominios distintos hace la cookie `SameSite=None; Secure` cross-site, y Safari bloquea las cookies de terceros por defecto desde la versión 13.1 (ITP) — a veces de forma intermitente, no solo un bloqueo total. Dos arreglos, los dos ya aplicados en el código:
  1. **Proxy same-origin** (el de raíz): [`public/_redirects`](public/_redirects) reenvía `/api/*` a Render por detrás de Netlify, así que el navegador solo ve un dominio y la cookie deja de ser "de terceros" — comprobado en producción: la respuesta proxied trae `Set-Cookie: ...HttpOnly; Secure; SameSite=None` intacta, sin `Domain` explícito (así que el navegador la ata al dominio de Netlify, no al de Render). `services/api.ts` resuelve `API_URL` a `''` (rutas relativas) en producción **por defecto**, sin que haga falta definir ni tocar ninguna variable en Netlify — a propósito: una versión anterior de este mismo archivo pedía poner `VITE_API_URL` vacía a mano, y ese despliegue se quedó con el valor antiguo (la URL de Render) porque nunca llegó a construirse de nuevo con la variable realmente vacía; depender de que un panel de terceros guarde bien un valor en blanco era frágil. Ahora "no definir la variable" es el modo recomendado y además el que ya pasaba por defecto. Solo hay que definir `VITE_API_URL` (a la URL del backend) para el caso contrario: llamarlo directo, sin proxy. No hace falta tocar `sameSite`/`secure` del backend: `None` sigue funcionando igual en same-origin (es un superconjunto de `Lax`). Pendiente si se activa login con Google: su `redirect_uri` tiene que apuntar también al dominio de Netlify, no al de Render (ver despliegue más abajo), o su cookie queda atada al dominio equivocado.
  2. **Mitigación en el cliente** (independiente de la anterior, por si algún dominio no puede ponerse detrás de un proxy): `SubscriptionContext.tsx` ya no daba por hecho el plan gratis ante cualquier fallo de `/api/subscription` — antes un solo tropiezo de red (p. ej. esa cookie perdida) se veía como "mi cuenta ha bajado de plan". Ahora reintenta una vez y, si sigue fallando, mantiene el plan ya conocido en vez de sustituirlo (`src/utils/subscriptionRetry.ts`, con sus tests).
- **Verificación de email**: al registrarse se manda un email con un link de un solo uso (`/verify-email?token=...`, caduca en 24h). Hasta que se verifica, la cuenta no puede usar nada de la app: el backend devuelve 403 `EMAIL_NOT_VERIFIED` en `/api/recipes/*`, `/api/profile/*`, `/api/subscription/*` y `/api/ai/*` (middleware `requireVerifiedEmail`), y el frontend muestra una pantalla de bloqueo en cualquier ruta de `/app` en vez del contenido real (`ProtectedRoute` en `App.tsx` + `EmailVerificationGate.tsx`). Las rutas de gestión de la propia cuenta (`/me`, `/logout`, `/update-password`, `/resend-verification`) siguen abiertas para que el usuario pueda reenviar el email o cerrar sesión.
- **Rate limiting, en dos capas**:
  - *Por IP* (`express-rate-limit`, `middleware/rateLimit.ts`): login, signup, forgot-password, reset-password, verify-email, resend-verification, un backstop general en `/api` y otro por usuario en `/api/ai/*` (cada llamada cuesta dinero en Groq). Vive en memoria del proceso — se resetea si el backend se reinicia; suficiente para una sola instancia, no pensado para varias sin un store compartido (Redis). Se desactiva solo con `NODE_ENV=test`. En producción, `trust proxy` está activo para contar la IP real del cliente y no la del proxy de Render.
  - *Por cuenta* (`lib/loginThrottle.ts`, en Postgres, sobrevive a reinicios): el límite por IP no frena a quien reparte los intentos entre muchas IPs contra un mismo email. 5 fallos de login seguidos (ventana de 15 min) bloquean ese email 15 min; el bloqueo se comprueba antes de tocar `users` ni bcrypt. Contrapartida conocida: alguien puede bloquearle la cuenta a otra persona a propósito; se suaviza con el bloqueo corto y con que restablecer la contraseña por email lo levanta.
- **Login sin filtrar qué emails existen**: error 401 genérico, y `bcrypt.compare` se ejecuta siempre (contra un hash de relleno de coste 12 si el email no existe o la cuenta es solo-Google), para que el tiempo de respuesta tampoco delate qué cuentas están registradas. `/forgot-password` responde siempre igual. Queda una excepción asumida: `/signup` devuelve 409 si el email ya existe.
- **CSRF**: la cookie de sesión es `SameSite=None` en producción, así que el navegador la adjunta también a peticiones lanzadas desde otros sitios. CORS por sí solo no cubre los `POST`/`DELETE` sin body JSON (p. ej. `/logout`), que un `<form>` externo enviaría sin preflight. `middleware/sameOrigin.ts` comprueba el header `Origin` de toda petición que modifica estado y responde 403 si no es el del frontend (`CORS_ORIGIN`); sin `Origin` (curl, servidor a servidor) se deja pasar, porque esos clientes no llevan la cookie de la víctima.
- **Idiomas (i18n)**: español (por defecto), inglés, francés y portugués con `react-i18next`; los textos viven en `src/i18n/locales/*.json`. El idioma se detecta de `localStorage` (`nonnapp_lang`) y luego del navegador. El selector con banderas está en la cabecera pública y en Editar perfil. Los mensajes de error que devuelve el backend siguen en español (sin traducir).
- **Tema claro/oscuro y fondos**: `ThemeContext` pone/quita la clase `dark` en `<html>`. Los fondos de la landing (hero), `/auth` y la app autenticada (dashboard) tienen variantes pc/móvil x claro/oscuro; la variante se elige en JS según el tema (así solo se descarga la que hace falta) y en `/auth` y en la app la imagen entra con un fundido al terminar de cargar (también al cambiar de tema; el hero de la landing solo hace el fundido al montarse, así que al cambiar de tema con la landing abierta la foto cambia de golpe). Al pasar de fuera a `/app` (login o landing) el contenedor de la app entra con un fundido + subida corta; navegar entre páginas de dentro no repite la animación.
- **Validación de entrada**: todas las rutas que reciben body (`auth`, `recipes`, `profile`, `subscription`, `ai`) validan con `zod` (`server/src/lib/schemas.ts` + `server/src/lib/validate.ts`) — tipos, longitudes máximas y formatos antes de tocar la BBDD o llamar a la IA.
- **IA**: la clave de Groq vive solo en `server/.env` — el frontend nunca ve una API key de IA, todo pasa por `/api/ai/*` con sesión y email verificado. No hay generación de imágenes (se usó Gemini para eso hasta que se quitó del todo).
- **Apagado limpio**: el backend maneja `SIGTERM`/`SIGINT` (`server/src/index.ts`) — al recibirlos deja de aceptar conexiones nuevas, espera a que terminen las que ya estaban en curso, cierra el pool de Postgres y solo entonces sale (con un límite de 10s para no quedar colgado si algo no cierra). Importa sobre todo en Docker: `docker stop` manda `SIGTERM` y sin esto Node muere en seco a mitad de una request o con conexiones a Postgres abiertas.
- **Login con Google**: OAuth 2.0 implementado a mano (sin Passport ni ninguna librería — solo `fetch` contra los endpoints de Google en `server/src/lib/google.ts`), con `state` anti-CSRF en una cookie httpOnly propia. Si el email de Google coincide con una cuenta ya creada por contraseña, se enlaza esa cuenta (`google_id`) en vez de duplicarla, y se marca `email_verified = true` directamente (Google ya lo verificó). `password_hash` es `NULL` para cuentas que solo entraron por Google — el login por contraseña lo detecta y responde con el mismo error genérico. Se degrada solo (redirige con `?error=google_not_configured`) si `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` no están puestas.
- **Límites por plan, aplicados en el servidor**: los `limits.hasX` de `SubscriptionContext.tsx` (modo despensa, foto, chat, preferencias del chef) son solo para ocultar botones/secciones en la UI — la restricción real vive en `server/src/middleware/plan.ts` (`requirePlan(...planes)`), en un chequeo puntual dentro de `POST /api/ai/generate-recipe` para el modo despensa, y en `PUT /api/profile/preferences` para alergias/ingredientes. Llamar a esas rutas directamente sin pasar por la UI devuelve 403 `PLAN_REQUIRED` igual. El plan activo de un usuario se resuelve en un único sitio (`server/src/lib/subscription.ts`, `getActivePlan`/`getActiveSubscription`) — antes esa misma query vivía copiada en tres archivos de rutas distintos.
- **Alergias/ingredientes no deseados nunca se leen del cliente**: `POST /api/ai/generate-recipe` los saca de `user_profiles` en BBDD usando `req.userId`, no de un `userProfile` mandado en el body (ese campo se quitó del schema). Es a propósito — el estado de React de la página de Preferencias cambia con cada tecla, se guarde o no, así que confiar en lo que mande el cliente habría dejado sin efecto el bloqueo de `PUT /preferences` para Il Nipote. Si el plan activo es `nipote`, tanto `GET /preferences` como la generación fuerzan esos campos a vacío aunque hubiera datos guardados de un plan de pago anterior.
- **Recetario propio**: `POST /api/recipes/manual` guarda una receta escrita a mano, sin pasar por Groq. `saveRecipe` (`server/src/lib/recipes.ts`) toma un parámetro `source: 'ai' | 'manual'` — con `'manual'` se salta el chequeo del límite diario de IA y se inserta con `is_ai_generated=false, source_origin='manual'` (con `'ai'`, exactamente el mismo comportamiento que antes). El chequeo del límite diario de Il Nipote filtra explícitamente por `is_ai_generated = true`: antes de esto, una receta propia contaba contra el cupo de 2 recetas de IA al día sin haber llamado a Groq ni una vez (lo detectó el propio test al escribirlo, no una revisión manual). El formulario (`saveManualRecipeSchema`) exige al menos un ingrediente y un paso — a diferencia del de la IA, donde nunca faltan porque los pone Groq.
  - **Gated por plan** (escalón de planes, no de coste): la ruta monta `requirePlan('mamma', 'nonna')` antes de nada, así que Il Nipote recibe 403 `PLAN_REQUIRED` sin llegar a `saveRecipe`. Dentro de `saveRecipe`, si el plan es `'mamma'` se cuentan sus recetas propias totales (`is_ai_generated = false`, sin ventana de fecha — es un tope acumulado, no diario) y a partir de 5 se lanza `OwnRecipeLimitExceededError` → 403 `OWN_RECIPE_LIMIT_EXCEEDED` con el `limit` en el body; `'nonna'` no tiene tope. El frontend (`SubscriptionContext.tsx`, campo `maxOwnRecipes`) repite el mismo límite solo para pintar la interfaz (botón oculto, aviso de tope, pantalla de candado en `/app/recipes/new` si se entra por URL directa) — la autoridad real es el servidor.
- **Fuera de alcance por ahora** (decisiones tomadas conscientemente, no descuidos): ver [Implementaciones futuras](#implementaciones-futuras).

## Escalabilidad

Hoy la app corre en una sola instancia de Render (free) + una base de datos Neon (free) + Groq como IA — de sobra para el tráfico actual. Esto es lo que pone techo a crecer sin cambiar nada, de más a menos grave. Es un análisis, no una lista de tareas: nada de esto está roto hoy.

1. **La cuota de Groq es una sola, compartida por todos los usuarios.** `server/src/middleware/rateLimit.ts` (`createAiRateLimiter`) limita las llamadas por usuario para que ninguno agote la cuota él solo, pero el techo total de peticiones/minuto lo pone Groq a nivel de cuenta, no de usuario. El único amortiguador es un espaciador de 5s **en el navegador de cada pestaña** (`src/utils/rateLimiter.ts`), que no coordina entre usuarios ni dispositivos. Con varios usuarios generando a la vez, empiezan los 429 de Groq antes de que el servidor lo prevea. Antes de crecer en usuarios concurrentes generando recetas, hace falta backpressure o cola en el propio backend (o repartir entre varias claves), no solo el límite por usuario que ya existe.
2. **Los limitadores de frecuencia viven en memoria del proceso** (mismo archivo; ya advertido en "Notas de arquitectura": "no pensado para varias [instancias] sin un store compartido (Redis)"). Con más de una instancia de Render, cada una cuenta por su cuenta: el límite real pasa a ser (el configurado × nº de instancias) sin que nadie lo note. No rompe nada de forma visible, pero deja de proteger justo cuando hay más tráfico que proteger. Solución conocida: mover el store a Redis (`express-rate-limit` lo soporta con `rate-limit-redis`) antes de escalar horizontalmente.
3. **Cada petición autenticada consulta Postgres.** `server/src/middleware/auth.ts` (`loadSession`) hace un `JOIN` a `users` en cada request para poder revocar sesiones al instante — correcto para seguridad (ver "Notas de arquitectura"), pero significa que el tráfico de la API escala 1:1 con conexiones a la base de datos, sin caché de sesión de por medio. Con el pool de `pg` sin `max` explícito (`server/src/db.ts` → 10 conexiones/instancia por defecto) y el plan gratuito de Neon, esto es lo primero que se agota si el tráfico sube de golpe.
4. **Render gratis duerme a los 15 min sin tráfico** (ver "Despliegue gratuito" más arriba): la primera petición tras dormir tarda 30-50s. Vale para una demo o mientras no haya usuarios recurrentes; no vale si se espera tráfico real y constante.
5. **El email de verificación bloquea la respuesta del signup.** `server/src/routes/auth.ts:85` hace `await sendMail(...)` (llamada HTTP a Brevo) dentro del ciclo de la petición; si Brevo va lento, el registro se hace lento con él. El email de bienvenida (línea ~133) ya es fire-and-forget (sin `await`, con `.catch`); el de verificación no sigue ese mismo patrón.
6. **Las fotos de receta son enlaces directos a Unsplash** (`server/src/lib/recipeImages.ts`) — sin coste de almacenamiento propio, pero sin SLA: los enlaces se retiran con el tiempo (ya ha pasado, ver el `404` corregido en `src/data/chefTableContent.ts`). Escala en coste, no en fiabilidad.

Orden sugerido si el tráfico crece: (1) y (2) antes de pensar en más de una instancia o más generación simultánea; (3) y (4) si el tráfico sostenido (no solo picos) crece; (5) y (6) son baratos de arreglar en cualquier momento, no dependen de que crezca nada.

## Implementaciones futuras

Lista de trabajo actual, con el punto de partida técnico de cada una. La versión para usuarios está en [`docs/FUNCIONAMIENTO.md`](docs/FUNCIONAMIENTO.md#implementaciones-futuras).

| Pendiente | Estado y por dónde empezar |
|---|---|
| **Pasarela de pago** | Necesaria para poder cambiar de plan. Hoy el cambio está apagado con `PLAN_CHANGES_ENABLED = false` **en dos sitios** (`server/src/routes/subscription.ts`, que responde 503, y `src/components/PreferencesPage.tsx`, que muestra `PlanChangeDisabledNotice` en vez de `PlanCheckoutModal`). El modal de pago actual es una simulación y `POST /api/subscription/change` no valida ningún cobro. Lo correcto: integrar un proveedor (p. ej. Stripe Checkout), y que el plan solo cambie desde el webhook que confirma el pago, no desde una llamada del cliente. Mientras tanto, las cuentas nuevas quedan en `nipote` y no pueden acceder a los planes de pago |
| **Planificador semanal** | Construido pero apagado: backend `server/src/routes/planner.ts` (`GET /api/planner`, `PUT /api/planner/slot`, `GET /api/planner/shopping-list`; tabla `weekly_plan_items`, solo plan Nonna) y pantalla `src/components/PlannerPage.tsx`. Se activa poniendo `PLANNER_ENABLED = true` **en los dos archivos** (mientras esté a `false` el servidor responde 503 `PLANNER_NOT_AVAILABLE`). Falta el pulido visual y anunciarlo |
| **Panel para el administrador** | No existe: `users` no tiene campo de rol ni hay rutas/pantallas de administración. Haría falta una columna de rol, un middleware `requireAdmin` junto a `requireAuth` y las pantallas en el frontend |
| **Avatar de usuario** | `users.avatar_url` ya existe (las cuentas de Google lo rellenan) y se muestra en `Sidebar` y `ProfileEditPage`; falta la subida. Hay que decidir dónde guardar los ficheros: el disco del plan gratuito de Render no es persistente, así que haría falta almacenamiento externo |
| **Botón de cancelar receta** | Hoy `POST /api/ai/generate-recipe` no se puede abortar desde la interfaz: ni `services/api.ts` usa `AbortController` ni `LoadingOverlay` tiene botón de cancelar. Habría que pasar una `signal` al `fetch` y añadir el botón al overlay |
| **Más imágenes** | Las fotos de receta salen de un banco curado de Unsplash en `server/src/lib/recipeImages.ts` (elegida por palabras clave; la cabecera del fichero explica cómo ampliarlo y `tests/recipeImages.test.ts` valida el formato, no que las URLs sigan vivas) |
| **2FA** | Sin implementar por decisión propia. Natural: TOTP sobre el flujo de `/login` (secreto cifrado por usuario, códigos de recuperación y un paso extra tras la contraseña) |
| Otras | Persistencia del chat del chef y de la lista de la compra, mostrar en el login los segundos que faltan del bloqueo por intentos (el servidor ya manda `retryAfterSeconds`), traducir los errores del servidor |

## Licencia

El código está publicado para que se pueda leer y aprender de él, bajo la [PolyForm Noncommercial License 1.0.0](LICENSE): se puede usar, copiar y modificar para fines **no comerciales** (aprendizaje, investigación, proyectos personales), pero no para explotarlo comercialmente. No es una licencia open source en sentido estricto (la OSI no admite restringir el uso comercial), a propósito: deja abierta la posibilidad de monetizar Nonnapp más adelante. Las ilustraciones, la mascota y el resto de la marca Nonnapp se incluyen bajo esos mismos términos. Para otros usos, contacta con el autor.
