---
type: flow
id: logout
name: Cerrar sesión
description: Limpiar sesión y preferencias en cliente y redirigir al login
trigger: el usuario pulsa el botón Cerrar sesión en ajustes
screens: [settings, login]
modules: [auth-frontend, settings-frontend]
database: []
---

## Steps
- [screen:settings] El usuario pulsa el botón "Cerrar sesión" en la pantalla de ajustes
- [frontend:settings-frontend/SettingsView.vue] El handler llama a authStore.logout()
- [frontend:auth-frontend/auth.store.js/logout] El store limpia el ref de `user` (queda null) y `isAuthenticated` (queda false)
- [frontend:auth-frontend/auth.service.js/logout] Se elimina la entrada `codeatlas:auth` del localStorage
- [frontend:settings-frontend/settings.store.js/reset] El store de auth dispara `useSettingsStore().reset()` para limpiar las preferencias del usuario en local
- [frontend:settings-frontend/settings.service.js/clearLocal] Se elimina la entrada `codeatlas:settings` del localStorage
- [frontend:settings-frontend/settings.store.js/reset] El store reaplica el tema por defecto (light) en `document.documentElement`
- [screen:login] El router navega a /login y el guard global confirma que no hay sesión activa

## Error Cases
- (Ninguno relevante: el logout es local y no puede fallar)
- Si el navegador tiene localStorage deshabilitado, el `removeItem` simplemente no hace nada — el ref ya se ha limpiado en memoria, así que la sesión queda cerrada para esta carga de la app

## Notes
**No hay endpoint de logout en el backend.** Los JWT son stateless: caducan a los 7 días y no se mantiene un registro de tokens activos. Cerrar sesión es por tanto una operación puramente cliente — basta con borrar el token del localStorage para que las siguientes peticiones no se autentiquen.
La limpieza de preferencias es importante: si dos usuarios distintos comparten el mismo navegador, el segundo no debería heredar el tema (u otras futuras preferencias) del primero. Por eso `auth.logout` siempre dispara `settings.reset`.
El reaplicado del tema por defecto (light) evita que el usuario vea la pantalla de login en modo oscuro si la sesión cerrada lo tenía activado — la apariencia se reinicia con la sesión.
Si en el futuro se añadieran más stores con datos por usuario (favoritos, filtros guardados, etc.), `auth.logout` debería disparar también su reset correspondiente. La regla es: cualquier dato vinculado al usuario en localStorage se limpia aquí.
