---
type: module
layer: backend
id: bot-backend
name: Asistente IA
description: Generador conversacional de la carpeta app-doc/ usando Google Gemini, con persistencia de sesiones y descarga como zip
database: [bot-sessions, bot-files]
api:
  - GET /api/bot/sessions
  - POST /api/bot/sessions
  - GET /api/bot/sessions/:id
  - PATCH /api/bot/sessions/:id
  - DELETE /api/bot/sessions/:id
  - POST /api/bot/sessions/:id/message
  - GET /api/bot/sessions/:id/files
  - DELETE /api/bot/sessions/:id/files
  - GET /api/bot/sessions/:id/zip
depends-on: [auth-backend]
folders:
  - id: bot-root
    path: src/modules/bot
files:
  - id: bot-routes
    folder: bot-root
    path: bot.routes.js
    type: router
    imports: [bot-controller]
    role: Declara los endpoints REST anidados por sesión. Aplica requireAuth a todas las rutas mediante router.use(requireAuth).
  - id: bot-controller
    folder: bot-root
    path: bot.controller.js
    type: controller
    imports: [bot-service, bot-zip]
    role: Capa HTTP del módulo. Mapea errores específicos a códigos HTTP. Los errores [bot:quota] se traducen a 429 con cuerpo estructurado { code, model, suggestedModel } para que el frontend ofrezca cambiar de modelo.
  - id: bot-service
    folder: bot-root
    path: bot.service.js
    type: service
    imports: [bot-gemini, bot-validator, bot-repository]
    role: Orquesta el flujo de cada turno. Detecta qué formatos detallados inyectar al system prompt, llama a Gemini, valida la salida, reintenta una vez si falla, persiste mensajes y archivos. Auto-renombra la sesión al primer mensaje.
  - id: bot-gemini
    folder: bot-root
    path: bot.gemini.js
    type: service
    role: Wrapper sobre el SDK @google/genai. Carga GUIA-IA.md y los formatos de ia-doc/formatos/ bajo demanda. Fuerza salida JSON con responseSchema. Detecta errores 429 de cuota y los relanza como [bot:quota] con model y suggestedModel adjuntos.
  - id: bot-validator
    folder: bot-root
    path: bot.validator.js
    type: helper
    role: Valida los archivos devueltos por el LLM. Comprueba path seguro (sin .., dentro de app-doc/, extensión .md), frontmatter YAML parseable, y presencia de los campos obligatorios según el type del frontmatter. Reutiliza el yaml-parser del módulo parser-backend.
  - id: bot-repository
    folder: bot-root
    path: bot.repository.js
    type: repository
    role: Acceso SQL a las tablas bot_sessions y bot_files. UPSERT con INSERT ... ON DUPLICATE KEY UPDATE para regenerar archivos sin lógica extra. Genera UUIDs en JS para las sesiones nuevas.
  - id: bot-zip
    folder: bot-root
    path: bot.zip.js
    type: helper
    imports: [bot-repository]
    role: Construye el .zip en memoria con JSZip. JSZip crea los subdirectorios automáticamente a partir de los paths de cada archivo.
---

## Purpose
Permite al usuario describir su aplicación en lenguaje natural y obtener a cambio la carpeta `app-doc/` completa con la documentación estructurada que espera el parser. El bot conversa con el usuario, mantiene historial persistente por sesión, genera archivos `.md` válidos respetando el formato CodeAtlas y los empaqueta en un `.zip` descargable. Cubre el requisito obligatorio del ciclo de integrar al menos un modelo de IA.

## Functions

### bot-routes
- registra todas las rutas con requireAuth como middleware previo
- expone endpoints anidados por sessionId para CRUD de sesiones, mensajes, archivos y descarga del zip

### bot-controller
- getSessions(req, res)
  doc: Lista todas las sesiones del usuario autenticado con title, updated_at y file_count agregado.
- createSession(req, res)
  doc: Crea una sesión vacía con título por defecto "Nueva conversación" y devuelve el id generado.
- getSession(req, res)
  doc: Devuelve el estado completo de una sesión (history + files). 404 si no pertenece al usuario.
- patchSession(req, res)
  doc: Renombra una sesión. Body { title } obligatorio.
- deleteSession(req, res)
  doc: Borra la sesión y todos sus archivos (cascade vía FK).
- postMessage(req, res)
  doc: Envía un mensaje al bot dentro de una sesión. Body { message, model }. Devuelve { reply, files, errors? }.
- getFilesList(req, res)
  doc: Lista los archivos generados de la sesión activa.
- deleteOneFile(req, res)
  doc: Borra un archivo individual de la sesión. Path en query param ?path=.
- downloadZip(req, res)
  doc: Construye el zip de la sesión y lo devuelve como application/zip con Content-Disposition attachment.

### bot-service
- listSessions(userId)
  doc: Delega en el repositorio. Devuelve las sesiones del usuario ordenadas por updated_at desc con file_count.
- createSession(userId)
  doc: Crea una sesión vacía con título "Nueva conversación".
- getSessionState(sessionId, userId)
  doc: Devuelve { history, files } verificando pertenencia al usuario.
- renameSession(sessionId, userId, title)
  doc: Valida que el título no sea vacío y trim/limita a 255 caracteres.
- deleteSession(sessionId, userId)
  doc: Borra la sesión. Lanza [bot] si no pertenece al usuario.
- processMessage(sessionId, userId, message, model)
  doc: Flujo completo de un turno. Carga historial + archivos existentes, detecta formatos a inyectar, llama a chat() con model, valida la salida, reintenta una vez si falla, persiste y devuelve { reply, files }.
- detectFormats(userMessage, history)
  doc: Heurística regex sobre el texto reciente. Decide qué subset de formatos (modulos, pantallas, flujos, base-datos, reglas) inyectar al system prompt para limitar tokens.
- deriveTitle(message)
  doc: Toma los primeros 50 caracteres del primer mensaje del usuario y los usa como título auto-generado.
- listFiles(sessionId, userId)
- removeFile(sessionId, userId, path)

### bot-gemini
- chat(history, formats, model, existingFiles)
  doc: Llama a Gemini con system prompt construido (guía base + formatos detectados + bloque de estado de sesión con archivos existentes) y responseSchema { reply, files[] }. Detecta 429 y lo relanza como [bot:quota].
- buildSessionStateBlock(existingFiles)
  doc: Construye el bloque de markdown que se inyecta al final del system prompt con la lista de paths ya generados y las reglas (no regenerar, reutilizar IDs, devolver solo lo nuevo).
- otherModel(model)
  doc: Devuelve el modelo alternativo para sugerir cuando se agota la cuota del actual (flash → flash-lite, flash-lite → flash).
- isQuotaError(err)
  doc: Detecta si un error del SDK proviene de un 429 buscando los marcadores "429", "RESOURCE_EXHAUSTED" o "quota" en el message.

### bot-validator
- validateFile(file)
  doc: Devuelve la lista de errores de un archivo. Comprueba path seguro, extensión .md, frontmatter delimitado por ---, YAML parseable, type reconocido y presencia de los campos obligatorios según el type.
- validateFiles(files)
  doc: Aplica validateFile a cada archivo y agrega los errores. Devuelve { valid, errors }.

### bot-repository
- listSessions(userId)
  doc: SELECT con LEFT JOIN a bot_files para incluir file_count. Ordenado por updated_at desc.
- createSession(userId, title)
  doc: INSERT con UUID generado vía randomUUID(). Devuelve la sesión recién creada.
- findSession(sessionId, userId)
  doc: SELECT verificando user_id. Devuelve la sesión con history parseado o null.
- getSessionState(sessionId, userId)
  doc: Combina findSession + SELECT de bot_files. Lanza [bot] si la sesión no existe.
- renameSession(sessionId, userId, title)
- deleteSession(sessionId, userId)
  doc: DELETE de bot_sessions. El ON DELETE CASCADE se encarga de bot_files.
- appendMessage(sessionId, userId, message)
  doc: Lee history_json, mete el mensaje al final, UPDATE con NOW() en updated_at.
- upsertFiles(sessionId, files)
  doc: INSERT en bloque con ON DUPLICATE KEY UPDATE content = VALUES(content). Permite regenerar archivos manteniendo el mismo path.
- deleteFile(sessionId, userId, path)
- getFiles(sessionId, userId)

### bot-zip
- buildZip(sessionId, userId)
  doc: Lee los archivos de la sesión, los mete uno por uno en una instancia de JSZip y devuelve el Buffer. Las carpetas (modules/, database/, etc.) las crea JSZip a partir de las barras en los paths.

## Notes
La API key de Gemini vive en la variable de entorno GEMINI_API_KEY, leída por bot.gemini.js al construir el cliente.
El system prompt se construye en cada llamada concatenando: GUIA-IA.md (siempre) + formatos detallados detectados por heurística + bloque con la lista de archivos ya generados en la sesión. Total típico: 8-20k tokens, ampliamente dentro del context window del modelo.
El reintento de validación duplica el coste por mensaje: cada turno puede consumir hasta 2 requests de la cuota del modelo.
Los modelos permitidos son gemini-2.5-flash (más capaz, free tier restrictivo ~20 req/día) y gemini-2.5-flash-lite (más rápido, ~1000 req/día). El usuario elige en la UI; el modelo se persiste en localStorage en el frontend y se envía en cada POST /message.
Los errores 429 de Gemini se relanzan con prefijo [bot:quota] y campos adjuntos (model, suggestedModel) que el controller mapea a respuesta HTTP 429 con cuerpo { code: 'QUOTA_EXCEEDED', model, suggestedModel } para que el frontend ofrezca cambiar de modelo automáticamente.
El context caching de Gemini no está disponible en free tier, así que la guía completa se paga en tokens en cada llamada. Asumible porque el límite es por tokens/minuto y el uso normal está muy por debajo.
