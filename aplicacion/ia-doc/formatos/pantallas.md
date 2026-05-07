# Formato completo — Pantallas

Este documento es la referencia exhaustiva para generar los archivos de pantalla que CodeAtlas necesita.

Las pantallas pertenecen exclusivamente al frontend. No existe división por capas.

---

## Propósito del tipo `screen`

Un archivo de pantalla documenta una **vista concreta de la interfaz**: qué muestra al usuario, qué acciones permite realizar, a qué otras pantallas puede navegar, y en qué módulo frontend vive.

La diferencia con un módulo es que el módulo describe la unidad funcional (el código, el estado, los archivos), mientras que la pantalla describe lo que el usuario ve y hace en un momento concreto de la aplicación.

---

## Ruta

```
project-docs/screens/{id}-screens.md
```

El `{id}` debe ser único, en minúsculas y con guiones en lugar de espacios. Debe coincidir con el `id` que el módulo frontend referencia en su campo `screens`.

---

## Formato completo (todos los campos)

```markdown
---
type: screen
id: login
name: Login
description: Entry point for unauthenticated users
module: auth-frontend
folder: views
file: login-view
requires-auth: false
routes:
  - /auth/login
  - /login
navigates-to: [dashboard, register]
components:
  - LoginForm
  - ErrorMessage
  - LoadingSpinner
---

## Description
Allows unauthenticated users to access the application by entering their
username and password. Authenticated users who reach this route are
automatically redirected to the dashboard.

## Elements
- username input field
- password input field
- submit button
- link to register screen
- error message banner (visible only on failed login)

## Actions
- submit-login
- go-to-register

## States
- default
- loading
- error
```

---

## Referencia de campos del frontmatter

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `type` | string | **sí** | Siempre `screen` |
| `id` | string | **sí** | Identificador único de la pantalla. Debe coincidir con el nombre del archivo antes de `-screens.md` y con el ID referenciado en el campo `screens` del módulo al que pertenece |
| `name` | string | **sí** | Nombre legible de la pantalla |
| `description` | string | **sí** | Descripción breve en una sola línea |
| `module` | ID | **sí** | ID del módulo frontend al que pertenece esta pantalla. Apunta a `modules/frontend/{id}-frontend-modules.md` |
| `requires-auth` | boolean | **sí** | `true` si la pantalla requiere usuario autenticado, `false` si es pública. Es un booleano: sin comillas |
| `folder` | ID | no | ID de una carpeta declarada en `folders` del módulo referenciado. Indica en qué subcarpeta del módulo vive esta pantalla |
| `file` | ID | no | ID de un archivo declarado en `files` del módulo referenciado. Vincula la pantalla con el archivo de código que la implementa |
| `routes` | array de strings | no | Rutas URL que renderizan esta pantalla. Pueden ser varias si hay alias |
| `navigates-to` | array de IDs | no | IDs de pantallas a las que puede navegar esta pantalla. Cada ID apunta a `screens/{id}-screens.md` |
| `components` | array de strings | no | Nombres de los componentes usados en esta pantalla. Son nombres de componente, no IDs de archivo |

---

## Referencia de secciones Markdown

| Sección | Obligatoria | Contenido |
|---------|-------------|-----------|
| `## Description` | **sí** | Descripción detallada de qué muestra la pantalla, qué papel cumple en la aplicación y cualquier comportamiento relevante (redirecciones automáticas, condiciones de visibilidad...) |
| `## Elements` | no | Elementos de interfaz visibles en la pantalla. Lista de puntos, cada uno describe un elemento UI |
| `## Actions` | no | Acciones que puede realizar el usuario desde esta pantalla. Lista de puntos con el nombre de la acción |
| `## States` | no | Estados posibles de la pantalla. Valores comunes: `default`, `loading`, `error`, `empty`, `success` |

---

## El campo `requires-auth` — valores válidos

```yaml
requires-auth: true   # pantalla protegida, requiere sesión activa
requires-auth: false  # pantalla pública, accesible sin autenticación
```

No uses comillas. `"true"` es un string y el parser lo rechazará con error de tipo.

---

## El vínculo `folder` + `file` con el módulo

Los campos `folder` y `file` sirven para conectar la pantalla con el código que la implementa dentro del módulo.

- `folder` referencia el `id` de una carpeta declarada en `folders` del módulo indicado en `module`.
- `file` referencia el `id` de un archivo declarado en `files` del módulo indicado en `module`.

Ejemplo: si el módulo `auth-frontend` tiene declarado:

```yaml
folders:
  - id: views
    path: src/modules/auth/views
files:
  - id: login-view
    folder: views
    path: LoginView.vue
    type: view
```

Entonces la pantalla de login puede declarar:

```yaml
folder: views
file: login-view
```

Esto le permite al parser construir la conexión en ambos sentidos:

```
módulo (auth-frontend)
└── carpeta (views)
    └── archivo (login-view, type: view)
            ↕ vinculado
        pantalla (login)
```

Si el módulo no tiene `folders` y `files` documentados, simplemente omite `folder` y `file` en la pantalla.

---

## Cómo funcionan las referencias cruzadas

| Campo | El parser busca en... |
|-------|----------------------|
| `module` | `project-docs/modules/frontend/{id}-frontend-modules.md` |
| `folder` | Lista `folders` dentro del módulo referenciado por `module` |
| `file` | Lista `files` dentro del módulo referenciado por `module` |
| `navigates-to` | `project-docs/screens/{id}-screens.md` por cada ID de la lista |

Las referencias rotas (IDs que no tienen archivo correspondiente) generan advertencias, no errores. El parseo continúa.

---

## Ejemplos según nivel de detalle

### Mínimo (solo campos obligatorios)

```markdown
---
type: screen
id: login
name: Login
description: Entry point for unauthenticated users
module: auth-frontend
requires-auth: false
---

## Description
Allows unauthenticated users to log in with their username and password.
```

### Medio (con rutas, navegación y elementos básicos)

```markdown
---
type: screen
id: login
name: Login
description: Entry point for unauthenticated users
module: auth-frontend
requires-auth: false
routes:
  - /auth/login
  - /login
navigates-to: [dashboard, register]
---

## Description
Allows unauthenticated users to log in with their username and password.
Authenticated users who reach this route are redirected to the dashboard.

## Elements
- username input
- password input
- submit button
- link to register screen

## Actions
- submit-login
- go-to-register
```

### Completo (con vínculo al módulo, componentes y estados)

```markdown
---
type: screen
id: login
name: Login
description: Entry point for unauthenticated users
module: auth-frontend
folder: views
file: login-view
requires-auth: false
routes:
  - /auth/login
  - /login
navigates-to: [dashboard, register]
components:
  - LoginForm
  - ErrorMessage
---

## Description
Allows unauthenticated users to log in with their username and password.
Authenticated users who reach this route are automatically redirected to /dashboard.

## Elements
- username input field
- password input field
- submit button
- link to register screen
- error message banner (visible only after a failed login attempt)

## Actions
- submit-login
- go-to-register

## States
- default
- loading
- error
```

---

## Pantallas sin ruta (modales, overlays, drawers)

Si una pantalla no tiene ruta propia (por ejemplo, un modal o un panel lateral), simplemente omite el campo `routes`. El campo no es obligatorio.

```yaml
---
type: screen
id: confirm-delete-modal
name: Confirm Delete Modal
description: Confirmation dialog before deleting a project
module: projects-frontend
requires-auth: true
navigates-to: []
---
```

---

## Preguntas para extraer la información del usuario

1. ¿Qué pantallas tiene la aplicación? Descríbelas una a una.
2. Para cada pantalla:
   - ¿Cómo se llama y cuál es su propósito?
   - ¿Requiere que el usuario esté autenticado?
   - ¿A qué módulo de frontend pertenece?
   - ¿Tiene ruta URL? ¿Cuál?
   - ¿Desde qué pantallas se puede llegar a ella? ¿A qué otras pantallas puede navegar?
   - ¿Qué elementos visuales principales tiene?
   - ¿Qué acciones puede hacer el usuario desde ella?
   - ¿Tiene estados diferenciados? (loading mientras carga, error si falla...)
3. Si el módulo al que pertenece tiene archivos documentados: ¿qué archivo de código implementa esta pantalla?

---

## Errores comunes y cómo evitarlos

| Error | Causa | Solución |
|-------|-------|----------|
| `[archivo] el campo "requires-auth" debe ser boolean` | Se escribió `requires-auth: "false"` con comillas | Usa `requires-auth: false` sin comillas |
| `[archivo] falta el campo requerido "module"` | Se omitió el campo `module` | Toda pantalla debe pertenecer a un módulo frontend |
| `[archivo] falta el campo requerido "description"` | Se omitió la descripción breve del frontmatter | Añade `description:` con una línea descriptiva |
| Referencia rota en `navigates-to` | El ID referenciado no tiene su archivo `screens/` | Genera el archivo de la pantalla destino antes de referenciarla |
| Referencia rota en `file` | El ID referenciado no existe en `files` del módulo | El módulo debe tener documentado ese archivo en su campo `files` |
