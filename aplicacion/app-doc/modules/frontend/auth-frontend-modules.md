---
type: module
layer: frontend
id: auth-frontend
name: Auth
description: Gestiona la sesión del usuario — login, registro, logout y actualización de perfil — con estado en Pinia y capa mock temporal en logica-temporal/
screens: [login, register]
consumes-api: []
depends-on: []
folders:
  - id: auth-views
    path: src/modules/auth/views
  - id: auth-stores
    path: src/modules/auth/stores
  - id: auth-mock
    path: src/modules/auth/logica-temporal
files:
  - id: login-view
    folder: auth-views
    path: LoginView.vue
    type: view
  - id: register-view
    folder: auth-views
    path: RegisterView.vue
    type: view
  - id: auth-store
    folder: auth-stores
    path: auth.store.js
    type: store
  - id: auth-mock-file
    folder: auth-mock
    path: auth-mock.js
    type: helper
---

## Purpose

Cubre las pantallas de entrada a la aplicación. Gestiona el estado de sesión global que otros módulos leen para decidir si el usuario está autenticado.

El store mantiene `user` en memoria y delega todas las operaciones (login, register, logout, updateUser) al archivo `auth-mock.js`, que simula la API real. Cuando se conecte el backend, solo cambia `auth-mock.js`.

## State

- user
- isAuthenticated (computed)

## Functions

### login-view
- handleLogin(credentials)
- goToRegister()

### register-view
- handleRegister(payload)
- goToLogin()

### auth-store
- login(credentials)
- register(payload)
- logout()
- updateUser(patch)

### auth-mock-file
- login(credentials)
- register(payload)
- logout()
- updateUser(patch)
- getCurrentUser()

## Notes

`isAuthenticated` es un computed derivado de `user !== null`. El router global lee este valor para proteger las rutas con `meta.requiresAuth`.

La sesión se persiste en `logica-temporal/auth-mock.js` (localStorage o variable de módulo). Cuando se conecte el backend real, `auth-mock.js` se sustituye por una capa de fetch sin tocar el store ni las vistas.
