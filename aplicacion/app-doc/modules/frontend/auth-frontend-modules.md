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
    role: Pantalla pública de login. Valida formato del formulario y delega en authStore.login. Redirige al dashboard tras éxito.
  - id: register-view
    folder: views
    path: RegisterView.vue
    type: view
    imports: [auth-store, auth-shell]
    role: Pantalla pública de registro. Crea usuario y entra autenticado sin pasar por login.
  - id: auth-shell
    folder: components
    path: AuthShell.vue
    type: component
    imports: [auth-visual-side]
    role: Layout compartido por login y register. Divide la pantalla en lado visual (izquierda) y formulario (derecha).
  - id: auth-visual-side
    folder: components
    path: AuthVisualSide.vue
    type: component
    role: Mitad izquierda decorativa del AuthShell, con el logo grande y degradado del color accent.
  - id: auth-store
    folder: stores
    path: auth.store.js
    type: store
    imports: [auth-frontend-service]
    role: Estado global de sesión. Único responsable de leer/escribir el JWT y el user en localStorage bajo `codeatlas:auth`.
  - id: auth-frontend-service
    folder: services
    path: auth.service.js
    type: service
    role: Cliente HTTP del módulo. Llama a los endpoints /api/auth y normaliza los campos (snake_case → camelCase, deriva initials, etc.).
---

## Purpose
Cubre las pantallas de entrada al sistema (login, registro) y mantiene el estado de sesión en el cliente. El store guarda el usuario autenticado y el token JWT en localStorage bajo la clave `codeatlas:auth`. Ningún otro módulo del frontend gestiona credenciales — todos consultan `useAuthStore()` para saber si hay sesión activa.

## State
- user
- isAuthenticated

## Functions

### login-view
- handleLogin()
  doc: Valida que email y contraseña no estén vacíos y llama a authStore.login. Muestra el error en línea si falla.
- goToRegister()
  doc: Navega a /register sin perder el email ya escrito (lo pasa por query).

### register-view
- handleRegister()
  doc: Valida formato y delega en authStore.register. Tras éxito el usuario queda autenticado automáticamente.
- goToLogin()
  doc: Navega a /login.

### auth-store
- login(credentials)
  doc: Llama al service, guarda { user, token } en estado y en localStorage, y dispara settings.load() para traer las preferencias.
- register(payload)
  doc: Igual que login pero contra /register. El backend devuelve usuario+token recién creados.
- logout()
  doc: Limpia user y token del estado y localStorage, y dispara settings.reset() para vaciar preferencias del usuario.
- updateUser(patch)
  doc: Llama a service.updateUser, actualiza el ref de user y, si cambió el email, reescribe la entrada de localStorage codeatlas:auth.
- changePassword(payload)
  doc: Forward al service. No modifica el estado local (el JWT sigue siendo válido tras cambiar la contraseña).

### auth-frontend-service
- login({ email, password })
  doc: POST /api/auth/login. Devuelve { user, token } normalizado (con `initials` derivado del nombre).
- register({ name, email, password })
  doc: POST /api/auth/register. Misma forma de respuesta que login.
- getCurrentUser()
  doc: GET /api/auth/me. Usado al arrancar la app para validar que el JWT del localStorage sigue vigente.
- logout()
  doc: Elimina la entrada codeatlas:auth del localStorage. No hace llamada al backend (JWT stateless).
- updateUser(patch)
  doc: PATCH /api/auth/me con { name, email }. Devuelve el usuario actualizado.
- changePassword(payload)
  doc: PATCH /api/auth/me/password con { currentPassword, newPassword, confirmPassword }.

## Notes
Tras un login o registro exitoso, el store de auth dispara también `useSettingsStore().load()` para sincronizar las preferencias del usuario; al cerrar sesión llama a `useSettingsStore().reset()` para limpiar las preferencias locales.
El cliente HTTP (`src/lib/http.js`) lee el token desde `codeatlas:auth` y lo añade automáticamente a todas las peticiones como `Authorization: Bearer <token>`.
Las iniciales del usuario (mostradas en el avatar del header) se calculan en el service a partir de las dos primeras palabras del nombre.
