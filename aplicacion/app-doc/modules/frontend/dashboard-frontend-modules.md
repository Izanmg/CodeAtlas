---
type: module
layer: frontend
id: dashboard-frontend
name: Dashboard
description: Pantalla de inicio con listado de proyectos y diagramas recientes
screens: [dashboard]
consumes-api: [projects-backend, diagrams-backend]
depends-on: [projects-frontend, diagrams-frontend]
folders:
  - id: views
    path: src/modules/dashboard/views
files:
  - id: dashboard-view
    folder: views
    path: DashboardView.vue
    type: view
    role: Vista de inicio tras el login. Orquesta projects-store y diagrams-store sin lógica propia. Listado de proyectos en grid y diagramas recientes en columna lateral.
---

## Purpose
Pantalla de inicio tras el login. Muestra los proyectos del usuario y los diagramas recientes en dos columnas. No tiene store ni servicio propios: consume directamente `useProjectsStore()` y `useDiagramsStore()` para listar y crear contenido.

## Functions

### dashboard-view
- onMounted: dispara projectsStore.fetchAll() y diagramsStore.fetchAll()
  doc: Carga las listas en paralelo. Si ya están cacheadas en los stores, los fetch son no-ops.
- handleCreateProject(payload)
  doc: Llama a projectsStore.create. Si tiene éxito, navega al detalle del proyecto recién creado.
- goToProject(projectId)
  doc: Navega a /projects/:id.
- goToDiagram(diagramId)
  doc: Navega a /diagrams/:id.

## Notes
Es un módulo "fino": una sola vista que orquesta los stores existentes. Si en el futuro se añaden widgets propios del dashboard (estadísticas, accesos rápidos), tendría sentido extraer un store o un service específico.
