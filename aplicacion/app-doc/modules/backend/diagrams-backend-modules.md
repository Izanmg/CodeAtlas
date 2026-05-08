---
type: module
layer: backend
id: diagrams-backend
name: Diagramas
description: Generación, listado y persistencia de diagramas a partir de archivos .md
database: [diagrams, projects]
api:
  - GET /api/diagrams/recent
  - GET /api/projects/:projectId/diagrams
  - POST /api/projects/:projectId/diagrams
  - GET /api/diagrams/:id
  - PATCH /api/diagrams/:id/layout
  - DELETE /api/diagrams/:id
depends-on: [auth-backend, projects-backend, parser-backend]
folders:
  - id: diagrams-root
    path: src/modules/diagrams
files:
  - id: diagrams-routes
    folder: diagrams-root
    path: diagrams.routes.js
    type: router
  - id: diagrams-controller
    folder: diagrams-root
    path: diagrams.controller.js
    type: controller
  - id: diagrams-service
    folder: diagrams-root
    path: diagrams.service.js
    type: service
  - id: diagrams-repository
    folder: diagrams-root
    path: diagrams.repository.js
    type: repository
---

## Purpose
Es el módulo central de la aplicación. Recibe los archivos `.md` en multipart, los pasa al parser para generar el modelo unificado y el layout inicial, y persiste el resultado en la tabla `diagrams`. También gestiona la lectura de diagramas (recientes, por proyecto, por id), la actualización del layout cuando el usuario reorganiza el canvas, y el borrado.

## Functions

### diagrams-routes
- monta GET /diagrams/recent (con requireAuth)
- monta GET y POST /projects/:projectId/diagrams (con requireAuth y multer en POST)
- monta GET, PATCH /:id/layout, DELETE /:id sobre /diagrams/:id (con requireAuth)

### diagrams-controller
- getRecent(req, res)
- getByProject(req, res)
- getById(req, res)
- generate(req, res)
- saveLayout(req, res)
- remove(req, res)

### diagrams-service
- getByProject(projectId, userId)
- getById(id, userId)
- generate(projectId, userId, { name, files })
- saveLayout(id, userId, layout)
- remove(id, userId)

### diagrams-repository
- findRecentByUser(userId, limit)
- findByProject(projectId, userId)
- findById(id, userId)
- create({ projectId, userId, name, description, model, layout })
- updateLayout(id, userId, layout)
- remove(id, userId)

## Notes
La subida de archivos usa multer con almacenamiento en memoria (`multer.memoryStorage()`) — los `.md` no se escriben nunca a disco antes del parseo.
Al crear o borrar un diagrama se llama a `touchProject(projectId)` (helper compartido en `core/projects.core.js`) para actualizar `projects.last_update`.
La tabla `diagrams` tiene `user_id` propio: todas las queries filtran por `user_id = ? AND project_id = ?` (o solo `user_id = ?` para el listado reciente). Solo el service de `generate` consulta el repositorio de `projects` para verificar que el usuario tiene acceso al proyecto destino antes del INSERT.
