---
type: module
layer: backend
id: settings-backend
name: Ajustes de usuario
description: Lectura y actualización de las preferencias del usuario autenticado
database: [user-settings]
api:
  - GET /api/settings
  - PATCH /api/settings
depends-on: [auth-backend]
folders:
  - id: settings-root
    path: src/modules/settings
files:
  - id: settings-routes
    folder: settings-root
    path: settings.routes.js
    type: router
    imports: [settings-controller]
  - id: settings-controller
    folder: settings-root
    path: settings.controller.js
    type: controller
    imports: [settings-service]
  - id: settings-service
    folder: settings-root
    path: settings.service.js
    type: service
    imports: [settings-repository]
  - id: settings-repository
    folder: settings-root
    path: settings.repository.js
    type: repository
---

## Purpose
Mantiene las preferencias por usuario. Hoy solo gestiona el tema visual (`light`/`dark`), pero está diseñado para acoger más ajustes en el futuro. Si el usuario no tiene fila en `user_settings`, las consultas devuelven valores por defecto y el primer cambio crea la fila vía UPSERT.

## Functions

### settings-routes
- monta GET / y PATCH / (ambas con requireAuth)

### settings-controller
- getSettings(req, res)
- updateSettings(req, res)

### settings-service
- getSettings(userId)
- updateSettings(userId, patch)

### settings-repository
- findByUser(userId)
- upsert(userId, { theme })

## Notes
El service aplica el valor por defecto `{ theme: 'light' }` cuando el repositorio devuelve null (usuario sin fila propia).
La query de actualización usa `INSERT ... ON DUPLICATE KEY UPDATE` (UPSERT de MySQL): si no hay fila para el usuario, la crea; si existe, actualiza solo los campos enviados.
