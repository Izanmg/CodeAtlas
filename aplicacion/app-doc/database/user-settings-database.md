---
type: entity
id: user-settings
name: UserSettings
description: Preferencias por usuario (tema visual)
used-by: [settings-backend]
relations:
  - target: users
    type: one-to-one
    field: user_id
---

## Table

```dbml
Table user_settings {
  user_id uuid [pk]
  theme varchar [not null, default: 'light']
}

Ref: user_settings.user_id - users.id
```

## Notes
La PK es directamente `user_id` (relación 1-a-1 con users). No hay registro hasta que el usuario cambia algún ajuste.
El backend hace UPSERT: si no existe fila, la crea con valores por defecto; si existe, actualiza solo los campos enviados.
Valores válidos de `theme`: `light`, `dark`. El valor por defecto es `light`.
