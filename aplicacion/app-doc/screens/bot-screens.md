---
type: screen
id: bot
name: Asistente IA
description: Pantalla conversacional para generar la carpeta app-doc/ con ayuda de la IA y descargarla como zip
module: bot-frontend
folder: views
file: bot-view
requires-auth: true
routes:
  - /bot
navigates-to: [dashboard]
components:
  - AppShell
  - PageHeader
  - Card
  - Button
  - BotTreeNode
---

## Description
Pantalla principal del asistente IA. Layout en tres columnas: a la izquierda la lista de conversaciones del usuario con botón "Nueva", en el centro el chat con el bot y un selector de modelo en la cabecera, a la derecha el árbol de archivos generados con preview readonly al hacer click en cualquiera. Desde la cabecera de la página se descarga el zip de la sesión activa.

## Elements
- sidebar izquierda con lista de sesiones (título, hora relativa, contador de archivos, papelera al hover)
- botón "+ Nueva" en la cabecera del sidebar de sesiones
- cabecera del chat con título de la sesión activa y selector de modelo (Flash / Flash-lite) tipo pill
- área scrollable de mensajes (burbujas de usuario en color accent, burbujas de bot en gris)
- indicador "Pensando..." mientras el modelo procesa
- tarjeta amarilla de avisos de validación cuando algún archivo no pasó la validación
- tarjeta amarilla de error de cuota con botón "Cambiar a {modelo alternativo} y reintentar"
- textarea de entrada con autogrow (38px mínimo, 160px máximo) + botón Enviar
- sidebar derecha con árbol de archivos generados (carpetas y archivos clickables)
- tarjeta de preview readonly del archivo seleccionado (monospace)
- botón "Descargar zip" en la cabecera de la página (habilitado solo si hay archivos en la sesión)

## Actions
- create-session
- select-session
- delete-session
- send-message
- switch-model
- switch-model-and-retry
- select-file
- delete-file
- download-zip

## States
- empty (sin sesiones)
- loading (esperando respuesta del modelo)
- switching (cargando sesión recién seleccionada)
- quota-error (límite del modelo alcanzado)
- validation-warning (archivos con avisos)
- error (error genérico)
