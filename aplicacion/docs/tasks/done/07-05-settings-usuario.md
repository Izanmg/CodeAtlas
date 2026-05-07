# 07-05 — Módulo de settings de usuario

## Qué se hizo

Se creó un sistema completo de preferencias de usuario vinculadas a la cuenta, con persistencia en base de datos y caché en localStorage.

## Base de datos

Nueva tabla `user_settings`:
- `user_id` (PK, FK → users, CASCADE)
- `theme` VARCHAR(20), default `'light'`

## Backend — nuevo módulo `settings/`

- `settings.repository.js` — `findByUser` y `upsert` con `ON DUPLICATE KEY UPDATE`
- `settings.service.js` — `getSettings` (devuelve defaults si no hay registro) y `updateSettings`
- `settings.controller.js` — handlers GET y PATCH
- `settings.routes.js` — rutas bajo `/api/settings`, protegidas con `requireAuth`
- Registrado en `app.js` como `app.use('/api/settings', settingsRoutes)`

## Frontend — nuevo módulo `settings/`

- `services/settings.service.js` — `fetchSettings`, `patchSettings`, `readLocal`, `saveLocal`, `clearLocal`
- `stores/settings.store.js` — sustituye al antiguo `ui.store.js`:
  - Lee el tema de localStorage en el arranque para evitar parpadeo
  - `load()` — sincroniza con la API tras login o refresco de página
  - `setTheme(value)` — actualiza store + localStorage + DOM + persiste en la API
  - `toggleTheme()` — alterna entre claro y oscuro
  - `reset()` — vuelve a 'light' y limpia localStorage al cerrar sesión

## Flujo de carga

1. App arranca → `settings.store` lee localStorage → aplica tema sin parpadeo
2. Login/register → `auth.store` llama `settingsStore.load()` → sincroniza con BD
3. Refresco de página con sesión activa → `App.vue` llama `settingsStore.load()` en `onMounted`
4. Logout → `settingsStore.reset()` → vuelve a blanco y limpia cache

## Otros cambios

- Eliminado `src/stores/ui.store.js`
- `AppTopbar.vue` usa `settingsStore.toggleTheme()` en el botón de luna/sol
- `SettingsView.vue` usa `settingsStore.setTheme()` en el selector de tema
- Eliminado el apartado de atajos de teclado de la pantalla de preferencias
