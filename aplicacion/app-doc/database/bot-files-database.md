---
type: entity
id: bot-files
name: BotFile
description: Archivos .md generados por el bot dentro de una sesión, listos para empaquetar en el zip de descarga
used-by: [bot-backend]
relations:
  - target: bot-sessions
    type: many-to-one
    field: session_id
---

## Table

```dbml
Table bot_files {
  session_id uuid [not null]
  path varchar [not null]
  content longtext [not null]
  updated_at timestamp [not null]

  Indexes {
    (session_id, path) [pk]
  }
}

Ref: bot_files.session_id > bot_sessions.id [delete: cascade]
```

## Notes
Clave compuesta `(session_id, path)`. Permite usar `INSERT ... ON DUPLICATE KEY UPDATE content = VALUES(content)` para regenerar un archivo manteniendo el mismo path sin lógica extra en el service.
La elección de dos tablas (`bot_sessions` y `bot_files`) en vez de una sola con `files_json` es para soportar el borrado granular: cuando el usuario pulsa la papelera en el árbol del frontend, basta con `DELETE WHERE session_id = ? AND path = ?` sin tener que reescribir todo el conjunto.
El campo `path` siempre empieza por `app-doc/` (validado en `bot.validator.js` antes de insertar). JSZip usa esos paths directamente para crear la jerarquía de carpetas dentro del zip de descarga sin que el backend tenga que crear los directorios a mano.
El borrado de una sesión propaga a todos sus archivos vía `ON DELETE CASCADE`.
