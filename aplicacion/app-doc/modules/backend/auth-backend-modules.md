---
type: module
layer: backend
id: auth-backend
name: Autenticación
description: Registro, login, sesión por JWT y gestión del perfil del usuario
database: [users]
api:
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/auth/me
  - PATCH /api/auth/me
  - PATCH /api/auth/me/password
depends-on: []
folders:
  - id: auth-root
    path: src/modules/auth
files:
  - id: auth-routes
    folder: auth-root
    path: auth.routes.js
    type: router
    imports: [auth-controller, auth-middleware]
  - id: auth-controller
    folder: auth-root
    path: auth.controller.js
    type: controller
    imports: [auth-service]
  - id: auth-service
    folder: auth-root
    path: auth.service.js
    type: service
    imports: [auth-repository]
  - id: auth-repository
    folder: auth-root
    path: auth.repository.js
    type: repository
  - id: auth-middleware
    folder: auth-root
    path: auth.middleware.js
    type: middleware
    imports: [auth-service]
---

## Purpose
Centraliza toda la lógica de identidad: alta de usuarios, login con email + contraseña, emisión y verificación de JSON Web Tokens, lectura y modificación del perfil propio, y cambio de contraseña. Es la única vía de entrada autenticada del sistema — el resto de módulos delegan en su middleware `requireAuth` para proteger endpoints.

## Functions

### auth-routes
- registra POST /register, POST /login (públicos)
- registra GET /me, PATCH /me, PATCH /me/password (protegidos con requireAuth)

### auth-controller
- register(req, res)
- login(req, res)
- getMe(req, res)
- updateMe(req, res)
- changePassword(req, res)

### auth-service
- register({ email, name, password })
- login({ email, password })
- getMe(userId)
- updateUser(userId, patch)
- changePassword(userId, { currentPassword, newPassword, confirmPassword })
- verifyToken(token)

### auth-repository
- findByEmail(email)
- findById(id)
- createUser({ email, name, passwordHash })
- updateUser(id, { name, email })
- updatePassword(id, passwordHash)

### auth-middleware
- requireAuth(req, res, next)

## Notes
Las contraseñas se hashean con bcrypt (saltRounds: 10) antes de guardarse. El `password_hash` nunca sale del backend en ninguna respuesta.
Los JWT se firman con HS256 y `JWT_SECRET` (variable de entorno; en dev usa el fallback `codeatlas_dev_secret`). Caducan a los 7 días.
El middleware `requireAuth` extrae el token del header `Authorization: Bearer <token>`, lo verifica y deja `req.userId` disponible para el resto del pipeline.
