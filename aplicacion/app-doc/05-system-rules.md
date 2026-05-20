---
type: system-rules
---

## Auth
- Todas las rutas bajo /api requieren autenticación excepto /api/auth/login, /api/auth/register y /api/parser/* (uso interno)
- Las rutas /api/bot/* requieren autenticación; el middleware se aplica con router.use(requireAuth) en bot.routes.js
- Las sesiones usan JWT firmados con HS256 y caducan a los 7 días
- El token se envía en cada petición como header Authorization: Bearer <token>
- No hay roles diferenciados todavía: todos los usuarios autenticados tienen los mismos permisos sobre sus propios recursos
- Cada query SQL filtra por user_id para que un usuario nunca vea datos de otro (defensa en profundidad además de la verificación a nivel de servicio)

## Navigation
- Los usuarios no autenticados que intentan acceder a una ruta protegida son redirigidos a /login
- Tras un login exitoso, los usuarios son redirigidos a / (dashboard)
- Tras un registro exitoso, los usuarios entran autenticados automáticamente y son redirigidos a /
- Tras logout, los usuarios son redirigidos a /login
- Si un usuario autenticado entra a /login o /register, es redirigido a /
- Las rutas desconocidas redirigen a / (catch-all)

## Validation
- La contraseña debe tener al menos 8 caracteres (validación en backend antes de hashear)
- El email debe ser único en la tabla users (constraint UNIQUE a nivel de BD)
- Solo se aceptan archivos .md en las subidas para generar diagramas
- El nombre del proyecto y del diagrama no puede estar vacío (validación en service.create con .trim())
- El theme solo acepta los valores light o dark

## Conventions
- Las respuestas de la API usan camelCase para los campos (el frontend normaliza snake_case → camelCase en sus services)
- Las columnas de base de datos usan snake_case (user_id, created_at, last_update)
- Los IDs son UUID v1 (CHAR(36)) generados con la función UUID() de MySQL
- Los timestamps se almacenan en DATETIME con CURRENT_TIMESTAMP por defecto
- El cliente HTTP del frontend (src/lib/http.js) lanza un Error con la propiedad data.error o "Error <status>" en cualquier respuesta no-2xx
- Las respuestas 204 No Content devuelven null desde el cliente HTTP
- Los nombres de archivo siguen kebab-case (LoginView.vue es Vue, no kebab; las utilidades JS son auth.service.js, projects.repository.js, etc.)

## Technical Decisions
- Las contraseñas se hashean con bcrypt (saltRounds: 10) antes de guardarse en password_hash
- Los JWT se firman con la variable de entorno JWT_SECRET (en dev usa el fallback codeatlas_dev_secret)
- El backend nunca devuelve el campo password_hash en ninguna respuesta
- El frontend guarda el token de sesión en localStorage bajo la clave codeatlas:auth como JSON { user, token }
- El frontend guarda los ajustes en localStorage bajo la clave codeatlas:settings como JSON { theme }
- El frontend guarda la sesión activa del bot en localStorage bajo la clave codeatlas:bot:activeSession (sessionId UUID)
- El frontend guarda el modelo Gemini seleccionado en localStorage bajo la clave codeatlas:bot:model
- La subida de archivos usa multer con almacenamiento en memoria (sin temp files en disco)
- La base de datos es MySQL accedida vía pool con mysql2/promise (límite 10 conexiones)
- El parser persiste el modelo en memoria (parser.repository) solo para depuración; el cliente real es diagrams-backend que guarda en su tabla
- Los diagramas tienen user_id propio (además de project_id) para que las queries de seguridad no necesiten JOIN con projects
- Vue Flow se usa en modo controlado: nodes/edges son refs locales, los cambios se aplican manualmente desde @nodes-change
- Pinia es el store global del frontend; cada módulo tiene su propio useXStore()
- La API key de Google Gemini vive en la variable de entorno GEMINI_API_KEY del backend; nunca se expone al cliente
- El asistente IA usa Google Gemini 2.5 (flash o flash-lite); el usuario elige el modelo en la UI y se persiste en localStorage
- Los archivos generados por el bot se validan en el backend (path seguro, frontmatter YAML, campos obligatorios) antes de persistirse en bot_files
- Si la validación falla tras un reintento automático, los archivos se devuelven al frontend con avisos pero no se persisten en BD
- Los errores 429 de cuota de Gemini se traducen a HTTP 429 con cuerpo estructurado { code: 'QUOTA_EXCEEDED', model, suggestedModel } para que el frontend ofrezca cambiar de modelo
