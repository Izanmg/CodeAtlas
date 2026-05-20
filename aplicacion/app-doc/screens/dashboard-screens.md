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
navigates-to: [project-detail, diagram-view, settings, bot]
components:
  - ProjectCard
  - DiagramCard
---

## Description
Página principal tras el login. Se divide en dos secciones: el listado de proyectos del usuario (con botón para crear uno nuevo) y los diagramas recientes (los últimos 10 generados). Click en un proyecto navega a su detalle; click en un diagrama abre directamente el canvas. La cabecera incluye también un acceso al asistente IA para generar documentación.

## Elements
- header con nombre + iniciales del usuario
- botón "Asistente IA" (navega a /bot)
- botón "Nuevo proyecto"
- grid de tarjetas de proyectos
- listado horizontal de diagramas recientes
- estado vacío con mensaje guía cuando no hay proyectos todavía

## Actions
- create-project
- open-project
- open-diagram
- go-to-settings
- go-to-bot

## States
- default
- loading
- empty
