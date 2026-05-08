---
type: flow
id: change-theme
name: Cambiar tema visual
description: Cambiar entre tema claro y oscuro con aplicación inmediata en local y sincronización en segundo plano con el backend
trigger: el usuario selecciona un tema distinto en el bloque "Apariencia" de la pantalla de ajustes
screens: [settings]
modules: [settings-frontend, settings-backend]
database: [user-settings]
---

## Steps
- [screen:settings] El usuario pulsa una opción del Segmented de tema (light / dark)
- [frontend:settings-frontend/SettingsView.vue/onThemeChange] Se llama a settingsStore.setTheme(value)
- [frontend:settings-frontend/settings.store.js/setTheme] El store actualiza `theme` reactivo y aplica el cambio visual al instante (escribe `data-theme="dark"` o lo quita en `document.documentElement`)
- [frontend:settings-frontend/settings.service.js/saveLocal] El store persiste el nuevo valor en localStorage bajo la clave `codeatlas:settings` (sincronización local inmediata)
- [frontend:settings-frontend/settings.service.js/patchSettings] En segundo plano, sin bloquear la UI, se hace PATCH /api/settings con { theme }
- [backend:settings-backend/settings.controller.js/updateSettings] Llega la petición al controller (con requireAuth)
- [backend:settings-backend/settings.service.js/updateSettings] Se llama al repositorio con el patch
- [backend:settings-backend/settings.repository.js/upsert] INSERT ... ON DUPLICATE KEY UPDATE (UPSERT de MySQL): si no existe fila para el usuario, la crea con los valores; si existe, actualiza solo los campos enviados
- [database:user-settings] UPSERT con user_id (PK) + theme

## Error Cases
- Sin sesión activa: requireAuth devuelve 401, el store ignora el error (el cambio local ya se ha aplicado y se reintentará en el próximo `load()`)
- Error de red durante el PATCH: se loguea pero no se revierte el cambio local; el siguiente `load()` resincronizará
- Valor inválido (theme distinto de light/dark): el frontend Segmented solo permite valores válidos, así que no debería darse

## Notes
Este es el único flujo del sistema con **sincronización asimétrica**: el frontend aplica el cambio inmediatamente (cambio visual instantáneo + persistencia local) y el backend se actualiza en segundo plano sin bloquear la UI. Si el backend falla, el cambio local prevalece y se intentará resincronizar la próxima vez que se cargue la app.
La carga inicial al iniciar la app sigue el orden inverso: primero `readLocal()` (para evitar el flash del tema por defecto) y después `fetchSettings()` para resincronizar con el backend si hay diferencias.
La fila de `user_settings` no existe hasta que el usuario cambia algún ajuste por primera vez. Antes de eso, el backend devuelve `{ theme: 'light' }` por defecto sin tocar la BD.
