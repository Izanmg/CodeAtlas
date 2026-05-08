---
type: flow
id: user-login
name: Login de usuario
description: Proceso desde el formulario de login hasta el acceso al dashboard
trigger: el usuario envía el formulario de login
screens: [login, dashboard]
modules: [auth-frontend, auth-backend, settings-frontend, settings-backend]
database: [users, user-settings]
---

## Steps
- [screen:login] El usuario introduce email y contraseña en el formulario y pulsa Iniciar sesión
- [frontend:auth-frontend/LoginView.vue/handleLogin] Se valida el formulario y se llama a authStore.login(credentials)
- [frontend:auth-frontend/auth.store.js/login] El store delega en authService.login y guarda el resultado
- [frontend:auth-frontend/auth.service.js/login] Se hace POST /api/auth/login con { email, password }
- [backend:auth-backend/auth.controller.js/login] Llega la petición al controller
- [backend:auth-backend/auth.service.js/login] Se busca el usuario por email y se compara la contraseña con bcrypt
- [database:users] Se consulta el usuario por email
- [backend:auth-backend/auth.service.js/login] Se firma un JWT con HS256 y expiración 7d
- [frontend:auth-frontend/auth.store.js/login] El store recibe { user, token } y lo guarda en localStorage como codeatlas:auth
- [frontend:settings-frontend/settings.store.js/load] El store de auth dispara settings.load() para sincronizar el tema
- [backend:settings-backend/settings.service.js/getSettings] Se consultan las preferencias del usuario
- [database:user-settings] Se busca la fila del usuario (puede no existir todavía)
- [screen:dashboard] El router navega a / y se renderiza el dashboard con proyectos y diagramas recientes

## Error Cases
- Credenciales inválidas: el backend devuelve 401, la vista muestra un error en línea sin redirigir
- Email no registrado: mismo comportamiento que credenciales inválidas (el backend no distingue para no filtrar información)
- Error de red: la vista muestra un mensaje genérico y permite reintentar

## Notes
El token se firma con `JWT_SECRET` (variable de entorno; en dev usa el fallback `codeatlas_dev_secret`) y caduca a los 7 días. Si no existe fila en user_settings, el backend devuelve los valores por defecto sin crear la fila — la primera escritura la creará vía UPSERT.
