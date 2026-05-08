---
type: entity
id: projects
name: Project
description: Proyectos a los que pertenecen los diagramas
used-by: [projects-backend, diagrams-backend]
relations:
  - target: users
    type: many-to-one
    field: user_id
  - target: diagrams
    type: one-to-many
    field: project_id
---

## Table

```dbml
Table projects {
  id uuid [pk]
  user_id uuid [not null]
  name varchar [not null]
  description text
  created_at timestamp [not null, default: 'CURRENT_TIMESTAMP']
  last_update timestamp [not null, default: 'CURRENT_TIMESTAMP']
}

Ref: projects.user_id > users.id
Ref: projects.id < diagrams.project_id
```

## Notes
El campo `last_update` se actualiza al crear o borrar un diagrama del proyecto (mediante el helper `touchProject` en `core/projects.core.js`). No se actualiza al renombrar el proyecto solo, sino que cualquier UPDATE de proyecto pone `last_update = NOW()` en la query.
Un proyecto solo se puede borrar si no tiene diagramas asociados (validación en `projects.service.remove`).
Todas las consultas filtran obligatoriamente por `user_id` (defensa en profundidad: el repositorio rechaza la petición si el ID no pertenece al usuario autenticado).
