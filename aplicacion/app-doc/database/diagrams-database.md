---
type: entity
id: diagrams
name: Diagram
description: Diagrama generado a partir de la documentación de un proyecto
used-by: [diagrams-backend]
relations:
  - target: users
    type: many-to-one
    field: user_id
  - target: projects
    type: many-to-one
    field: project_id
---

## Table

```dbml
Table diagrams {
  id uuid [pk]
  user_id uuid [not null]
  project_id uuid [not null]
  name varchar [not null]
  description text
  model_json longtext [not null]
  layout_json longtext [not null]
  count_modules smallint [not null, default: 0]
  count_screens smallint [not null, default: 0]
  count_tables smallint [not null, default: 0]
  count_flows smallint [not null, default: 0]
  created_at timestamp [not null, default: 'CURRENT_TIMESTAMP']
}

Ref: diagrams.user_id > users.id
Ref: diagrams.project_id > projects.id
```

## Notes
`model_json` guarda el modelo unificado completo (módulos, screens, flows, database, system rules) tal cual lo entrega el parser. `layout_json` guarda el mapa `{ [nodeId]: { x, y } }` de las posiciones del canvas.
Los campos `count_modules`, `count_screens`, `count_tables`, `count_flows` se calculan al crear el diagrama desde `model_json` y no se actualizan al editar el layout (son denormalización para el listado rápido).
Tiene tanto `user_id` como `project_id` para que las queries de seguridad puedan filtrar directamente por usuario sin necesidad de JOIN con `projects`. Ambas FK están con `ON DELETE CASCADE`.
