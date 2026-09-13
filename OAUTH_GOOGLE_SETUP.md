# 🔐 Configuración OAuth Google - Guía Completa

## ✅ Paso 1: Google Cloud Console

### 1. Crear/Seleccionar Proyecto
1. Ve a https://console.cloud.google.com
2. Crea un proyecto nuevo llamado "Sabora" o selecciona uno existente

### 2. Configurar OAuth Consent Screen
1. Ve a **APIs & Services** → **OAuth consent screen**
2. Selecciona **External** como User Type
3. Completa el formulario:
   - **App name:** Sabora (o nonnapp) ⭐ **Esto es lo que verá el usuario**
   - **User support email:** tu-email@example.com
   - **App logo:** (opcional, sube el logo de Sabora para que aparezca en lugar de un ícono genérico)
   - **App domain - Application home page:** `http://localhost:5173` (temporalmente) o tu dominio cuando lo tengas
   - **App domain - Application privacy policy link:** `http://localhost:5173/privacy`
   - **App domain - Application terms of service link:** `http://localhost:5173/terms`
   - **Authorized domains:** (déjalo vacío por ahora, añadirás tu dominio en producción)
   - **Developer contact:** tu-email@example.com
4. Click **Save and Continue**
5. En **Scopes**, click **Add or Remove Scopes**:
   - Selecciona: `email`, `profile`, `openid`
   - Click **Update** → **Save and Continue**
6. En **Test users** (opcional), añade emails de prueba
7. Click **Save and Continue** → **Back to Dashboard**

### 3. Crear OAuth Client ID
1. Ve a **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configuración:
   - **Application type:** Web application
   - **Name:** Sabora Web Client
   
4. **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:3000
   https://tu-dominio.com (cuando lo tengas)
   ```

5. **Authorized redirect URIs:**
   ```
   https://qcwoaqebszgwigofsapc.supabase.co/auth/v1/callback
   ```
   ⚠️ **IMPORTANTE:** Reemplaza `qcwoaqebszgwigofsapc` con tu **Project URL** de Supabase
   
   Para encontrarlo:
   - Ve a tu proyecto en Supabase
   - Settings → API
   - Copia el **Project URL** (ej: `https://tuproyecto.supabase.co`)
   - La URL de callback es: `TU_PROJECT_URL/auth/v1/callback`

6. Click **Create**
7. **Guarda estos datos:**
   - ✅ Client ID: `123456789-abcdefg.apps.googleusercontent.com`
   - ✅ Client Secret: `GOCSPX-abcdefghijklmnop`

---

## ✅ Paso 2: Supabase Dashboard

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Authentication** → **Providers**
4. Busca **Google** en la lista
5. Activa el toggle **"Enable Sign in with Google"**
6. Completa los campos:
   - **Client ID (for OAuth):** Pega el Client ID de Google
   - **Client Secret (for OAuth):** Pega el Client Secret de Google
7. Click **Save**

---

## ✅ Paso 3: Base de Datos

Ejecuta el script SQL para manejar usuarios OAuth:

1. Ve a **SQL Editor** en Supabase
2. Ejecuta el contenido del archivo: `sql/handle_oauth_users.sql`

Esto creará automáticamente:
- ✅ Perfil de usuario en la tabla `users`
- ✅ Suscripción Nipote (Free) en la tabla `subscriptions`

---

## ✅ Paso 4: Código (Ya implementado)

El código ya está actualizado con:
- ✅ Botón "Continuar con Google" en Auth.tsx
- ✅ Función `signInWithGoogle()` en supabase.ts
- ✅ Redirect automático después del login

---

## 🧪 Probar la Integración

1. **Recarga la aplicación** en el navegador
2. Ve a la página de login: `http://localhost:5173`
3. Click en **"Continuar con Google"**
4. Deberías ver:
   - Popup de selección de cuenta de Google
   - Pantalla de consentimiento (primera vez)
   - Redirect automático a `/app`
5. Verifica en Supabase:
   - **Authentication** → **Users** (debería aparecer el usuario)
   - **Table Editor** → `users` (perfil creado)
   - **Table Editor** → `subscriptions` (suscripción Nipote)

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
- ✅ Verifica que la URL de callback en Google Cloud coincida EXACTAMENTE con tu Project URL de Supabase
- ✅ Formato correcto: `https://tuproyecto.supabase.co/auth/v1/callback`

### Error: "Access blocked: This app's request is invalid"
- ✅ Completa el OAuth Consent Screen correctamente
- ✅ Añade tu email como Test User si el app está en modo "Testing"

### El usuario se crea pero no tiene perfil/suscripción
- ✅ Verifica que el trigger `on_auth_user_created` esté activo
- ✅ Ejecuta el script `sql/handle_oauth_users.sql`

### Error: "Error loading metadata"
- ✅ Espera unos minutos después de configurar en Google Cloud (puede tardar en propagarse)

---

## 📊 URLs de Referencia

- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **Supabase Auth Settings:** https://supabase.com/dashboard/project/_/auth/providers
- **Documentación Supabase OAuth:** https://supabase.com/docs/guides/auth/social-login/auth-google

---

## ✅ Checklist Final

- [ ] Proyecto creado en Google Cloud
- [ ] OAuth Consent Screen configurado
- [ ] Client ID y Secret creados
- [ ] Redirect URI añadida (con tu Project URL)
- [ ] Provider Google activado en Supabase
- [ ] Client ID y Secret guardados en Supabase
- [ ] Script SQL ejecutado (`handle_oauth_users.sql`)
- [ ] Código actualizado y funcionando
- [ ] Probado el flujo completo de login

---

🎉 **¡Listo!** Ahora tus usuarios pueden registrarse e iniciar sesión con Google.
