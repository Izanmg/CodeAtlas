---
type: module
layer: frontend
id: projects-frontend
name: Projects
description: Gestiona la lista de proyectos del usuario y la vista de detalle de cada proyecto, incluyendo sus diagramas asociados
screens: [projects, project-detail]
consumes-api: []
depends-on: [auth-frontend, diagrams-frontend]
folders:
  - id: projects-views
    path: src/modules/projects/views
  - id: projects-stores
    path: src/modules/projects/stores
  - id: projects-mock
    path: src/modules/projects/logica-temporal
files:
  - id: projects-view
    folder: projects-views
    path: ProjectsView.vue
    type: view
  - id: project-detail-view
    folder: projects-views
    path: ProjectDetailView.vue
    type: view
  - id: projects-store
    folder: projects-stores
    path: projects.store.js
    type: store
  - id: projects-mock-file
    folder: projects-mock
    path: projects-mock.js
    type: helper
---

## Purpose

Cubre la gestión CRUD de proyectos. La vista de lista (`ProjectsView`) muestra todos los proyectos con opción de crear uno nuevo. La vista de detalle (`ProjectDetailView`) muestra la información del proyecto y la lista de diagramas que contiene, con acceso al canvas de cada diagrama y a la creación de nuevos.

El store mantiene la lista en memoria con caché (campo `loaded`) y delega operaciones a `projects-mock.js`. La función `bumpDiagramCount` actualiza el contador de diagramas de un proyecto de forma optimista en la lista local.

## State

- projects
- loading
- loaded

## Functions

### projects-store
- fetchAll(force)
- fetchById(id)
- create(payload)
- bumpDiagramCount(projectId, delta)

### projects-mock-file
- fetchAll()
- fetchById(id)
- create(payload)
- bumpDiagramCount(projectId, delta)

### project-detail-view
- onMounted() — carga el proyecto por id de la URL y sus diagramas
- goToNewDiagram()
- goToDiagram(id)

## Notes

El store usa un patrón de caché simple: si `loaded` es `true`, `fetchAll()` devuelve los datos en memoria sin re-solicitar. Se puede forzar el refresco pasando `force = true`.

`bumpDiagramCount` actualiza el contador localmente en `projects.value` para evitar un re-fetch completo cuando el módulo de diagramas crea o elimina uno.
