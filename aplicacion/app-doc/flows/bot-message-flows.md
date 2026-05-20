---
type: flow
id: bot-message
name: Envío de mensaje al asistente IA
description: Flujo completo desde que el usuario escribe un mensaje en el chat hasta que el bot genera archivos validados y los persiste
trigger: el usuario pulsa Enter o el botón Enviar en el chat del bot
screens: [bot]
modules: [bot-frontend, bot-backend, auth-backend]
database: [bot-sessions, bot-files]
---

## Steps
- [screen:bot] El usuario escribe una descripción de su aplicación en el textarea y pulsa Enter
- [frontend:bot-frontend/BotView.vue/send] El componente añade el mensaje del usuario al ref `messages` y vacía el input
- [frontend:bot-frontend/bot.service.js/sendMessage] Se hace POST /api/bot/sessions/:id/message con { message, model }
- [backend:auth-backend/auth.middleware.js/requireAuth] El middleware verifica el JWT y deja req.userId
- [backend:bot-backend/bot.controller.js/postMessage] Llega la petición al controller con sessionId en params
- [backend:bot-backend/bot.service.js/processMessage] Se valida que la sesión exista y pertenezca al usuario
- [database:bot-sessions] Se lee el historial de la sesión activa
- [database:bot-files] Se leen los archivos ya generados en la sesión (estado actual)
- [backend:bot-backend/bot.service.js/detectFormats] Heurística regex sobre el mensaje decide qué formatos detallados inyectar al system prompt
- [backend:bot-backend/bot.gemini.js/chat] Se construye el system prompt (GUIA-IA.md + formatos + estado de sesión) y se llama a Gemini con responseSchema { reply, files[] }
- [backend:bot-backend/bot.validator.js/validateFiles] Se valida cada archivo: path seguro, frontmatter YAML, campos obligatorios según type
- [backend:bot-backend/bot.gemini.js/chat] Si hay errores de validación, se reintenta una vez pidiendo al modelo que corrija los problemas concretos
- [backend:bot-backend/bot.repository.js/appendMessage] Se persiste el mensaje del usuario en history_json
- [database:bot-sessions] UPDATE de history_json + updated_at
- [backend:bot-backend/bot.repository.js/appendMessage] Se persiste la respuesta del bot
- [backend:bot-backend/bot.repository.js/upsertFiles] Si la validación final fue OK y hay archivos, se hace INSERT ... ON DUPLICATE KEY UPDATE
- [database:bot-files] Inserción o actualización de los archivos generados
- [backend:bot-backend/bot.service.js/processMessage] Si la sesión seguía con título por defecto y era el primer mensaje, se renombra automáticamente con los primeros 50 caracteres
- [database:bot-sessions] UPDATE del title (solo en el primer mensaje de la sesión)
- [frontend:bot-frontend/BotView.vue/send] Se añade la respuesta del bot a `messages`, se refrescan files y sessions
- [screen:bot] El árbol de archivos a la derecha muestra los nuevos archivos y el título de la sesión queda actualizado en el sidebar

## Error Cases
- Cuota agotada (429): el backend devuelve { code: 'QUOTA_EXCEEDED', model, suggestedModel } y el frontend muestra una tarjeta amarilla con botón "Cambiar a {modelo alternativo} y reintentar" que cambia el modelo y reenvía el mensaje sin pedírselo otra vez al usuario.
- Validación final fallida tras el reintento: la respuesta llega al frontend con un array `errors` y se muestra una caja amarilla con los problemas. Los archivos no se persisten en BD.
- Sesión no encontrada: 400 con mensaje [bot] Sesión no encontrada. Suele pasar si el activeId en localStorage apunta a una sesión borrada.
- Error genérico del modelo: aparece como `[error] {mensaje}` en el chat para que el usuario sepa que algo falló sin perder el contexto.

## Notes
El system prompt enviado a Gemini en cada turno se compone de tres bloques concatenados: (1) la guía completa de `ia-doc/GUIA-IA.md`, (2) los formatos detallados de `ia-doc/formatos/*.md` que la heurística considere relevantes para este mensaje, (3) un bloque con la lista de archivos ya generados en la sesión y reglas para no regenerarlos sin pedido explícito.
El reintento de validación duplica el coste por mensaje en términos de cuota del modelo (hasta 2 requests por turno).
El modelo seleccionado se envía en cada request; el backend lo valida contra la lista `MODELS` (`gemini-2.5-flash` o `gemini-2.5-flash-lite`). Si llega un valor no permitido, se lanza [bot] Modelo no soportado.
