# 07-05 — Base de datos MySQL y módulos backend

## Qué se hizo

Creamos la base de datos MySQL y conectamos todos los módulos del backend.

## Base de datos

- Motor: MySQL, base de datos `codeatlas`
- Conexión con `mysql2` desde `src/database/db.js` (pool de conexiones)
- Schema en `src/database/schema.sql` con tres tablas:
  - `users` — id (UUID), email, name, password_hash, created_at
  - `projects` — id, user_id (FK), name, description, created_at
  - `diagrams` — id, project_id (FK), name, description, model_json, layout_json, created_at
- Las FKs tienen `ON DELETE CASCADE`

## Módulos creados

**Auth** (`/api/auth`)
- `POST /register` — crea usuario, devuelve user + JWT
- `POST /login` — verifica contraseña con bcrypt, devuelve user + JWT
- `GET /me` — usuario autenticado
- `PATCH /me` — actualizar nombre/email
- `PATCH /me/password` — cambiar contraseña (verifica actual, compara nueva con confirmación, mínimo 8 caracteres)
- Middleware `requireAuth` con JWT para proteger rutas

**Projects** (`/api/projects`)
- CRUD completo protegido por JWT
- `diagram_count` calculado con LEFT JOIN en cada query
- Verificación de propiedad en get, update y delete

**Diagrams** (`/api`)
- `GET /projects/:projectId/diagrams` — lista diagramas del proyecto
- `POST /projects/:projectId/diagrams` — genera diagrama llamando al parser, guarda `{ model, layout }` en BD
- `GET /diagrams/:id` — devuelve diagrama con `data: { model, layout }`
- `DELETE /diagrams/:id` — elimina diagrama
- Verificación de propiedad a través del proyecto
