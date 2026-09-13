# Cómo funciona Sabora

Este documento explica la app desde el punto de vista de lo que hace, no de cómo está construida (para eso, ver el [`README.md`](../README.md) de la raíz).

## Qué es

Sabora genera recetas de cocina con IA a partir de lo que el usuario tiene en la despensa o de una idea de plato, con foto del resultado, pasos claros y un "chef" al que preguntarle dudas mientras cocina.

## Páginas y flujo

- **`/`** — Landing pública: qué es la app, cómo funciona, planes.
- **`/auth`** — Registro / inicio de sesión (solo email + contraseña).
- **`/reset-password?token=...`** — Se llega aquí desde el link del email de recuperación.
- **`/terms`**, **`/privacy`** — Legal.
- **`/app`** — Dashboard: saludo, recetas recientes, accesos rápidos ("Sorpréndeme", "Desayuno rápido", "Modo Fit").
- **`/app/generate`** — El generador de recetas (ver abajo).
- **`/app/chef`** — "Mesa de la Nonna": estilos de cocina predefinidos para generar con un toque.
- **`/app/preferences`** — Alergias, ingredientes que no gustan, nivel de habilidad, gestión del plan.
- **`/app/profile`** — Editar username / contraseña.
- **`/app/history`** — Todas las recetas generadas por el usuario.
- **`/app/recipe/:id`** — Detalle de una receta (solo visible para quien la creó).

Todo lo que empieza por `/app` exige sesión iniciada; si no hay sesión, redirige a `/auth`.

## Cuenta y sesión

- Registro: email + contraseña (mínimo 6 caracteres) + nombre de usuario. Se crea la cuenta, un plan gratis ("Nipote") y se inicia sesión automáticamente. Se manda un email de verificación y **la cuenta queda bloqueada hasta que se verifica**: al entrar en cualquier página de `/app` se muestra una pantalla de "verifica tu email" (con botón para reenviarlo) en vez del Dashboard, Generador, etc. — no se puede generar recetas, ver el historial, ni tocar preferencias o suscripción sin verificar. El backend aplica el mismo bloqueo (403 `EMAIL_NOT_VERIFIED`) en todas las rutas de `/api/recipes`, `/api/profile`, `/api/subscription` y `/api/ai`, así que no es solo un candado de la interfaz.
- Login: mismo email/contraseña. Por seguridad, un email que no existe y una contraseña incorrecta dan el mismo mensaje de error genérico (no se puede saber si un email está registrado probando a hacer login). Máximo 8 intentos cada 15 minutos por IP.
- La sesión se mantiene con una cookie segura (httpOnly, 7 días de validez) — cerrar y volver a abrir el navegador no desloguea. Cada sesión (login) queda registrada en el servidor: cerrar sesión, o cambiar de contraseña, invalida esa sesión (o todas las demás) al instante, sin esperar a que caduque sola.
- "Olvidé mi contraseña": se manda un link por email válido 30 minutos. Si el email no existe, la respuesta es igualmente "revisa tu correo" (no revela qué emails están registrados). Al completar el cambio, se cierran todas las sesiones activas de la cuenta (por si el link lo usó alguien con acceso al correo pero no a las sesiones ya abiertas).
- "Continuar con Google": crea la cuenta (o la enlaza, si ya existía una con ese email creada por contraseña) sin pedir verificación de email aparte — Google ya confirma que el email es del usuario. Una cuenta creada solo con Google no tiene contraseña hasta que el usuario le pone una desde Editar perfil.

## Generar una receta

Dos modos, elegibles en `/app/generate`:

- **Texto** (siempre disponible): describes lo que te apetece ("una cena romántica vegana...") y la IA inventa la receta.
- **Despensa** (solo planes de pago): listas los ingredientes que tienes ("huevos, tomate, arroz...") y la IA prioriza usarlos.

Se puede además fijar raciones, un límite de tiempo de cocinado y (si el plan lo permite) los utensilios disponibles. La IA tiene en cuenta las alergias, ingredientes no deseados y nivel de habilidad guardados en Preferencias.

Al generar:
1. Se pide el texto de la receta (título, descripción, ingredientes con cantidad, utensilios, pasos) — motor: **Groq**.
2. Si el plan incluye imágenes, se genera una foto del plato — motor: **Gemini** (si no hay clave de Gemini configurada, la receta se genera igual, solo que sin foto).
3. Se guarda en el historial del usuario. Los planes gratis tienen un límite de **2 recetas al día**; al superarlo, se avisa y no se genera más hasta el día siguiente (el límite se comprueba en el servidor, no se puede saltar borrando datos del navegador).

## El chef de IA (chat)

Botón flotante disponible mientras se ve una receta (planes de pago). Es una conversación con contexto de la receta actual — se le puede preguntar por sustituciones de ingredientes, aclarar un paso, etc. El historial de la conversación no se guarda: si se cierra el chat o se recarga la página, se pierde.

## Planes

| | Il Nipote (gratis) | La Mamma | La Nonna |
|---|---|---|---|
| Recetas por día | 2 | Ilimitadas | Ilimitadas |
| Modo despensa | ✗ | ✔ | ✔ |
| Foto de la receta | ✗ | ✔ | ✔ |
| Chat con el chef | ✗ | ✔ | ✔ |
| Historial completo | Últimas 3 | ✔ | ✔ |
| Planificador semanal | ✗ | ✗ | ✔ |
| Soporte prioritario | ✗ | ✗ | ✔ |

Notas importantes:
- **El pago no está implementado de verdad.** En Preferencias hay un botón "Obtener Pro" que activa el plan La Mamma directamente, sin pasarela de cobro — es una demo para poder probar las funciones de pago, no un checkout real.
- **Los límites de Il Nipote se aplican en el servidor, no solo escondiendo botones.** Modo despensa, foto y chat devuelven un error si se intenta usarlos sin plan de pago aunque se salte la interfaz (por ejemplo llamando a la API directamente) — no basta con que la app no muestre el botón.
- El planificador semanal y las "recetas secretas de temporada" de La Nonna son, por ahora, solo promesas de la landing — no hay ninguna pantalla ni funcionalidad construida para ellas todavía.

## Preferencias del chef

En `/app/preferences` el usuario configura:
- **Alergias / restricciones** (texto libre, ej. "gluten, lactosa") — si se activa, la IA las excluye estrictamente.
- **Ingredientes que no gustan** — la IA los evita cuando puede.
- **Nivel de habilidad** (principiante / intermedio / avanzado) — ajusta el detalle de las instrucciones.
- **Utensilios disponibles** (solo aplica a la sesión actual, no se guarda entre visitas todavía).

## Lo que falta / no está terminado

- Subida de foto de perfil (avatar) — para cuentas de email/contraseña sigue siendo solo la inicial del nombre (las de Google sí traen foto de perfil real).
- Pago real de los planes (Stripe o similar).
- Persistencia del chat del chef y de la lista de la compra entre sesiones.
