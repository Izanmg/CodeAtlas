---
type: entity
id: users
name: User
description: Usuarios registrados en CodeAtlas
used-by: [auth-backend]
relations:
  - target: user-settings
    type: one-to-one
    field: user_id
  - target: projects
    type: one-to-many
    field: user_id
  - target: diagrams
    type: one-to-many
    field: user_id
  - target: bot-sessions
    type: one-to-many
    field: user_id
---

## Table

```dbml
Table users {
  id uuid [pk]
  email varchar [not null, unique]
  name varchar [not null]
  password_hash varchar [not null]
  created_at timestamp [not null, default: 'CURRENT_TIMESTAMP']
}

Ref: users.id - user_settings.user_id
Ref: users.id < projects.user_id
Ref: users.id < diagrams.user_id
Ref: users.id < bot_sessions.user_id
```

## Notes
La contraseña nunca se almacena en texto plano: el campo `password_hash` guarda siempre un hash bcrypt con coste 10.
El campo `email` es la clave de login (no hay username separado) y debe ser único en toda la tabla.
El borrado de un usuario propaga en cascada a sus settings, proyectos, diagramas y sesiones del bot (ON DELETE CASCADE).
