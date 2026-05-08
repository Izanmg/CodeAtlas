---
type: module
layer: frontend
id: settings-frontend
name: Ajustes
description: Pantalla de ajustes del usuario y store del tema visual
screens: [settings]
consumes-api: [settings-backend, auth-backend]
depends-on: [auth-frontend]
folders:
  - id: views
    path: src/modules/settings/views
  - id: stores
    path: src/modules/settings/stores
  - id: services
    path: src/modules/settings/services
files:
  - id: settings-view
    folder: views
    path: SettingsView.vue
    type: view
  - id: settings-store
    folder: stores
    path: settings.store.js
    type: store
  - id: settings-frontend-service
    folder: services
    path: settings.service.js
    type: service
---

## Purpose
Gestiona las preferencias del usuario en el cliente. Aplica el tema visual (claro/oscuro) escribiendo `data-theme="dark"` en `document.documentElement`. La sincronización con el backend es asimétrica: el cambio se aplica primero en local (cambio inmediato del tema) y se envía al backend en segundo plano.

## State
- theme

## Functions

### settings-view
- onThemeChange(value)
- handleUpdateProfile(payload)
- handleChangePassword(payload)

### settings-store
- load()
- setTheme(value)
- toggleTheme()
- reset()

### settings-frontend-service
- readLocal()
- saveLocal(settings)
- clearLocal()
- fetchSettings()
- patchSettings(patch)

## Notes
La store guarda los ajustes en localStorage bajo la clave `codeatlas:settings`. Al iniciar la app se cargan los locales primero (para evitar flash del tema por defecto) y se sincronizan con el backend después.
La pantalla de Settings también permite editar el perfil (nombre, email) y cambiar la contraseña — esas acciones delegan en `useAuthStore()` (no son responsabilidad propia del módulo).
La acción `reset()` se llama desde `auth.store.logout()` para limpiar las preferencias del usuario al cerrar sesión.
