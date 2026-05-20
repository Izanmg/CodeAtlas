---
type: module
layer: frontend
id: bot-frontend
name: Asistente IA
description: Interfaz conversacional con el bot generador de app-doc/, con sidebar de sesiones, árbol de archivos y descarga del zip
screens: [bot]
consumes-api: [bot-backend]
depends-on: [auth-frontend]
folders:
  - id: views
    path: src/modules/bot/views
  - id: components
    path: src/modules/bot/components
  - id: services
    path: src/modules/bot/services
files:
  - id: bot-view
    folder: views
    path: BotView.vue
    type: view
    imports: [bot-frontend-service, bot-tree-node]
    role: Pantalla principal del asistente. Layout en tres columnas (sesiones | chat | árbol de archivos). Maneja el estado local del chat, el selector de modelo, la persistencia de la sesión activa en localStorage y la tarjeta de error de cuota con botón de cambio de modelo y reintento automático.
  - id: bot-tree-node
    folder: components
    path: BotTreeNode.vue
    type: component
    role: Componente recursivo del árbol de archivos generados. Renderiza una carpeta (con sus hijos) o un archivo. Al hacer click en un archivo emite `select` para que la vista muestre el preview, y al pulsar la papelera emite `delete`.
  - id: bot-frontend-service
    folder: services
    path: bot.service.js
    type: service
    role: Cliente HTTP del bot. Funciones para listar/crear/borrar sesiones, enviar mensajes con modelo seleccionado, listar/borrar archivos y descargar el zip. La descarga usa fetch directo (no http()) porque la respuesta es binaria. Exporta MODELS, DEFAULT_MODEL y modelLabel().
---

## Purpose
Encapsula toda la experiencia del asistente IA dentro del frontend. El usuario puede mantener varias conversaciones en paralelo (cada una con su propio historial y archivos), cambiar entre ellas, generar la documentación con lenguaje natural y descargar el resultado como zip. La vista persiste el modelo seleccionado y la sesión activa en localStorage para que la recarga del navegador no rompa el flujo.

## State
- sessions
- activeId
- messages
- files
- input
- loading
- switching
- error
- quotaError
- validationWarnings
- previewFile
- selectedModel

## Functions

### bot-view
- refreshSessions()
  doc: Llama a listSessions() del service y actualiza el ref sessions con el listado completo del usuario.
- selectSession(id)
  doc: Carga el estado completo de una sesión (history + files) en una sola petición y actualiza messages, files y activeId. Si ya está activa, no hace nada.
- onNewSession()
  doc: Crea una sesión nueva vía API, refresca el listado y la activa.
- onDeleteSession(id)
  doc: Borra una sesión tras confirmación. Si era la activa, salta a la siguiente o crea una nueva.
- autoResize()
  doc: Ajusta la altura del textarea de entrada al contenido (min 38px, max 160px). Pasa por height auto antes de leer scrollHeight para que el navegador recalcule.
- send(messageText)
  doc: Envía un mensaje a la sesión activa con el modelo seleccionado. Acepta un texto opcional para reintentos automáticos tras cambio de modelo sin reintroducirlo en el chat. Procesa errores 429 mostrando la tarjeta de cuota.
- switchModelAndRetry()
  doc: Cuando el usuario pulsa "Cambiar a X y reintentar" tras un error de cuota, cambia el modelo seleccionado y reenvía el mensaje guardado en quotaError.lastMessage.
- scrollToBottom()
  doc: Scroll automático al final del contenedor de mensajes en cada turno (nextTick + scrollTop = scrollHeight).
- onDownload()
  doc: Descarga el zip de la sesión activa disparando un blob en el navegador.
- onDeleteFile(path)
  doc: Borra un archivo individual tras confirmación. Si el preview está abierto sobre ese archivo, lo cierra.
- buildTree(files)
  doc: Convierte la lista plana { path, content } en un árbol anidado por carpetas. Cada nodo tiene type 'dir' o 'file'.
- sortTree(node)
  doc: Ordena el árbol: carpetas primero (alfabéticas), después archivos.
- formatRelativeDate(dateStr)
  doc: Convierte una fecha en texto relativo legible (ahora, hace 5m, hace 3h, hace 2d, o la fecha si es más antigua).

### bot-tree-node
- render del nodo según node.type
  doc: Si es directorio renderiza el nombre + recursivamente cada child. Si es archivo lo hace clickeable con icono y papelera al lado.

### bot-frontend-service
- listSessions()
  doc: GET /api/bot/sessions. Devuelve el array de sesiones.
- createSession()
  doc: POST /api/bot/sessions. Devuelve la sesión vacía recién creada.
- fetchSession(sessionId)
  doc: GET /api/bot/sessions/:id. Devuelve { history, files } completo.
- renameSession(sessionId, title)
  doc: PATCH /api/bot/sessions/:id con { title }.
- deleteSession(sessionId)
  doc: DELETE /api/bot/sessions/:id.
- sendMessage(sessionId, message, model)
  doc: POST /api/bot/sessions/:id/message con { message, model }. Devuelve { reply, files, errors? }.
- fetchFiles(sessionId)
- deleteFile(sessionId, path)
- downloadZip(sessionId)
  doc: GET /api/bot/sessions/:id/zip con fetch directo. Convierte la respuesta en blob, crea un object URL y dispara la descarga con un <a> efímero.
- modelLabel(id)
  doc: Helper de presentación. Devuelve "Flash" o "Flash-lite" según el id.

## Notes
La sesión activa se persiste en localStorage bajo la clave `codeatlas:bot:activeSession` para que al recargar el navegador se vuelva a la misma conversación. Si la clave guardada apunta a una sesión que ya no existe, se cae a la primera sesión disponible.
El modelo seleccionado se persiste en localStorage bajo la clave `codeatlas:bot:model`. Por defecto se usa gemini-2.5-flash-lite porque tiene cuota free mucho más generosa.
El textarea de entrada implementa autogrow: arranca a 38px (una línea), crece con el contenido hasta 160px, y a partir de ahí muestra scroll interno. Vuelve a la altura mínima al enviar.
La tarjeta amarilla de error de cuota aparece dentro del scroll del chat. Lleva un botón directo "Cambiar a X y reintentar" que cambia el modelo guardando la preferencia y reenvía el mensaje sin que el usuario tenga que reescribirlo.
Cada respuesta del bot puede llevar un array `errors` con avisos de validación que no impidieron la respuesta pero que el usuario debería revisar (campos faltantes, IDs no reconocidos, etc.). Se muestran en una caja amarilla debajo de los mensajes.
