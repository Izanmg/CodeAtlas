---
type: entity
id: bot-sessions
name: BotSession
description: Cada conversación del usuario con el asistente IA, con su historial completo
used-by: [bot-backend]
relations:
  - target: users
    type: many-to-one
    field: user_id
  - target: bot-files
    type: one-to-many
    field: session_id
---

## Table

```dbml
Table bot_sessions {
  id uuid [pk]
  user_id uuid [not null]
  title varchar [not null, default: 'Nueva conversación']
  history_json longtext [not null]
  created_at timestamp [not null, default: 'CURRENT_TIMESTAMP']
  updated_at timestamp [not null]

  Indexes {
    (user_id, updated_at) [name: 'idx_bot_sessions_user']
  }
}

Ref: bot_sessions.user_id > users.id [delete: cascade]
Ref: bot_sessions.id < bot_files.session_id [delete: cascade]
```

## Notes
Una fila por conversación. Un usuario puede tener tantas sesiones como quiera; el listado del frontend las ordena por `updated_at DESC` para mostrar las más recientes primero.
El campo `history_json` guarda el array completo de mensajes serializado (`[{ role: 'user'|'model', text }]`). Se sobreescribe entero en cada turno; aceptable porque el historial pesa pocos KB y rara vez supera los cientos de mensajes.
El campo `updated_at` se actualiza automáticamente vía `ON UPDATE CURRENT_TIMESTAMP` cada vez que se añade un mensaje, lo que mantiene el ordenado del listado siempre coherente.
El título por defecto es "Nueva conversación". El backend lo renombra automáticamente con los primeros ~50 caracteres del primer mensaje del usuario (vía `deriveTitle` en `bot.service.js`).
El borrado de un usuario propaga a todas sus sesiones (`ON DELETE CASCADE`), y el borrado de una sesión propaga a todos sus archivos.
