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
    imports: [projects-store, stat-cell, section-label, empty-state, diagram-card, time-format]
  - id: project-card
    folder: components
    path: ProjectCard.vue
    type: component
    imports: [projects-store, project-thumb, empty-thumb, confirm-delete-modal, project-edit-modal, time-format]
  - id: diagram-card
    folder: components
    path: DiagramCard.vue
    type: component
    imports: [diagram-thumb, confirm-delete-modal, diagram-edit-modal, time-format]
  - id: confirm-delete-modal
    folder: components
    path: ConfirmDeleteModal.vue
    type: component
  - id: project-edit-modal
    folder: components
    path: ProjectEditModal.vue
    type: component
    imports: [projects-store]
  - id: diagram-edit-modal
    folder: components
    path: DiagramEditModal.vue
    type: component
  - id: project-thumb
    folder: components
    path: ProjectThumb.vue
    type: component
  - id: diagram-thumb
    folder: components
    path: DiagramThumb.vue
    type: component
  - id: empty-thumb
    folder: components
    path: EmptyThumb.vue
    type: component
  - id: empty-state
    folder: components
    path: EmptyState.vue
    type: component
  - id: section-label
    folder: components
    path: SectionLabel.vue
    type: component
  - id: stat-cell
    folder: components
    path: StatCell.vue
    type: component
  - id: projects-store
    folder: stores
    path: projects.store.js
    type: store
    imports: [projects-frontend-service]
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

### project-edit-modal
- close()
- save()

### diagram-edit-modal
- addFiles(fileList)
- onSelectFiles(e)
- onDrop(e)
- removeFile(id)
- formatSize(bytes)
- close()
- save()

### projects-store
- fetchAll(force)
- fetchById(id)
- create(payload)
- bumpDiagramCount(projectId, delta)
- update(id, patch)
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
