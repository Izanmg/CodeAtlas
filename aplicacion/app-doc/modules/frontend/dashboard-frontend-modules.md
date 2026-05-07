---
type: module
layer: frontend
id: dashboard-frontend
name: Dashboard
description: Vista de inicio que muestra un resumen global de proyectos y diagramas recientes del usuario autenticado
screens: [dashboard]
consumes-api: []
depends-on: [auth-frontend, projects-frontend, diagrams-frontend]
folders:
  - id: dashboard-views
    path: src/modules/dashboard/views
files:
  - id: dashboard-view
    folder: dashboard-views
    path: DashboardView.vue
    type: view
---

## Purpose

Pantalla raíz de la aplicación (ruta `/`). Agrega información de los stores de proyectos y diagramas para mostrar un resumen en cuadrículas: proyectos recientes y diagramas recientes. Sirve como punto de navegación central hacia el detalle de proyectos y el canvas de diagramas.

## State

Utiliza los stores de `projects-frontend` y `diagrams-frontend` directamente. No tiene estado propio.

## Functions

### dashboard-view
- onMounted() — carga proyectos y diagramas recientes
- goToProject(id)
- goToDiagram(id)
- goToNewProject()
