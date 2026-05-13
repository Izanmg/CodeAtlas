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
  - PATCH /api/diagrams/:id
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
    imports: [diagrams-controller]
    role: Declara los endpoints del módulo. Configura multer (memoryStorage) para POST y PATCH, y aplica requireAuth a todas las rutas.
  - id: diagrams-controller
    folder: diagrams-root
    path: diagrams.controller.js
    type: controller
    imports: [diagrams-service, diagrams-repository]
    role: Capa HTTP. Extrae los archivos de multer cuando aplica, delega en el service y devuelve los códigos HTTP correspondientes (201 al crear, 204 al borrar).
  - id: diagrams-service
    folder: diagrams-root
    path: diagrams.service.js
    type: service
    imports: [diagrams-repository]
    role: Lógica del módulo. Verifica acceso al proyecto, llama al parser cuando se generan o actualizan archivos y orquesta el touchProject tras cada cambio.
  - id: diagrams-repository
    folder: diagrams-root
    path: diagrams.repository.js
    type: repository
    role: Acceso SQL a la tabla diagrams. Filtra siempre por user_id (defensa en profundidad) y dispara touchProject en las operaciones que afectan al proyecto.
---

## Purpose
Es el módulo central de la aplicación. Recibe los archivos `.md` en multipart, los pasa al parser para generar el modelo unificado y el layout inicial, y persiste el resultado en la tabla `diagrams`. También gestiona la lectura de diagramas (recientes, por proyecto, por id), la actualización del layout cuando el usuario reorganiza el canvas, y el borrado.

## Functions

### diagrams-routes
- monta GET /diagrams/recent (con requireAuth)
- monta GET y POST /projects/:projectId/diagrams (con requireAuth y multer en POST)
- monta GET, PATCH /:id (con multer), PATCH /:id/layout, DELETE /:id sobre /diagrams/:id (con requireAuth)

### diagrams-controller
- getRecent(req, res)
  doc: Lista los últimos diagramas del usuario para el dashboard.
- getByProject(req, res)
  doc: Lista los diagramas de un proyecto concreto. Valida que el proyecto pertenece al usuario antes de listar.
- getById(req, res)
  doc: Devuelve el diagrama completo (incluyendo model_json y layout_json parseados).
- generate(req, res)
  doc: Recibe los archivos vía multer, los pasa al parser y persiste el modelo+layout resultante en la tabla.
- update(req, res)
  doc: Renombra el diagrama y opcionalmente regenera el modelo si llegan archivos nuevos en el multipart.
- saveLayout(req, res)
  doc: Actualiza solo el layout_json con las nuevas posiciones del usuario tras arrastrar nodos.
- remove(req, res)
  doc: Borra el diagrama. Dispara touchProject vía el repositorio.

### diagrams-service
- getByProject(projectId, userId)
  doc: Verifica acceso al proyecto y devuelve sus diagramas.
- getById(id, userId)
  doc: Devuelve el diagrama si pertenece al usuario; null en caso contrario (el repo ya filtra por user_id).
- generate(projectId, userId, { name, files })
  doc: Verifica acceso al proyecto, llama a parseDocumentation con los archivos y guarda { name, model, layout } en la tabla.
- update(id, userId, { name, files })
  doc: UPDATE dinámico. Si llegan archivos, regenera el modelo completo; si no, solo actualiza el nombre. En ambos casos toca last_update del proyecto.
- saveLayout(id, userId, layout)
  doc: Actualiza únicamente layout_json. No modifica model_json ni los contadores.
- remove(id, userId)
  doc: DELETE filtrado por user_id. Llama a touchProject del proyecto padre.

### diagrams-repository
- findRecentByUser(userId, limit)
  doc: SELECT ORDER BY created_at DESC LIMIT N. Usado por el dashboard.
- findByProject(projectId, userId)
  doc: SELECT WHERE project_id = ? AND user_id = ?. Ordenado por created_at descendente.
- findById(id, userId)
  doc: SELECT puntual con filtro de seguridad por user_id. Parsea los JSON columns antes de devolver.
- create({ projectId, userId, name, description, model, layout })
  doc: INSERT con UUID generado. Pre-calcula los contadores (count_modules, count_screens, etc.) y dispara touchProject.
- update(id, userId, { name, description, model, layout })
  doc: UPDATE dinámico construido en función de qué campos llegan; solo añade model_json/layout_json al SET cuando model está definido.
- updateLayout(id, userId, layout)
  doc: UPDATE aislado del campo layout_json. No toca contadores ni model_json ni last_update del proyecto.
- remove(id, userId)
  doc: DELETE con filtro de seguridad y touchProject posterior. Devuelve el affectedRows para que el service detecte 404.

## Notes
La subida de archivos usa multer con almacenamiento en memoria (`multer.memoryStorage()`) — los `.md` no se escriben nunca a disco antes del parseo.
Al crear o borrar un diagrama se llama a `touchProject(projectId)` (helper compartido en `core/projects.core.js`) para actualizar `projects.last_update`.
La tabla `diagrams` tiene `user_id` propio: todas las queries filtran por `user_id = ? AND project_id = ?` (o solo `user_id = ?` para el listado reciente). Solo el service de `generate` consulta el repositorio de `projects` para verificar que el usuario tiene acceso al proyecto destino antes del INSERT.
