---
type: module
layer: backend
id: projects-backend
name: Proyectos
description: CRUD de proyectos del usuario autenticado
database: [projects, diagrams]
api:
  - GET /api/projects
  - POST /api/projects
  - GET /api/projects/:id
  - PATCH /api/projects/:id
  - DELETE /api/projects/:id
depends-on: [auth-backend]
folders:
  - id: projects-root
    path: src/modules/projects
files:
  - id: projects-routes
    folder: projects-root
    path: projects.routes.js
    type: router
  - id: projects-controller
    folder: projects-root
    path: projects.controller.js
    type: controller
  - id: projects-service
    folder: projects-root
    path: projects.service.js
    type: service
  - id: projects-repository
    folder: projects-root
    path: projects.repository.js
    type: repository
---

## Purpose
Gestiona los proyectos del usuario autenticado. Cada proyecto agrupa uno o varios diagramas y mantiene un campo `last_update` que se renueva cuando se crea o borra un diagrama dentro suyo. Todas las operaciones requieren JWT válido y filtran por `user_id` en cada query.

## Functions

### projects-routes
- monta GET /, POST /, GET /:id, PATCH /:id, DELETE /:id (todas con requireAuth)

### projects-controller
- getAll(req, res)
- getById(req, res)
- create(req, res)
- update(req, res)
- remove(req, res)

### projects-service
- getAll(userId)
- getById(id, userId)
- create(userId, { name, description })
- update(id, userId, patch)
- remove(id, userId)

### projects-repository
- findAllByUser(userId)
- findById(id, userId)
- create({ userId, name, description })
- update(id, userId, { name, description })
- remove(id, userId)

## Notes
Borrar un proyecto solo es posible si no tiene diagramas asociados; si los tiene, el service lanza un error que el controller traduce a 400 con mensaje "El proyecto tiene diagramas. Bórralos primero.".
La query base de listado incluye un LEFT JOIN con `diagrams` para devolver `diagram_count` ya calculado, evitando una segunda llamada desde el frontend.
Cualquier ID de proyecto que no pertenezca al usuario autenticado devuelve null desde el repositorio (defensa en profundidad: el filtro `WHERE user_id = ?` está en cada SQL).
