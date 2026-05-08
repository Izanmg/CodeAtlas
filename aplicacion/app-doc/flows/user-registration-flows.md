---
type: flow
id: user-registration
name: Registro de usuario
description: Alta de un nuevo usuario y entrada automática a la aplicación
trigger: el usuario envía el formulario de registro
screens: [register, dashboard]
modules: [auth-frontend, auth-backend]
database: [users]
---

## Steps
- [screen:register] El usuario rellena nombre, email y contraseña en el formulario de registro
- [frontend:auth-frontend/RegisterView.vue/handleRegister] Se valida el formulario y se llama a authStore.register(payload)
- [frontend:auth-frontend/auth.store.js/register] El store delega en authService.register
- [frontend:auth-frontend/auth.service.js/register] Se hace POST /api/auth/register con { email, name, password }
- [backend:auth-backend/auth.controller.js/register] Llega la petición al controller
- [backend:auth-backend/auth.service.js/register] Se valida que email y contraseña cumplen los requisitos mínimos
- [backend:auth-backend/auth.service.js/register] Se hashea la contraseña con bcrypt (saltRounds: 10)
- [backend:auth-backend/auth.repository.js/createUser] Se inserta el usuario nuevo
- [database:users] INSERT con id (UUID), email, name, password_hash
- [backend:auth-backend/auth.service.js/register] Se firma un JWT con expiración 7d y se devuelve { user, token }
- [frontend:auth-frontend/auth.store.js/register] El store guarda usuario + token en localStorage codeatlas:auth
- [screen:dashboard] El router redirige a / y el usuario entra autenticado sin pasar por login

## Error Cases
- Email ya registrado: el backend devuelve 400 con mensaje "Email ya registrado", la vista lo muestra en línea
- Contraseña demasiado corta (< 8 caracteres): el backend devuelve 400 antes de hashear
- Error de red: la vista muestra mensaje genérico y permite reintentar

## Notes
El registro autentica al usuario automáticamente para evitar pedirle login después. El token devuelto por register tiene la misma forma que el de login.
