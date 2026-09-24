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
sabora-app/
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
| `npm test` | Tests unitarios de `src/utils/` (Vitest, sin DOM/React rendering) |

| Comando (`server/`) | Qué hace |
|---|---|
| `npm run dev` | API en modo desarrollo (`tsx watch`) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm run start` | Arranca la API compilada (`dist/index.js`) |
| `npm run db:init` | Aplica `src/schema.sql` a la BBDD de `DATABASE_URL` |
| `npm test` | Tests de integración (Vitest + Supertest) contra una BBDD de test real |
| `npm run typecheck:test` | `tsc --noEmit` incluyendo `tests/` (el `build` normal no los cubre) |

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
| `CORS_ORIGIN` | Origen permitido para llamar a la API (el del frontend). Además de CORS, `middleware/sameOrigin.ts` rechaza con 403 cualquier `POST`/`PUT`/`PATCH`/`DELETE` cuyo header `Origin` no coincida exactamente con este valor (esquema + dominio, sin barra final) — solo se admite un origen, así que las URLs de preview de Vercel no pasan |
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

## Despliegue gratuito (Neon + Render + Vercel)

Frontend, backend y base de datos en tres servicios gratuitos, cada uno con su dominio propio (por eso frontend y backend son **cross-site**: la cookie de sesión necesita `SameSite=None; Secure`, ya gestionado automáticamente por `isProd` en `server/src/routes/auth.ts` — no hay que tocar nada ahí).

1. **Base de datos — [Neon](https://neon.tech)**: crea un proyecto (Postgres gratis, sin tarjeta). Copia la *connection string* que te da (incluye `?sslmode=require`).
2. **Backend — [Render](https://render.com)**: "New Web Service" → conecta el repo → Environment: **Docker** (usa [`server/Dockerfile`](server/Dockerfile) tal cual, sin cambios) → Root Directory: `server`. Variables de entorno (Render → el propio servicio → *Environment*):

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | La connection string de Neon |
   | `DB_SSL` | `true` |
   | `JWT_SECRET` | Genera uno: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `GROQ_API_KEY` / `GROQ_MODEL` | Tu clave de Groq |
   | `BREVO_API_KEY` / `BREVO_FROM` | Opcional — tu clave de Brevo y el remitente verificado, para que lleguen los emails de verdad (ver tabla de variables más abajo) |
   | `CORS_ORIGIN` / `APP_URL` | La URL de Vercel del paso 3 (se rellena después de crearla, y se vuelve a desplegar) |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Opcional — login con Google (ver [Login con Google en producción](#login-con-google-en-producción)) |
   | `GOOGLE_REDIRECT_URI` | Opcional en Render: si falta se deriva de `RENDER_EXTERNAL_URL` (que Render inyecta sola). Explícita sería `https://<tu-servicio>.onrender.com/api/auth/google/callback` |

   Render asigna su propio `PORT` (el servidor ya lo respeta vía `env.ts`) y expone la API en algo como `https://sabora-api.onrender.com`. El esquema de la BBDD se aplica solo al arrancar — no hace falta ningún paso manual. En el plan gratuito el servicio "duerme" tras 15 min sin tráfico y el primer request tras eso tarda ~30-50s en responder (arranque en frío) — normal, no es un fallo.

3. **Frontend — [Vercel](https://vercel.com)**: "Add New Project" → importa el repo (Root Directory: la raíz, Framework: Vite, se detecta solo). Variable de entorno: `VITE_API_URL` = la URL de Render del paso 2. [`vercel.json`](vercel.json) ya incluye el rewrite para que React Router funcione en rutas como `/app/history` al recargar. Vite incrusta `VITE_API_URL` en el build, así que si cambia hay que volver a desplegar (no basta con cambiar la variable).
4. Vuelve a Render y actualiza `CORS_ORIGIN`/`APP_URL` con la URL real de Vercel, y redeploy el backend.

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

Todas las rutas (salvo `/api/auth/signup`, `/login`, `/forgot-password`, `/reset-password`, `/verify-email`) exigen sesión — leen el JWT de la cookie `sabora_session` (`credentials: 'include'` en el fetch del frontend). Las rutas de `/api/recipes/*`, `/api/profile/*`, `/api/subscription/*` y `/api/ai/*` exigen además el email verificado (403 `EMAIL_NOT_VERIFIED` si no); solo las rutas de gestión de la propia cuenta (`me`, `logout`, `update-password`, `resend-verification`) siguen abiertas para un usuario sin verificar. `/signup`, `/login` y `/forgot-password` están limitadas a 8 intentos / 15 min por IP (cada una con su propio contador); `/reset-password`, `/verify-email` y `/resend-verification` a 20 / 15 min; todo `/api` a 300 / 15 min por IP y `/api/ai/*` a 30 / 15 min por usuario. Además, `/login` bloquea la cuenta 15 min tras 5 fallos seguidos (429 con `Retry-After` y `retryAfterSeconds`) y `/forgot-password` no manda más de 3 emails por hora a una misma cuenta (la respuesta sigue siendo la genérica). Todas las peticiones que modifican estado deben venir del `Origin` del frontend (403 si no; las que no llevan `Origin`, como curl, pasan).

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
| POST | `/api/subscription/change` | ✔ + verificado | **Demo**, sin pago real: cambia el plan activo a `nipote`\|`mamma`\|`nonna` |
| POST | `/api/ai/generate-recipe` | ✔ + verificado (+ Mamma/Nonna si `mode: 'pantry'`) | Genera una receta (Groq) |
| POST | `/api/ai/chat` | ✔ + verificado + Nonna | Chat del chef sobre una receta (Groq) |

## Notas de arquitectura

- **Sin Supabase**: la app usaba Supabase (auth + BBDD + Edge Functions) hasta que se migró a Postgres local + este backend propio. El código y los scripts SQL de esa época quedan en `archive/` solo como referencia — no se ejecutan.
- **Sesión**: JWT en cookie `httpOnly` (`Secure` + `SameSite=None` en producción porque frontend y backend son cross-site; `Lax` en local), nunca en `localStorage` (evita robo por XSS). `localStorage` solo guarda cosas no sensibles: tema (`sabora_theme`), idioma (`nonnapp_lang`), contador diario de recetas y el cooldown de reenvío de verificación. El frontend nunca toca el token directamente. El JWT lleva además el id de una fila en la tabla `sessions` — `requireAuth` comprueba en cada request que esa sesión no esté revocada, así que se puede invalidar una sesión concreta (logout) o todas las de un usuario (cambio de contraseña, reset) sin esperar a que el JWT expire solo.
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
- **Fuera de alcance por ahora** (decisiones tomadas conscientemente, no descuidos): ver [Implementaciones futuras](#implementaciones-futuras).

## Implementaciones futuras

Lista de trabajo actual, con el punto de partida técnico de cada una. La versión para usuarios está en [`docs/FUNCIONAMIENTO.md`](docs/FUNCIONAMIENTO.md#implementaciones-futuras).

| Pendiente | Estado y por dónde empezar |
|---|---|
| **Planificador semanal** | Construido pero apagado: backend `server/src/routes/planner.ts` (`GET /api/planner`, `PUT /api/planner/slot`, `GET /api/planner/shopping-list`; tabla `weekly_plan_items`, solo plan Nonna) y pantalla `src/components/PlannerPage.tsx`. Se activa poniendo `PLANNER_ENABLED = true` **en los dos archivos** (mientras esté a `false` el servidor responde 503 `PLANNER_NOT_AVAILABLE`). Falta el pulido visual y anunciarlo |
| **Panel para el administrador** | No existe: `users` no tiene campo de rol ni hay rutas/pantallas de administración. Haría falta una columna de rol, un middleware `requireAdmin` junto a `requireAuth` y las pantallas en el frontend |
| **Avatar de usuario** | `users.avatar_url` ya existe (las cuentas de Google lo rellenan) y se muestra en `Sidebar` y `ProfileEditPage`; falta la subida. Hay que decidir dónde guardar los ficheros: el disco del plan gratuito de Render no es persistente, así que haría falta almacenamiento externo |
| **Botón de cancelar receta** | Hoy `POST /api/ai/generate-recipe` no se puede abortar desde la interfaz: ni `services/api.ts` usa `AbortController` ni `LoadingOverlay` tiene botón de cancelar. Habría que pasar una `signal` al `fetch` y añadir el botón al overlay |
| **Más imágenes** | Las fotos de receta salen de un banco curado de Unsplash en `server/src/lib/recipeImages.ts` (elegida por palabras clave; la cabecera del fichero explica cómo ampliarlo y `tests/recipeImages.test.ts` valida el formato, no que las URLs sigan vivas) |
| **2FA** | Sin implementar por decisión propia. Natural: TOTP sobre el flujo de `/login` (secreto cifrado por usuario, códigos de recuperación y un paso extra tras la contraseña) |
| Otras | Pago real de los planes (hoy simulado, `POST /api/subscription/change`), persistencia del chat del chef y de la lista de la compra, mostrar en el login los segundos que faltan del bloqueo por intentos (el servidor ya manda `retryAfterSeconds`), traducir los errores del servidor |

## Licencia

El código está publicado para que se pueda leer y aprender de él, bajo la [PolyForm Noncommercial License 1.0.0](LICENSE): se puede usar, copiar y modificar para fines **no comerciales** (aprendizaje, investigación, proyectos personales), pero no para explotarlo comercialmente. No es una licencia open source en sentido estricto (la OSI no admite restringir el uso comercial), a propósito: deja abierta la posibilidad de monetizar Nonnapp más adelante. Las ilustraciones, la mascota y el resto de la marca Nonnapp se incluyen bajo esos mismos términos. Para otros usos, contacta con el autor.
