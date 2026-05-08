---
type: screen
id: diagram-new
name: Nuevo diagrama
description: Pantalla para subir archivos .md y generar un diagrama
module: diagrams-frontend
folder: views
file: diagram-new-view
requires-auth: true
routes:
  - /projects/:id/diagrams/new
navigates-to: [diagram-view, project-detail]
components:
  - AppShell
  - PageHeader
  - Field
  - Input
  - Button
---

## Description
Permite al usuario subir uno o varios archivos `.md` siguiendo la estructura de CodeAtlas, ponerle nombre al diagrama y arrancar la generación. Muestra el progreso en tres fases (preparando archivos, analizando documentación, ¡diagrama generado!). Tras el éxito, redirige al canvas del diagrama recién creado.

## Elements
- input nombre del diagrama
- zona de drop / botón de selección de archivos
- listado de archivos seleccionados (con tamaño y opción de quitar uno)
- barra de progreso durante la generación
- mensaje de error si el parser rechaza algún archivo (con detalle por archivo)
- botón Generar diagrama

## Actions
- select-files
- remove-file
- submit-generate
- back-to-project

## States
- default
- files-selected
- generating
- error
