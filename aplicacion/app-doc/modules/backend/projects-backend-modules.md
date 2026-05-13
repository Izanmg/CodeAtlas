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
    imports: [projects-controller]
    role: Declara los endpoints CRUD del módulo. Aplica requireAuth a todos.
  - id: projects-controller
    folder: projects-root
    path: projects.controller.js
    type: controller
    imports: [projects-service]
    role: Capa HTTP. Mapea el error "El proyecto tiene diagramas" a 400 y el resto a 404 o 500 según corresponda.
  - id: projects-service
    folder: projects-root
    path: projects.service.js
    type: service
    imports: [projects-repository]
    role: Lógica del módulo. Valida nombre obligatorio en create/update y bloquea el borrado si quedan diagramas dentro.
  - id: projects-repository
    folder: projects-root
    path: projects.repository.js
    type: repository
    role: Acceso SQL a projects. El SELECT base hace LEFT JOIN con diagrams para devolver diagram_count en una sola query.
---

## Purpose
Gestiona los proyectos del usuario autenticado. Cada proyecto agrupa uno o varios diagramas y mantiene un campo `last_update` que se renueva cuando se crea o borra un diagrama dentro suyo. Todas las operaciones requieren JWT válido y filtran por `user_id` en cada query.

## Functions

### projects-routes
- monta GET /, POST /, GET /:id, PATCH /:id, DELETE /:id (todas con requireAuth)

### projects-controller
- getAll(req, res)
  doc: Lista los proyectos del usuario actual con su diagram_count denormalizado.
- getById(req, res)
  doc: Devuelve un proyecto concreto. 404 si no pertenece al usuario.
- create(req, res)
  doc: Crea un proyecto nuevo y lo devuelve con id, last_update y diagram_count=0 listos para el frontend.
- update(req, res)
  doc: Actualiza nombre/descripción. La descripción puede vaciarse (UPDATE escribe NULL si llega null).
- remove(req, res)
  doc: Borra el proyecto. Devuelve 400 si tiene diagramas dentro.

### projects-service
- getAll(userId)
  doc: Forward al repositorio. La lista viene ordenada por created_at DESC.
- getById(id, userId)
  doc: Forward al repositorio con verificación implícita de propiedad (filtro user_id en el SQL).
- create(userId, { name, description })
  doc: Valida que name no esté vacío (.trim()) y delega en el repositorio.
- update(id, userId, patch)
  doc: Valida nombre si llega y delega. last_update se actualiza siempre desde el SQL.
- remove(id, userId)
  doc: Verifica diagram_count === 0 antes de DELETE. Lanza "El proyecto tiene diagramas. Bórralos primero." si hay alguno.

### projects-repository
- findAllByUser(userId)
  doc: SELECT con LEFT JOIN diagrams + COUNT() agrupado. Devuelve cada proyecto con su diagram_count.
- findById(id, userId)
  doc: SELECT puntual con el mismo JOIN. Filtra por user_id para garantizar aislamiento.
- create({ userId, name, description })
  doc: INSERT con UUID generado en JS. Devuelve la fila completa (diagram_count = 0 inicial).
- update(id, userId, { name, description })
  doc: UPDATE con COALESCE para name (mantiene si llega null) y escritura directa para description (permite vaciado). Refresca last_update.
- remove(id, userId)
  doc: DELETE filtrado por user_id. La FK diagrams.project_id está con ON DELETE CASCADE como respaldo aunque el service ya valida.

## Notes
Borrar un proyecto solo es posible si no tiene diagramas asociados; si los tiene, el service lanza un error que el controller traduce a 400 con mensaje "El proyecto tiene diagramas. Bórralos primero.".
La query base de listado incluye un LEFT JOIN con `diagrams` para devolver `diagram_count` ya calculado, evitando una segunda llamada desde el frontend.
Cualquier ID de proyecto que no pertenezca al usuario autenticado devuelve null desde el repositorio (defensa en profundidad: el filtro `WHERE user_id = ?` está en cada SQL).
