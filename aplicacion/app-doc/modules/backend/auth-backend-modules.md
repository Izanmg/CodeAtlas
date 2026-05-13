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
    role: Declara los endpoints del módulo. Aplica requireAuth en las rutas privadas (/me y /me/password) y deja públicas las de login y registro.
  - id: auth-controller
    folder: auth-root
    path: auth.controller.js
    type: controller
    imports: [auth-service]
    role: Capa HTTP. Recibe los req/res, extrae el body y los params, delega en el service y mapea los errores conocidos a 400/401/500.
  - id: auth-service
    folder: auth-root
    path: auth.service.js
    type: service
    imports: [auth-repository]
    role: 'Concentra toda la lógica de identidad: validaciones, hash de contraseñas con bcrypt, firma y verificación de JWT.'
  - id: auth-repository
    folder: auth-root
    path: auth.repository.js
    type: repository
    role: Acceso SQL a la tabla users. Genera UUIDs en JS para los inserts y nunca selecciona el campo password_hash en respuestas públicas.
  - id: auth-middleware
    folder: auth-root
    path: auth.middleware.js
    type: middleware
    imports: [auth-service]
    role: Extrae el JWT del header Authorization, lo verifica vía service.verifyToken y deja req.userId disponible para el resto del pipeline.
---

## Purpose
Centraliza toda la lógica de identidad: alta de usuarios, login con email + contraseña, emisión y verificación de JSON Web Tokens, lectura y modificación del perfil propio, y cambio de contraseña. Es la única vía de entrada autenticada del sistema — el resto de módulos delegan en su middleware `requireAuth` para proteger endpoints.

## Functions

### auth-routes
- registra POST /register, POST /login (públicos)
- registra GET /me, PATCH /me, PATCH /me/password (protegidos con requireAuth)

### auth-controller
- register(req, res)
  doc: Delega en service.register y devuelve 201 con { user, token }. Mapea "Email ya registrado" a 400.
- login(req, res)
  doc: Delega en service.login. Devuelve 401 con mensaje genérico si las credenciales fallan, sin distinguir entre email no existe o contraseña incorrecta (no filtra información).
- getMe(req, res)
  doc: Devuelve el usuario actual a partir de req.userId que dejó el middleware. Nunca incluye password_hash.
- updateMe(req, res)
  doc: Actualiza name y/o email del usuario actual. Si llega un email duplicado, captura ER_DUP_ENTRY y devuelve 400.
- changePassword(req, res)
  doc: Verifica la contraseña actual con bcrypt antes de aceptar la nueva. Si la actual es incorrecta devuelve 401.

### auth-service
- register({ email, name, password })
  doc: Valida que el email no exista, hashea la contraseña con bcrypt (saltRounds 10) y crea la fila. Devuelve { user, token } con un JWT recién firmado.
- login({ email, password })
  doc: Busca el usuario por email, compara la contraseña con bcrypt.compare y firma un JWT HS256 con expiración 7d.
- getMe(userId)
  doc: Recupera el usuario por id (sin password_hash). Lanza error si el usuario fue borrado pero el JWT sigue activo.
- updateUser(userId, patch)
  doc: Valida que name no esté vacío y email tenga formato. Permite actualizar solo uno de los dos campos.
- changePassword(userId, { currentPassword, newPassword, confirmPassword })
  doc: Valida new === confirm, comprueba que la actual coincide con el hash almacenado y persiste el nuevo hash. La nueva debe tener al menos 8 caracteres.
- verifyToken(token)
  doc: Verifica la firma del JWT con JWT_SECRET y devuelve el payload. Lanza si el token está expirado o mal firmado.

### auth-repository
- findByEmail(email)
  doc: SELECT por email. Incluye password_hash para que el service pueda compararlo en login.
- findById(id)
  doc: SELECT por id sin password_hash. Lo usa getMe y updateMe.
- createUser({ email, name, passwordHash })
  doc: INSERT con un UUID generado vía randomUUID(). Devuelve el usuario completo recién creado.
- updateUser(id, { name, email })
  doc: UPDATE con COALESCE para permitir actualización parcial (solo se cambia lo que llega no-null).
- updatePassword(id, passwordHash)
  doc: UPDATE aislado del campo password_hash. No toca el resto del usuario.

### auth-middleware
- requireAuth(req, res, next)
  doc: Lee el header Authorization, extrae el Bearer token, lo verifica y deja req.userId. Devuelve 401 si falta o es inválido.

## Notes
Las contraseñas se hashean con bcrypt (saltRounds: 10) antes de guardarse. El `password_hash` nunca sale del backend en ninguna respuesta.
Los JWT se firman con HS256 y `JWT_SECRET` (variable de entorno; en dev usa el fallback `codeatlas_dev_secret`). Caducan a los 7 días.
El middleware `requireAuth` extrae el token del header `Authorization: Bearer <token>`, lo verifica y deja `req.userId` disponible para el resto del pipeline.
