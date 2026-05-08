---
type: module
layer: frontend
id: projects-frontend
name: Proyectos
description: Detalle de proyecto, listado de diagramas y CRUD de proyectos
screens: [project-detail]
consumes-api: [projects-backend, diagrams-backend]
depends-on: []
folders:
  - id: views
    path: src/modules/projects/views
  - id: components
    path: src/modules/projects/components
  - id: stores
    path: src/modules/projects/stores
  - id: services
    path: src/modules/projects/services
  - id: utils
    path: src/modules/projects/utils
files:
  - id: project-detail-view
    folder: views
    path: ProjectDetailView.vue
    type: view
  - id: project-card
    folder: components
    path: ProjectCard.vue
    type: component
  - id: diagram-card
    folder: components
    path: DiagramCard.vue
    type: component
  - id: confirm-delete-modal
    folder: components
    path: ConfirmDeleteModal.vue
    type: component
  - id: projects-store
    folder: stores
    path: projects.store.js
    type: store
  - id: projects-frontend-service
    folder: services
    path: projects.service.js
    type: service
  - id: time-format
    folder: utils
    path: time-format.js
    type: helper
---

## Purpose
Gestiona la vista de detalle del proyecto con sus diagramas y el CRUD de proyectos desde el cliente. El store mantiene la lista de proyectos en caché para evitar peticiones redundantes al backend (la cache se invalida pasando `force=true` o creando/borrando un proyecto). Los componentes `ProjectCard` y `DiagramCard` se usan también desde el dashboard.

## State
- projects
- loading
- loaded

## Functions

### project-detail-view
- onMounted: carga el proyecto y sus diagramas
- handleCreateDiagram()
- handleDeleteProject()
- handleDeleteDiagram(diagramId)

### project-card
- onClick: navega al detalle del proyecto
- onDelete: emite el evento de borrado (con confirmación)

### diagram-card
- onClick: navega al diagrama
- onDelete: emite el evento de borrado (con confirmación)

### projects-store
- fetchAll(force)
- fetchById(id)
- create(payload)
- bumpDiagramCount(projectId, delta)
- remove(id)

### projects-frontend-service
- fetchAll()
- fetchById(id)
- create({ name, description })
- bumpDiagramCount(projectId)
- remove(id)

### time-format
- formatRelative(date)
- formatDate(date)

## Notes
El service normaliza los campos snake_case del backend a camelCase para uso en componentes (`diagram_count` → `diagramCount`, `created_at` → `createdAt`, `last_update` → `updatedAt`).
La acción `bumpDiagramCount` no incrementa localmente — refetcha el proyecto desde el backend para garantizar consistencia (incluye `last_update` y el contador real).
Borrar un proyecto con diagramas dentro falla con el mensaje del backend ("El proyecto tiene diagramas. Bórralos primero."). El componente de confirmación muestra ese error sin cerrar el modal.
