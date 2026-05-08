# Formato completo — Módulos

Este documento es la referencia exhaustiva para generar los archivos de módulo que CodeAtlas necesita. Cubre tres tipos de archivo:

- `project-docs/01-modules.md` — el índice general de módulos
- `project-docs/modules/backend/{id}-backend-modules.md` — uno por módulo de backend
- `project-docs/modules/frontend/{id}-frontend-modules.md` — uno por módulo de frontend

---

## 1. Índice de módulos (`01-modules.md`)

### Propósito

Es el punto de entrada del parser para los módulos. Define dos cosas:

1. La lista completa de módulos del proyecto (los IDs que los demás archivos pueden referenciar).
2. El vocabulario de tipos de archivo válidos para este proyecto (lo que puede ponerse en el campo `type` de los objetos `files` en los módulos individuales).

### Ruta

```
project-docs/01-modules.md
```

### Formato completo

```markdown
---
type: modules-index
backend:
  - id: auth-backend
    name: Authentication
  - id: projects-backend
    name: Projects
  - id: diagrams-backend
    name: Diagrams
frontend:
  - id: auth-frontend
    name: Auth Views
  - id: projects-frontend
    name: Projects Views
  - id: settings-frontend
    name: Settings
file-types:
  backend:
    - controller
    - service
    - repository
    - middleware
    - helper
    - model
  frontend:
    - component
    - view
    - store
    - composable
    - helper
    - router
---

## Overview
Brief description of how the modules are organized and the overall architecture approach.
```

### Referencia de campos del frontmatter

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `type` | string | **sí** | Siempre `modules-index` |
| `backend` | array de objetos | **sí** | Lista de módulos de backend. Puede ser lista vacía `[]` si no hay backend |
| `backend[].id` | string | **sí** | ID único del módulo. Debe coincidir con el nombre de archivo antes de `-backend-modules.md` |
| `backend[].name` | string | **sí** | Nombre legible del módulo |
| `frontend` | array de objetos | **sí** | Lista de módulos de frontend. Puede ser lista vacía `[]` si no hay frontend |
| `frontend[].id` | string | **sí** | ID único del módulo. Debe coincidir con el nombre de archivo antes de `-frontend-modules.md` |
| `frontend[].name` | string | **sí** | Nombre legible del módulo |
| `file-types` | objeto | **sí** | Vocabulario de tipos de archivo del proyecto, separado por capa |
| `file-types.backend` | array de strings | **sí** | Tipos válidos para el campo `type` en `files` de módulos backend |
| `file-types.frontend` | array de strings | **sí** | Tipos válidos para el campo `type` en `files` de módulos frontend |

### Referencia de secciones

| Sección | Obligatoria | Contenido |
|---------|-------------|-----------|
| `## Overview` | **sí** | Descripción breve de cómo se organizan los módulos y el enfoque arquitectónico del proyecto |

### Tipos de archivo predefinidos recomendados

**Backend:**

| Tipo | Descripción |
|------|-------------|
| `controller` | Gestiona las peticiones HTTP y delega al servicio |
| `service` | Contiene la lógica de negocio |
| `repository` | Gestiona el acceso a la base de datos |
| `middleware` | Lógica entre la petición y el controlador |
| `model` | Define la estructura de datos de la entidad |
| `helper` | Funciones auxiliares reutilizables |
| `router` | Define las rutas del módulo |

**Frontend:**

| Tipo | Descripción |
|------|-------------|
| `view` | Componente que representa una pantalla completa |
| `component` | Componente de interfaz reutilizable |
| `store` | Gestión del estado del módulo (Pinia, Vuex, Redux...) |
| `composable` | Lógica reutilizable encapsulada (Vue) |
| `hook` | Lógica reutilizable encapsulada (React) |
| `helper` | Funciones auxiliares reutilizables |
| `router` | Definición de rutas del módulo |

Estos tipos son sugerencias. El proyecto puede añadir los suyos propios según el stack.

### Preguntas para extraer la información del usuario

1. ¿Tiene la aplicación backend, frontend o ambos?
2. ¿Cuáles son los módulos o áreas funcionales principales del backend? (ejemplos: autenticación, gestión de proyectos, notificaciones)
3. ¿Y los del frontend? ¿Coinciden con los del backend o son distintos?
4. ¿Qué tecnología usa el backend? (para sugerir tipos de archivo apropiados)
5. ¿Qué tecnología usa el frontend? (para sugerir tipos de archivo: `composable` si es Vue, `hook` si es React)
6. Además de los tipos estándar, ¿usa el proyecto algún tipo de archivo especial que quiera documentar?

---

## 2. Módulo de backend

### Propósito

Documenta un módulo del servidor: sus endpoints, las entidades de base de datos que usa, sus dependencias con otros módulos, y opcionalmente su estructura interna de carpetas y archivos con sus funciones.

### Ruta

```
project-docs/modules/backend/{id}-backend-modules.md
```

El `{id}` debe coincidir exactamente con el `id` declarado en `01-modules.md` para este módulo.

### Formato completo (todos los campos)

```markdown
---
type: module
layer: backend
id: auth-backend
name: Authentication
description: Handles user identity, session management and access control
database: [users, sessions]
api:
  - POST /auth/login
  - POST /auth/register
  - POST /auth/logout
  - GET /auth/me
depends-on: []
folders:
  - id: controllers
    path: src/modules/auth/controllers
  - id: services
    path: src/modules/auth/services
  - id: repositories
    path: src/modules/auth/repositories
files:
  - id: auth-controller
    folder: controllers
    path: auth.controller.js
    type: controller
    imports: [auth-service]
  - id: auth-service
    folder: services
    path: auth.service.js
    type: service
    imports: [auth-repository]
  - id: auth-repository
    folder: repositories
    path: auth.repository.js
    type: repository
---

## Purpose
Centralizes all logic related to user authentication. Validates credentials,
creates and revokes session tokens, and exposes the current user data to
other modules that need it.

## Functions

### auth-controller
- login(req, res)
- register(req, res)
- logout(req, res)
- getMe(req, res)

### auth-service
- validateCredentials(username, password)
- generateToken(userId)
- revokeToken(token)
- hashPassword(password)

### auth-repository
- findByUsername(username)
- createUser(userData)
- saveSession(userId, token)
- deleteSession(token)

## Notes
Passwords are always hashed with bcrypt before storage.
Session tokens are JWT with a 24-hour expiry stored in the sessions table.
```

### Referencia de campos del frontmatter

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `type` | string | **sí** | Siempre `module` |
| `layer` | string | **sí** | Siempre `backend` |
| `id` | string | **sí** | Identificador único. Debe coincidir con el nombre del archivo antes de `-backend-modules.md` y con lo declarado en `01-modules.md` |
| `name` | string | **sí** | Nombre legible del módulo |
| `description` | string | **sí** | Descripción breve en una sola línea |
| `database` | array de IDs | **sí** | IDs de entidades de base de datos que usa este módulo. Cada ID apunta a `database/{id}-database.md`. Lista vacía `[]` si no usa ninguna |
| `api` | array de strings | **sí** | Endpoints que expone este módulo, en formato `MÉTODO /ruta`. Lista vacía `[]` si no expone ninguno |
| `depends-on` | array de IDs | **sí** | IDs de otros módulos de backend de los que depende. Lista vacía `[]` si no depende de ninguno |
| `folders` | array de objetos | no | Subcarpetas internas del módulo |
| `folders[].id` | string | (si folders) | Identificador de la carpeta, usado en el campo `folder` de los archivos |
| `folders[].path` | string | (si folders) | Ruta relativa de la carpeta dentro del proyecto |
| `files` | array de objetos | no | Archivos del módulo |
| `files[].id` | string | (si files) | Identificador del archivo, usado en pantallas y flujos para referenciarlo |
| `files[].folder` | string | no | ID de la carpeta donde vive este archivo. Si se omite, el archivo está en la raíz del módulo |
| `files[].path` | string | (si files) | Nombre o ruta relativa del archivo |
| `files[].type` | string | (si files) | Tipo del archivo. Debe ser uno de los declarados en `file-types.backend` del índice |
| `files[].imports` | array de IDs | no | IDs de **otros archivos del mismo módulo** que este archivo importa o usa. Genera aristas en la vista detallada del módulo. Las dependencias entre módulos van en `depends-on` del módulo, no aquí |

### Referencia de secciones Markdown

| Sección | Obligatoria | Contenido |
|---------|-------------|-----------|
| `## Purpose` | **sí** | Qué hace el módulo, qué problema resuelve, qué responsabilidad tiene |
| `## Functions` | no | Funciones del módulo. Ver formato detallado más abajo |
| `## Notes` | no | Decisiones técnicas relevantes o restricciones específicas de este módulo |

### Formato de `## Functions`

**Sin estructura** (cuando no se han declarado `files` o se quiere una lista plana):

```markdown
## Functions
- login(username, password)
- register(username, password)
- validateSession(token)
- hashPassword(password)
```

**Con subsecciones** (cuando se quiere vincular cada función a su archivo):

```markdown
## Functions

### auth-controller
- login(req, res)
- register(req, res)

### auth-service
- validateCredentials(username, password)
- generateToken(userId)
```

El nombre de cada subsección (`### auth-controller`) debe coincidir con el `id` de un archivo declarado en `files`. El parser construye la jerarquía módulo → carpeta → archivo → función a partir de esta información.

### Preguntas para extraer la información del usuario

1. ¿Cómo se llama este módulo y qué hace?
2. ¿Qué endpoints expone? (método HTTP + ruta para cada uno)
3. ¿Qué tablas o colecciones de base de datos lee o modifica?
4. ¿Depende de algún otro módulo de backend?
5. ¿Quieres documentar la estructura interna del módulo (carpetas y archivos)?
   - Si sí: ¿qué carpetas tiene y cuál es su ruta?
   - ¿Qué archivos hay en cada carpeta? (nombre, tipo: controller/service/repository…)
   - ¿Quieres listar las funciones de cada archivo?

---

## 3. Módulo de frontend

### Propósito

Documenta un módulo del cliente: las pantallas que contiene, los módulos de backend cuya API consume, sus dependencias con otros módulos de frontend, y opcionalmente su estructura interna con estado, archivos y funciones.

### Ruta

```
project-docs/modules/frontend/{id}-frontend-modules.md
```

### Formato completo (todos los campos)

```markdown
---
type: module
layer: frontend
id: auth-frontend
name: Auth Views
description: Handles the login and registration UI and session state
screens: [login, register]
consumes-api: [auth-backend]
depends-on: []
folders:
  - id: views
    path: src/modules/auth/views
  - id: stores
    path: src/modules/auth/stores
files:
  - id: login-view
    folder: views
    path: LoginView.vue
    type: view
  - id: register-view
    folder: views
    path: RegisterView.vue
    type: view
  - id: auth-store
    folder: stores
    path: auth.store.js
    type: store
---

## Purpose
Covers the authentication screens of the application. Manages the session
state and communicates with the auth backend module to validate credentials
and maintain the user session.

## State
- currentUser
- isAuthenticated
- authError
- isLoading

## Functions

### login-view
- handleLogin(username, password)
- goToRegister()

### register-view
- handleRegister(username, password, birthDate)
- goToLogin()

### auth-store
- setCurrentUser(user)
- clearSession()
- checkSession()

## Notes
The session token is stored in localStorage under the key auth_token.
```

### Referencia de campos del frontmatter

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `type` | string | **sí** | Siempre `module` |
| `layer` | string | **sí** | Siempre `frontend` |
| `id` | string | **sí** | Identificador único. Debe coincidir con el nombre del archivo antes de `-frontend-modules.md` y con lo declarado en `01-modules.md` |
| `name` | string | **sí** | Nombre legible del módulo |
| `description` | string | **sí** | Descripción breve en una sola línea |
| `screens` | array de IDs | **sí** | IDs de pantallas que pertenecen a este módulo. Cada ID apunta a `screens/{id}-screens.md`. Lista vacía `[]` si no tiene pantallas todavía documentadas |
| `consumes-api` | array de IDs | **sí** | IDs de módulos de backend cuya API consume. Lista vacía `[]` si no consume ninguna |
| `depends-on` | array de IDs | **sí** | IDs de otros módulos de frontend de los que depende. Lista vacía `[]` si no depende de ninguno |
| `folders` | array de objetos | no | Subcarpetas internas del módulo. Misma estructura que en backend |
| `files` | array de objetos | no | Archivos del módulo. Misma estructura que en backend |

### Referencia de secciones Markdown

| Sección | Obligatoria | Contenido |
|---------|-------------|-----------|
| `## Purpose` | **sí** | Qué parte de la interfaz cubre, qué problema resuelve para el usuario |
| `## State` | no | Variables de estado principales que gestiona el módulo (una por línea como lista) |
| `## Functions` | no | Funciones, handlers y métodos del módulo. Mismo formato que en backend (plana o con subsecciones por archivo) |
| `## Notes` | no | Decisiones técnicas relevantes o restricciones del módulo |

### Preguntas para extraer la información del usuario

1. ¿Qué parte de la interfaz cubre este módulo?
2. ¿Qué pantallas tiene? (las listarás en el campo `screens` — deben coincidir con los IDs de los archivos de pantalla)
3. ¿Consume alguna API de backend? ¿De qué módulos?
4. ¿Depende de algún otro módulo de frontend?
5. ¿Tiene estado propio? ¿Qué variables maneja?
6. ¿Quieres documentar la estructura interna? (mismas preguntas que en backend)

---

## Cómo funcionan las referencias cruzadas

| Campo | El parser busca en... |
|-------|----------------------|
| `database` (backend) | `project-docs/database/{id}-database.md` |
| `screens` (frontend) | `project-docs/screens/{id}-screens.md` |
| `consumes-api` (frontend) | `project-docs/modules/backend/{id}-backend-modules.md` |
| `depends-on` (backend) | `project-docs/modules/backend/{id}-backend-modules.md` |
| `depends-on` (frontend) | `project-docs/modules/frontend/{id}-frontend-modules.md` |

Si el parser encuentra un ID en estas listas que no tiene su archivo correspondiente, genera una **advertencia** (no un error). El parseo no falla, pero el diagrama mostrará la referencia como rota.

---

## Jerarquía visual que produce el parser

Cuando se declaran `folders` y `files`, el parser puede construir la vista detallada:

```
módulo (auth-backend)
├── carpeta (controllers)
│   └── archivo (auth-controller, type: controller)
│       ├── login(req, res)
│       └── register(req, res)
└── carpeta (services)
    └── archivo (auth-service, type: service)
        ├── validateCredentials(username, password)
        └── generateToken(userId)
```

Esta jerarquía es completamente opcional. Si no se declaran `folders` ni `files`, el módulo se representa como un nodo con sus funciones directamente asociadas.

---

## Errores comunes y cómo evitarlos

| Error | Causa | Solución |
|-------|-------|----------|
| El parser descarta el archivo sin avisar | El frontmatter no está delimitado por `---` correctamente | Asegúrate de que la primera línea es `---` y el cierre del frontmatter también |
| `[archivo] falta el campo requerido "database"` | Se omitió `database` en un módulo de backend | Añade `database: []` aunque no use ninguna entidad |
| `[archivo] falta el campo requerido "screens"` | Se omitió `screens` en un módulo de frontend | Añade `screens: []` aunque no tenga pantallas documentadas todavía |
| `[archivo] el campo "depends-on" debe ser array` | Se escribió `depends-on: null` o se omitió | Usa `depends-on: []` |
| `[archivo] valor inválido "..." para el campo "layer"` | Se usó un valor distinto de `backend` o `frontend` | El campo `layer` solo acepta esos dos valores exactos |
