---
type: flow
id: user-login
name: Login de usuario
description: Proceso desde el formulario de login hasta el acceso al dashboard
trigger: el usuario envía el formulario de login
screens: [login, dashboard]
modules: [auth-frontend, dashboard-frontend]
database: []
---

## Steps

1. El usuario introduce email y contraseña en la pantalla de login y pulsa Iniciar sesión
2. La vista llama a `authStore.login({ email, password })`
3. El store delega a `auth-mock.js`, que verifica las credenciales contra los usuarios semilla
4. Si son correctas, `auth-mock.js` devuelve `{ user }` y el store actualiza `user.value`
5. El router guard detecta que `isAuthenticated` es `true`
6. El frontend redirige a `/` (dashboard)
7. `DashboardView` carga proyectos y diagramas recientes

## Error Cases

- Credenciales incorrectas: `auth-mock.js` rechaza la promesa; la vista muestra el mensaje de error sin redirigir
- Usuario no existente: mismo comportamiento que credenciales incorrectas
