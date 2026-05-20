---
type: flow
id: bot-download-zip
name: Descarga del zip generado por el bot
description: El usuario descarga la carpeta app-doc/ completa de la sesión activa como un archivo zip listo para subir al parser
trigger: el usuario pulsa el botón "Descargar zip" en la cabecera del asistente IA
screens: [bot]
modules: [bot-frontend, bot-backend, auth-backend]
database: [bot-files]
---

## Steps
- [screen:bot] El usuario pulsa "Descargar zip" en la cabecera de la pantalla del asistente IA
- [frontend:bot-frontend/BotView.vue/onDownload] Se llama al service con el id de la sesión activa
- [frontend:bot-frontend/bot.service.js/downloadZip] Se hace GET /api/bot/sessions/:id/zip con fetch directo (no http() porque la respuesta es binaria) incluyendo el header Authorization
- [backend:auth-backend/auth.middleware.js/requireAuth] El middleware valida el JWT y deja req.userId
- [backend:bot-backend/bot.controller.js/downloadZip] Llega la petición al controller con sessionId en params
- [backend:bot-backend/bot.zip.js/buildZip] Se llama a la función que construye el zip
- [backend:bot-backend/bot.repository.js/getFiles] Se cargan todos los archivos de la sesión, verificando pertenencia al usuario
- [database:bot-files] SELECT de path y content de todos los archivos de la sesión
- [backend:bot-backend/bot.zip.js/buildZip] Cada archivo se añade a una instancia de JSZip con zip.file(path, content); JSZip crea las carpetas a partir de las barras de los paths
- [backend:bot-backend/bot.zip.js/buildZip] Se llama a zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }) para obtener el Buffer comprimido
- [backend:bot-backend/bot.controller.js/downloadZip] Se devuelve la respuesta con headers Content-Type: application/zip y Content-Disposition: attachment; filename="app-doc.zip"
- [frontend:bot-frontend/bot.service.js/downloadZip] Se convierte la respuesta en Blob, se crea un object URL y se dispara la descarga con un <a download> temporal
- [screen:bot] El navegador descarga app-doc.zip al disco del usuario

## Error Cases
- No hay archivos en la sesión: el backend devuelve 404 con error "No hay archivos generados todavía". El botón de descarga del frontend se deshabilita preventivamente cuando files.length === 0, así este caso no debería ocurrir en condiciones normales.
- Sesión no pertenece al usuario: 400 con [bot] Sesión no encontrada.
- Token expirado o inválido: 401 del middleware, el usuario es redirigido a /login por el guard global del router.

## Notes
El zip se construye en memoria en cada petición; no se cachea ni se persiste. Como los archivos típicos son textuales y pequeños (algunos KB cada uno), el coste es despreciable y siempre se sirve la versión más reciente.
El nombre del archivo descargado es siempre `app-doc.zip` independientemente del título de la sesión. Es el nombre que el parser de CodeAtlas espera por convención.
El usuario puede subir directamente el zip resultante a la vista "Nuevo diagrama" para que el parser lo procese y genere el diagrama visual.
