---
type: screen
id: project-detail
name: Detalle de proyecto
description: Vista del proyecto con sus diagramas y opciones de gestión
module: projects-frontend
folder: views
file: project-detail-view
requires-auth: true
routes:
  - /projects/:id
navigates-to: [diagram-new, diagram-view, dashboard]
components:
  - DiagramCard
  - ConfirmDeleteModal
---

## Description
Muestra los datos del proyecto (nombre, descripción, fecha de última actualización) y la lista de diagramas que contiene. Permite crear un diagrama nuevo, abrir uno existente o borrar el proyecto. El borrado solo se permite si no quedan diagramas dentro — el botón muestra el motivo si está bloqueado.

## Elements
- header con nombre del proyecto y descripción
- timestamp "última actualización"
- botón "Nuevo diagrama"
- grid de tarjetas de diagramas
- botón "Borrar proyecto" (deshabilitado si hay diagramas)
- modal de confirmación al borrar el proyecto o un diagrama

## Actions
- create-diagram
- open-diagram
- delete-diagram
- delete-project
- back-to-dashboard

## States
- default
- loading
- error
- empty
