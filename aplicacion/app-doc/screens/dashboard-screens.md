---
type: screen
id: dashboard
name: Dashboard
description: Pantalla de inicio con proyectos del usuario y diagramas recientes
module: dashboard-frontend
folder: views
file: dashboard-view
requires-auth: true
routes:
  - /
navigates-to: [project-detail, diagram-view, settings]
components:
  - ProjectCard
  - DiagramCard
---

## Description
Página principal tras el login. Se divide en dos secciones: el listado de proyectos del usuario (con botón para crear uno nuevo) y los diagramas recientes (los últimos 10 generados). Click en un proyecto navega a su detalle; click en un diagrama abre directamente el canvas.

## Elements
- header con nombre + iniciales del usuario
- botón "Nuevo proyecto"
- grid de tarjetas de proyectos
- listado horizontal de diagramas recientes
- estado vacío con mensaje guía cuando no hay proyectos todavía

## Actions
- create-project
- open-project
- open-diagram
- go-to-settings

## States
- default
- loading
- empty
