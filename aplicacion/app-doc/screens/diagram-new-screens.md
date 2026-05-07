---
type: screen
id: diagram-new
name: New Diagram
description: Asistente de creación de diagrama — el usuario sube los archivos .md de documentación, el parser los procesa y redirige al canvas resultante
module: diagrams-frontend
requires-auth: true
---

## Description

Ruta `/projects/:id/diagrams/new`. Permite subir uno o varios archivos `.md` de documentación. Al confirmar, llama al store de diagramas (que llama al parser vía `logica-temporal/diagrams-mock.js`). Muestra progreso durante el procesamiento y redirige automáticamente al canvas (`/diagrams/:id`) al terminar.

## Elements

- zona de drag-and-drop para subir archivos .md
- lista de archivos seleccionados (con opción de eliminar)
- botón Generar diagrama
- indicador de progreso
- botón Volver al proyecto

## Actions

- upload-files
- remove-file(index)
- generate-diagram
- go-back

## States

- idle (esperando archivos)
- files-selected (al menos un archivo cargado)
- processing (llamada al parser en curso)
- error (el parser rechazó los archivos)
