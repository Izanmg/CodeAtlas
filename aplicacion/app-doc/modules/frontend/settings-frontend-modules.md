---
type: module
layer: frontend
id: settings-frontend
name: Settings
description: Pantalla de preferencias del usuario — tema visual (claro/oscuro) y datos de perfil (nombre, email)
screens: [settings]
consumes-api: []
depends-on: [auth-frontend]
folders:
  - id: settings-views
    path: src/modules/settings/views
files:
  - id: settings-view
    folder: settings-views
    path: SettingsView.vue
    type: view
---

## Purpose

Permite al usuario cambiar el tema de la aplicación (claro/oscuro, guardado en localStorage) y actualizar sus datos de perfil. Accede al `ui.store` para el tema y al `auth.store` para el perfil.

## State

Usa los stores de `auth-frontend` y `ui.store` (global). No tiene estado propio.

## Functions

### settings-view
- toggleTheme()
- saveProfile(patch)
