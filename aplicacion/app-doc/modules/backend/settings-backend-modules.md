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
    role: Declara GET y PATCH /api/settings con requireAuth.
  - id: settings-controller
    folder: settings-root
    path: settings.controller.js
    type: controller
    imports: [settings-service]
    role: Capa HTTP fina. Pasa req.userId y el body al service y devuelve el objeto resultante.
  - id: settings-service
    folder: settings-root
    path: settings.service.js
    type: service
    imports: [settings-repository]
    role: "Aplica los valores por defecto cuando el usuario no tiene fila (theme: 'light') y delega en el repositorio para escritura."
  - id: settings-repository
    folder: settings-root
    path: settings.repository.js
    type: repository
    role: Acceso SQL a user_settings. Usa UPSERT (INSERT ... ON DUPLICATE KEY UPDATE) para crear la fila la primera vez o actualizarla.
---

## Purpose
Mantiene las preferencias por usuario. Hoy solo gestiona el tema visual (`light`/`dark`), pero está diseñado para acoger más ajustes en el futuro. Si el usuario no tiene fila en `user_settings`, las consultas devuelven valores por defecto y el primer cambio crea la fila vía UPSERT.

## Functions

### settings-routes
- monta GET / y PATCH / (ambas con requireAuth)

### settings-controller
- getSettings(req, res)
  doc: Devuelve los ajustes del usuario actual o los valores por defecto si no tiene fila todavía.
- updateSettings(req, res)
  doc: Aplica el patch recibido y devuelve los ajustes resultantes.

### settings-service
- getSettings(userId)
  doc: Busca la fila; si no existe devuelve `{ theme: 'light' }` sin crear nada en BD.
- updateSettings(userId, patch)
  doc: Aplica el patch vía UPSERT. La fila se crea si era la primera vez que el usuario cambia algún ajuste.

### settings-repository
- findByUser(userId)
  doc: SELECT WHERE user_id = ?. Devuelve null si no hay fila.
- upsert(userId, { theme })
  doc: INSERT ... ON DUPLICATE KEY UPDATE. Crea la fila con valores por defecto si no existía o actualiza solo los campos que llegan.

## Notes
El service aplica el valor por defecto `{ theme: 'light' }` cuando el repositorio devuelve null (usuario sin fila propia).
La query de actualización usa `INSERT ... ON DUPLICATE KEY UPDATE` (UPSERT de MySQL): si no hay fila para el usuario, la crea; si existe, actualiza solo los campos enviados.
