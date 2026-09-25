# Cómo funciona Nonnapp

Este documento explica la app desde el punto de vista de lo que hace, no de cómo está construida (para eso, ver el [`README.md`](../README.md) de la raíz).

## Qué es

Nonnapp genera recetas de cocina con IA a partir de lo que el usuario tiene en la despensa o de una idea de plato, con pasos claros y un "chef" al que preguntarle dudas mientras cocina.

## Páginas y flujo

- **`/`** — Landing pública: qué es la app, cómo funciona, planes.
- **`/auth`** — Registro / inicio de sesión (email + contraseña, o "Continuar con Google").
- **`/reset-password?token=...`** — Se llega aquí desde el link del email de recuperación.
- **`/verify-email?token=...`** — Se llega aquí desde el link del email de verificación.
- **`/terms`**, **`/privacy`** — Legal.
- **`/app`** — Dashboard: saludo, recetas recientes, accesos rápidos ("Sorpréndeme", "Desayuno rápido", "Modo Fit").
- **`/app/generate`** — El generador de recetas (ver abajo).
- **`/app/chef`** — "Mesa de la Nonna": estilos de cocina predefinidos para generar con un toque.
- **`/app/preferences`** — Alergias, ingredientes que no gustan, nivel de habilidad, gestión del plan.
- **`/app/profile`** — Editar username / contraseña, elegir idioma e instalar la app.
- **`/app/history`** — Todas las recetas generadas por el usuario.
- **`/app/recipe/:id`** — Detalle de una receta (solo visible para quien la creó).

Todo lo que empieza por `/app` exige sesión iniciada; si no hay sesión, redirige a `/auth`.

## Cuenta y sesión

- Registro: email + contraseña (mínimo 6 caracteres) + nombre de usuario. Se crea la cuenta, un plan gratis ("Nipote") y se inicia sesión automáticamente. Se manda un email de verificación y **la cuenta queda bloqueada hasta que se verifica**: al entrar en cualquier página de `/app` se muestra una pantalla de "verifica tu email" (con botón para reenviarlo) en vez del Dashboard, Generador, etc. — no se puede generar recetas, ver el historial, ni tocar preferencias o suscripción sin verificar. El backend aplica el mismo bloqueo (403 `EMAIL_NOT_VERIFIED`) en todas las rutas de `/api/recipes`, `/api/profile`, `/api/subscription` y `/api/ai`, así que no es solo un candado de la interfaz.
- Login: mismo email/contraseña. Por seguridad, un email que no existe y una contraseña incorrecta dan el mismo mensaje de error genérico (no se puede saber si un email está registrado probando a hacer login). Tampoco se puede deducir por el tiempo de respuesta. Límites contra fuerza bruta: máximo 8 intentos cada 15 minutos por IP y, además, **tras 5 contraseñas incorrectas seguidas la cuenta se bloquea 15 minutos** (aunque después se acierte la contraseña, hay que esperar; la app avisa con un mensaje genérico de "demasiados intentos" y el servidor indica cuántos segundos faltan en la respuesta, pero la pantalla todavía no los muestra). Un login correcto pone el contador a cero, y restablecer la contraseña por email desbloquea la cuenta al momento. El bloqueo es igual para emails que no existen, así que no revela qué cuentas están registradas.
- La sesión se mantiene con una cookie segura (httpOnly, 7 días de validez) — cerrar y volver a abrir el navegador no desloguea. Cada sesión (login) queda registrada en el servidor: cerrar sesión, o cambiar de contraseña, invalida esa sesión (o todas las demás) al instante, sin esperar a que caduque sola.
- "Olvidé mi contraseña": se manda un link por email válido 30 minutos. Si el email no existe, la respuesta es igualmente "revisa tu correo" (no revela qué emails están registrados). Cada cuenta recibe como máximo 3 de estos emails por hora (desde cualquier IP), para que nadie pueda llenarle la bandeja a otra persona; al pasarse, la app sigue respondiendo lo mismo pero no manda más. Al completar el cambio, se cierran todas las sesiones activas de la cuenta (por si el link lo usó alguien con acceso al correo pero no a las sesiones ya abiertas).
- "Continuar con Google": crea la cuenta (o la enlaza, si ya existía una con ese email creada por contraseña) sin pedir verificación de email aparte — Google ya confirma que el email es del usuario. Una cuenta creada solo con Google no tiene contraseña hasta que el usuario le pone una desde Editar perfil.

## Idioma y tema

- **Idioma**: español, inglés, francés y portugués. Se elige según el idioma guardado o, si no hay, el del navegador (español si no coincide con ninguno). Se puede cambiar con las banderas de la cabecera pública y desde Editar perfil. Los mensajes de error que manda el servidor (por ejemplo "Credenciales inválidas") siguen apareciendo en español.
- **Tema claro/oscuro**: se cambia con el botón de la cabecera y se recuerda entre visitas. Cada pantalla con foto de fondo (landing, login y app) tiene su versión de día y de noche, y una para móvil y otra para escritorio.
- **Animaciones**: la tarjeta del login aparece con un fundido, el título se escribe letra a letra, y al entrar en la app (desde el login o desde la landing) la pantalla aparece con un fundido suave. Las animaciones de la landing (hero) y la del título del login se desactivan con la opción "reducir movimiento" del sistema; los fundidos de la tarjeta del login y de la entrada a la app todavía no la respetan.

## Instalar la app

Nonnapp es una PWA: se puede añadir a la pantalla de inicio (móvil y tablet) o al escritorio (ordenador) y abrirla como una app, en su propia ventana y sin barra del navegador. Funciona igual en **cualquier navegador**; la app no distingue cuál se usa.

- El botón **Instalar app** está en **Editar perfil** (`/app/profile`) y aparece en todos los navegadores, salvo si la app ya está instalada o abierta como app. Ya no está en el menú lateral ni en la cabecera de la landing.
- Si el navegador ofrece su propio diálogo de instalación (el aviso `beforeinstallprompt`), el botón lo lanza directamente. La app lo guarda desde que arranca (`main.tsx`), porque el navegador lo avisa una sola vez y pronto. Si se rechaza el diálogo, la siguiente pulsación ya abre la guía.
- Si el navegador no lo ofrece, el botón abre una **guía genérica de tres pasos**, sin nombrar ningún navegador: abrir el menú del navegador (Compartir en iPhone/iPad, los tres puntos en Android y ordenador) → elegir **Instalar app** o **Añadir a pantalla de inicio** → confirmar. La guía avisa de que, si esa opción no aparece, el navegador no permite instalar.
- La landing tiene una sección (**Instala nonnapp como una app**, tras el vídeo de demo) que explica esos mismos tres pasos a cualquier visitante, sin botón.

## Generar una receta

Dos modos, elegibles en `/app/generate`:

- **Texto** (siempre disponible): describes lo que te apetece ("una cena romántica vegana...") y la IA inventa la receta.
- **Despensa** (solo planes de pago): listas los ingredientes que tienes ("huevos, tomate, arroz...") y la IA prioriza usarlos.

Se puede además fijar raciones, un límite de tiempo de cocinado, si se tiene robot de cocina (tipo Thermomix) y (si el plan lo permite) los utensilios disponibles. La IA tiene en cuenta las alergias, ingredientes no deseados y nivel de habilidad guardados en Preferencias.

Al generar:
1. Se pide el texto de la receta (título, descripción, ingredientes con cantidad, utensilios, pasos) — motor: **Groq**.
2. Se guarda en el historial del usuario. Los planes gratis tienen un límite de **2 recetas al día**; al superarlo, se avisa y no se genera más hasta el día siguiente (el límite se comprueba en el servidor, no se puede saltar borrando datos del navegador).

No hay generación de fotos del plato — se usó Gemini para eso hasta que se quitó de la app por completo. La foto sale de un banco de fotos reales curado a mano (`server/src/lib/recipeImages.ts`):

- **Cómo se elige:** por palabras clave del **título** (el plato con nombre propio gana a la categoría genérica, y "bowl"/"desayuno" solo deciden si no hay nada más concreto: "Bowl de avena" es avena, no un bowl de verduras). Si el título no dice nada, deciden los ingredientes —con más peso los primeros— y la descripción, sin contar derivados ("pasta de camarón" no es pasta) y solo si hay evidencia suficiente; si no la hay, se usa una foto genérica de plato antes que una equivocada.
- **La foto se fija al generar:** la que se enseña al usuario es la que se guarda, y no cambia después. Si el cliente no manda foto al guardar, el servidor elige una. Al arrancar, el servidor da foto a las recetas antiguas que no tenían (las anteriores al banco) y no toca las que ya la tienen.
- **Mientras carga:** las fotos muestran un esqueleto y aparecen solo cuando están completas (en vez de pintarse a trozos); si el enlace ya no existe, sale un recuadro con un gorro de chef.
- Los platos exóticos que no estén en el banco (p. ej. los que salen con "Sorpréndeme") pueden acabar con la foto genérica; ampliar el banco está en [Implementaciones futuras](#implementaciones-futuras).

## El chef de IA (chat)

Botón flotante disponible mientras se ve una receta (plan La Nonna). Es una conversación con contexto de la receta actual — se le puede preguntar por sustituciones de ingredientes, aclarar un paso, etc. El historial de la conversación no se guarda: si se cierra el chat o se recarga la página, se pierde.

## Planes

| | Il Nipote (gratis) | La Mamma | La Nonna |
|---|---|---|---|
| Recetas por día | 2 | Ilimitadas | Ilimitadas |
| Modo despensa | ✗ | ✔ | ✔ |
| Chat con el chef | ✗ | ✗ | ✔ |
| La Mesa de la Nonna | ✗ | ✗ | ✔ |
| Alergias / ingredientes / utensilios | ✗ | ✔ | ✔ |
| Historial completo | Últimas 3 | ✔ | ✔ |
| Planificador semanal | ✗ | ✗ | ✔ |
| Soporte prioritario | ✗ | ✗ | ✔ |

Notas importantes:
- **Cambiar de plan está desactivado hasta tener una pasarela de pago.** En Preferencias, el botón de cambio de plan ahora solo muestra un aviso para contactar por email, y el servidor rechaza el cambio (503). Todo lo demás está construido: el selector con los 3 planes (Il Nipote / La Mamma / La Nonna) y una pantalla de "pago" con campos de tarjeta, pero esa pantalla es una simulación (cualquier número vale, sin cobro), por eso está apagada a propósito. Hasta que exista un pago real, todas las cuentas nuevas empiezan en Il Nipote y no pueden pasar a otro plan desde la app.
- **Los límites de Il Nipote y La Mamma se aplican en el servidor, no solo escondiendo botones.** Modo despensa, las secciones de alergias/ingredientes/utensilios en Configuración del Chef, el chat y La Mesa de la Nonna devuelven un error si se intenta usarlos sin el plan que corresponde, aunque se salte la interfaz (por ejemplo llamando a la API directamente) — no basta con que la app no muestre el botón. El nivel de habilidad (Principiante/Intermedio/Avanzado) es lo único que no está gated, disponible para todos los planes.
- El planificador semanal de La Nonna está construido (pantalla + servidor) pero **desactivado a propósito** hasta terminar de pulirlo (ver [Implementaciones futuras](#implementaciones-futuras)). Las "recetas secretas de temporada" son, por ahora, solo una promesa de la landing: no hay nada construido.

## Preferencias del chef

En `/app/preferences` el usuario configura:
- **Alergias / restricciones** (texto libre, ej. "gluten, lactosa") — si se activa, la IA las excluye estrictamente.
- **Ingredientes que no gustan** — la IA los evita cuando puede.
- **Nivel de habilidad** (principiante / intermedio / avanzado) — ajusta el detalle de las instrucciones.
- **Utensilios disponibles** (solo aplica a la sesión actual, no se guarda entre visitas todavía).

## Implementaciones futuras

Lo que está previsto y todavía no está hecho (o no está activo). Son decisiones de alcance, no descuidos.

**Lista de trabajo actual**

- **Pasarela de pago** — hace falta para poder cambiar de plan (Il Nipote / La Mamma / La Nonna). Mientras no exista, el cambio de plan está desactivado y la pantalla de pago es solo una simulación sin cobro; además, las cuentas nuevas no pueden acceder a lo que llevan los planes de pago (modo despensa, chat del chef, planificador...).
- **Planificador semanal** — ya existe la pantalla y el servidor (exclusivo de La Nonna), pero está apagado hasta terminar el pulido visual. Falta activarlo y anunciarlo.
- **Panel para el administrador** — no existe ningún rol ni pantalla de administración: todas las cuentas son usuarios normales.
- **Avatar de usuario** — subir una foto de perfil. Hoy las cuentas de email/contraseña muestran solo la inicial del nombre; las de Google sí traen su foto.
- **Botón de cancelar receta** — poder cancelar la generación de una receta en curso; hoy, una vez lanzada, hay que esperar a que termine.
- **Más imágenes** — ampliar el banco de fotos de las recetas, para que más platos tengan una foto que encaje.
- **Doble factor de autenticación (2FA)** — decidido dejarlo para más adelante; hoy la protección de la cuenta es contraseña + verificación de email + límites y bloqueo de intentos.

**Otras carencias conocidas**

- Persistencia del chat del chef y de la lista de la compra entre sesiones.
- "Recetas secretas de temporada" de La Nonna (solo existen en la landing).
- Mostrar en el login cuánto falta para que termine un bloqueo por intentos fallidos, y traducir los mensajes de error del servidor.
