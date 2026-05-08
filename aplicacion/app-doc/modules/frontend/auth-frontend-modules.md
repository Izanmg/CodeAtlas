---
type: module
layer: frontend
id: auth-frontend
name: Pantallas de autenticación
description: Login, registro y gestión de sesión en el cliente
screens: [login, register]
consumes-api: [auth-backend]
depends-on: []
folders:
  - id: views
    path: src/modules/auth/views
  - id: components
    path: src/modules/auth/components
  - id: stores
    path: src/modules/auth/stores
  - id: services
    path: src/modules/auth/services
files:
  - id: login-view
    folder: views
    path: LoginView.vue
    type: view
    imports: [auth-store, auth-shell]
  - id: register-view
    folder: views
    path: RegisterView.vue
    type: view
    imports: [auth-store, auth-shell]
  - id: auth-shell
    folder: components
    path: AuthShell.vue
    type: component
    imports: [auth-visual-side]
  - id: auth-visual-side
    folder: components
    path: AuthVisualSide.vue
    type: component
  - id: auth-store
    folder: stores
    path: auth.store.js
    type: store
    imports: [auth-frontend-service]
  - id: auth-frontend-service
    folder: services
    path: auth.service.js
    type: service
---

## Purpose
Cubre las pantallas de entrada al sistema (login, registro) y mantiene el estado de sesión en el cliente. El store guarda el usuario autenticado y el token JWT en localStorage bajo la clave `codeatlas:auth`. Ningún otro módulo del frontend gestiona credenciales — todos consultan `useAuthStore()` para saber si hay sesión activa.

## State
- user
- isAuthenticated

## Functions

### login-view
- handleLogin()
- goToRegister()

### register-view
- handleRegister()
- goToLogin()

### auth-store
- login(credentials)
- register(payload)
- logout()
- updateUser(patch)
- changePassword(payload)

### auth-frontend-service
- login({ email, password })
- register({ name, email, password })
- getCurrentUser()
- logout()
- updateUser(patch)
- changePassword(payload)

## Notes
Tras un login o registro exitoso, el store de auth dispara también `useSettingsStore().load()` para sincronizar las preferencias del usuario; al cerrar sesión llama a `useSettingsStore().reset()` para limpiar las preferencias locales.
El cliente HTTP (`src/lib/http.js`) lee el token desde `codeatlas:auth` y lo añade automáticamente a todas las peticiones como `Authorization: Bearer <token>`.
Las iniciales del usuario (mostradas en el avatar del header) se calculan en el service a partir de las dos primeras palabras del nombre.
