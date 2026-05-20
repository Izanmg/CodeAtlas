---
type: flow
id: bot-session-management
name: Gestión de conversaciones del bot
description: Listado, creación, cambio y borrado de conversaciones del asistente IA desde el sidebar
trigger: el usuario abre la pantalla del bot o interactúa con el sidebar de conversaciones
screens: [bot]
modules: [bot-frontend, bot-backend, auth-backend]
database: [bot-sessions, bot-files]
---

## Steps
- [screen:bot] El usuario navega a /bot desde el dashboard o tras recargar
- [frontend:bot-frontend/BotView.vue/refreshSessions] El componente llama a listSessions() al montarse
- [frontend:bot-frontend/bot.service.js/listSessions] GET /api/bot/sessions con el JWT
- [backend:bot-backend/bot.controller.js/getSessions] Llega la petición al controller
- [backend:bot-backend/bot.repository.js/listSessions] SELECT con LEFT JOIN a bot_files para incluir file_count agregado
- [database:bot-sessions] Se listan las sesiones del usuario ordenadas por updated_at desc
- [database:bot-files] El LEFT JOIN cuenta los archivos por sesión
- [frontend:bot-frontend/BotView.vue/refreshSessions] El sidebar muestra todas las sesiones del usuario
- [frontend:bot-frontend/BotView.vue/selectSession] Si hay una sesión guardada en localStorage (codeatlas:bot:activeSession) y existe en el listado, se selecciona; si no, se selecciona la primera
- [frontend:bot-frontend/bot.service.js/fetchSession] GET /api/bot/sessions/:id para cargar history + files
- [database:bot-sessions] SELECT de la sesión específica con history_json parseado
- [database:bot-files] SELECT de los archivos asociados
- [screen:bot] El chat muestra el historial completo y el árbol los archivos generados

## Error Cases
- No hay ninguna sesión todavía (usuario nuevo): el frontend crea una automáticamente vía POST /api/bot/sessions y la activa.
- Sesión guardada en localStorage ya borrada: el frontend cae en la primera sesión disponible o crea una nueva si la lista está vacía.
- Borrado de la sesión activa: el frontend salta a la siguiente del listado; si era la última, crea una nueva automáticamente.

## Notes
**Crear sesión** (POST /api/bot/sessions): inserta una fila vacía con title 'Nueva conversación' y history_json '[]'. El título se renombra automáticamente cuando el usuario envía el primer mensaje (ver flujo bot-message).
**Borrar sesión** (DELETE /api/bot/sessions/:id): borra la fila de bot_sessions. El ON DELETE CASCADE limpia bot_files.
**Renombrar sesión** (PATCH /api/bot/sessions/:id): permitido pero no expuesto en la UI v1; las sesiones se nombran automáticamente con la primera frase del usuario.
El listado del sidebar incluye un contador de archivos generados que se calcula con un LEFT JOIN agregado en la consulta de listSessions, así que es siempre coherente sin necesidad de una columna denormalizada.
La sesión activa se persiste en localStorage bajo la clave `codeatlas:bot:activeSession` para que la recarga del navegador no rompa el flujo del usuario.
