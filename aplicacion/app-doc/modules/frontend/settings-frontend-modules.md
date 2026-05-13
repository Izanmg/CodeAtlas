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
    imports: [settings-store]
    role: Pantalla de ajustes con tres bloques (apariencia, perfil, contraseña) y botón de logout. Delega cada acción en el store correspondiente.
  - id: settings-store
    folder: stores
    path: settings.store.js
    type: store
    imports: [settings-frontend-service]
    role: Estado global de preferencias. Aplica el tema visual al instante (escribe data-theme en document.documentElement) y sincroniza con el backend en segundo plano.
  - id: settings-frontend-service
    folder: services
    path: settings.service.js
    type: service
    role: 'Capa de persistencia mixta: localStorage para acceso inmediato y HTTP para sincronización remota. Centraliza la clave `codeatlas:settings`.'
---

## Purpose
Gestiona las preferencias del usuario en el cliente. Aplica el tema visual (claro/oscuro) escribiendo `data-theme="dark"` en `document.documentElement`. La sincronización con el backend es asimétrica: el cambio se aplica primero en local (cambio inmediato del tema) y se envía al backend en segundo plano.

## State
- theme

## Functions

### settings-view
- onThemeChange(value)
  doc: Llama a settingsStore.setTheme. El cambio visual es instantáneo.
- handleUpdateProfile(payload)
  doc: Delega en authStore.updateUser y muestra mensaje de éxito o error en el bloque de perfil.
- handleChangePassword(payload)
  doc: Valida que las contraseñas coincidan en local y delega en authStore.changePassword.

### settings-store
- load()
  doc: Lee primero localStorage (para evitar flash del tema por defecto) y después llama a fetchSettings para resincronizar.
- setTheme(value)
  doc: Actualiza el ref, aplica `data-theme` en document.documentElement, guarda en localStorage y dispara PATCH al backend en background.
- toggleTheme()
  doc: Alterna entre light y dark llamando a setTheme con el opuesto.
- reset()
  doc: Limpia el estado y localStorage, y reaplica el tema por defecto (light). Lo llama auth.logout.

### settings-frontend-service
- readLocal()
  doc: Lee y parsea la clave `codeatlas:settings` del localStorage. Devuelve los defaults si no existe.
- saveLocal(settings)
  doc: Persiste el objeto completo de ajustes como JSON en localStorage.
- clearLocal()
  doc: Elimina la entrada del localStorage. Llamado desde reset().
- fetchSettings()
  doc: GET /api/settings. Devuelve los ajustes del servidor o los defaults si el usuario no tiene fila.
- patchSettings(patch)
  doc: PATCH /api/settings con el delta. Fire-and-forget desde setTheme (errores se loguean, no se propagan).

## Notes
La store guarda los ajustes en localStorage bajo la clave `codeatlas:settings`. Al iniciar la app se cargan los locales primero (para evitar flash del tema por defecto) y se sincronizan con el backend después.
La pantalla de Settings también permite editar el perfil (nombre, email) y cambiar la contraseña — esas acciones delegan en `useAuthStore()` (no son responsabilidad propia del módulo).
La acción `reset()` se llama desde `auth.store.logout()` para limpiar las preferencias del usuario al cerrar sesión.
