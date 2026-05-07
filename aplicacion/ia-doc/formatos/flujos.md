# Formato completo — Flujos

Este documento es la referencia exhaustiva para generar los archivos de flujo que CodeAtlas necesita.

---

## Propósito del tipo `flow`

Un flujo describe un **proceso concreto con pasos secuenciales**, no lo que muestra una pantalla. Tiene sentido documentar algo como flujo cuando:

- El proceso cruza más de una pantalla
- Implica llamadas entre frontend y backend
- Tiene pasos con lógica relevante que vale la pena documentar
- Puede fallar de formas distintas según el paso en que esté

Los flujos son **transversales** — no pertenecen ni al frontend ni al backend, sino que atraviesan ambas capas. Por eso referencian módulos, pantallas y entidades de base de datos a la vez.

**Cuándo NO hace falta un flujo:** si una pantalla simplemente carga datos al abrirse y los muestra, no hace falta documentarlo como flujo. El flujo aparece cuando hay un proceso con pasos, no cuando hay una pantalla con contenido.

Ejemplos de flujos con sentido real:
- Login: desde que el usuario envía el formulario hasta que llega al dashboard
- Registro: desde el formulario hasta la cuenta creada y sesión iniciada
- Creación de proyecto: desde el formulario hasta el proyecto guardado y visible en el listado
- Generación de diagrama: desde que se suben los archivos hasta que el diagrama aparece en pantalla

---

## Ruta

```
project-docs/flows/{id}-flows.md
```

El `{id}` debe ser único, en minúsculas y con guiones. Conviene que el nombre sea descriptivo del proceso (`user-login`, `project-creation`, `file-upload`).

---

## Formato completo (todos los campos)

```markdown
---
type: flow
id: user-login
name: User Login
description: Complete process from login form submission to dashboard access
trigger: user submits login form
screens: [login, dashboard]
modules:
  - id: auth-frontend
    file: login-view
    functions: [handleLogin]
  - id: auth-backend
    file: auth-controller
    functions: [login]
database: [users, sessions]
---

## Steps
1. User enters username and password on the login screen
2. handleLogin() validates that both fields are filled
3. handleLogin() calls POST /auth/login with the credentials
4. login() looks up the user by username in the users table
5. login() validates the password hash
6. login() creates a new session in the sessions table and returns a JWT token
7. handleLogin() stores the token in localStorage under auth_token
8. handleLogin() redirects the user to the dashboard screen

## Error Cases
- Empty fields: handleLogin() shows a validation error before calling the API
- Invalid credentials: login() returns 401, handleLogin() shows error on the login screen
- Server error: login() returns 500, handleLogin() shows a generic error message

## Notes
Session tokens are JWT signed with HS256 and expire after 24 hours.
The frontend never stores the plain-text password.
```

---

## Referencia de campos del frontmatter

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `type` | string | **sí** | Siempre `flow` |
| `id` | string | **sí** | Identificador único del flujo. Debe coincidir con el nombre del archivo antes de `-flows.md` |
| `name` | string | **sí** | Nombre legible del flujo |
| `description` | string | **sí** | Descripción breve en una sola línea de qué proceso describe el flujo |
| `trigger` | string | **sí** | Qué inicia el flujo. Puede ser una acción del usuario, un evento del sistema, una llamada programada, etc. |
| `screens` | array de IDs | no | IDs de pantallas que participan en el flujo. Cada ID apunta a `screens/{id}-screens.md` |
| `modules` | array (simple o de objetos) | no | Módulos que participan en el flujo. Ver el formato detallado de este campo más abajo |
| `database` | array de IDs | no | IDs de entidades de base de datos que se leen o modifican durante el flujo. Cada ID apunta a `database/{id}-database.md` |

---

## El campo `modules` — dos niveles de detalle

### Formato simple (solo IDs)

Cuando no se necesita vincular el flujo a archivos o funciones concretas:

```yaml
modules: [auth-frontend, auth-backend]
```

### Formato detallado (módulo + archivo + funciones)

Cuando se quiere mostrar exactamente qué archivo y qué función de cada módulo participan:

```yaml
modules:
  - id: auth-frontend
    file: login-view
    functions: [handleLogin]
  - id: auth-backend
    file: auth-controller
    functions: [login]
```

| Subcampo | Obligatorio | Descripción |
|----------|-------------|-------------|
| `id` | **sí** | ID del módulo. El parser detecta si es backend o frontend por el sufijo del ID (`-backend` o `-frontend`) |
| `file` | **sí** en formato detallado | ID de un archivo declarado en `files` del módulo referenciado |
| `functions` | no | Lista de nombres de funciones declaradas en ese archivo que participan en el flujo |

**Los dos formatos pueden coexistir** en el mismo flujo. Algunos módulos pueden ir con detalle y otros solo con ID:

```yaml
modules:
  - id: auth-frontend
    file: login-view
    functions: [handleLogin]
  - id: notifications-backend
```

---

## Referencia de secciones Markdown

| Sección | Obligatoria | Contenido |
|---------|-------------|-----------|
| `## Steps` | **sí** | Lista ordenada de los pasos del proceso de principio a fin. Debe describir qué hace el usuario, qué hace el frontend y qué hace el backend en cada paso |
| `## Error Cases` | no | Qué puede fallar en cada momento del flujo y cómo se gestiona. Lista de puntos |
| `## Notes` | no | Decisiones técnicas relevantes del flujo que no encajan en ningún paso concreto |

---

## Cómo escribir buenos `## Steps`

Los pasos deben contar la historia completa del proceso. Un buen conjunto de pasos responde a estas preguntas:

- ¿Qué hace el usuario para iniciar el flujo?
- ¿Qué valida el frontend antes de llamar al backend?
- ¿Qué llamada API realiza el frontend?
- ¿Qué hace el backend con esa llamada?
- ¿Qué devuelve el backend?
- ¿Cómo procesa el frontend la respuesta?
- ¿Cuál es el estado final visible para el usuario?

**Ejemplo de pasos demasiado vagos (evitar):**

```markdown
## Steps
1. User logs in
2. Backend validates
3. User is redirected
```

**Ejemplo de pasos bien detallados:**

```markdown
## Steps
1. User enters username and password on the login screen and clicks submit
2. handleLogin() validates that both fields are non-empty
3. handleLogin() calls POST /auth/login with { username, password }
4. login() queries the users table for a user with that username
5. login() compares the submitted password against the stored hash
6. login() creates a session record and returns a signed JWT token
7. handleLogin() saves the token to localStorage under auth_token
8. handleLogin() navigates to the dashboard screen
```

Si se ha declarado el formato detallado de `modules`, es buena práctica mencionar las funciones concretas en los pasos (como en el ejemplo).

---

## Cómo funcionan las referencias cruzadas

| Campo | El parser busca en... |
|-------|----------------------|
| `screens` | `project-docs/screens/{id}-screens.md` |
| `modules[].id` (con sufijo -backend) | `project-docs/modules/backend/{id}-backend-modules.md` |
| `modules[].id` (con sufijo -frontend) | `project-docs/modules/frontend/{id}-frontend-modules.md` |
| `modules[].file` | Lista `files` dentro del módulo referenciado |
| `modules[].functions` | Sección `## Functions` dentro del archivo referenciado |
| `database` | `project-docs/database/{id}-database.md` |

El parser detecta si un módulo es de backend o frontend por el sufijo de su ID. Por eso es importante que los IDs de módulos sigan el patrón `nombre-backend` o `nombre-frontend`.

---

## Ejemplos según nivel de detalle

### Mínimo (solo campos obligatorios)

```markdown
---
type: flow
id: user-login
name: User Login
description: Complete process from login form submission to dashboard access
trigger: user submits login form
---

## Steps
1. User enters username and password on the login screen
2. Frontend validates the form and calls the login API
3. Backend validates credentials and returns a session token
4. Frontend redirects the user to the dashboard
```

### Medio (con referencias a pantallas, módulos y base de datos)

```markdown
---
type: flow
id: user-login
name: User Login
description: Complete process from login form submission to dashboard access
trigger: user submits login form
screens: [login, dashboard]
modules: [auth-frontend, auth-backend]
database: [users]
---

## Steps
1. User enters username and password on the login screen
2. Frontend calls POST /auth/login with the credentials
3. Backend validates credentials against the users table
4. Backend generates and returns a session token
5. Frontend stores the token and redirects to dashboard

## Error Cases
- Invalid credentials: show error message on login screen
- Server error: show generic error and stay on login screen
```

### Completo (con detalle de archivos y funciones en cada módulo)

```markdown
---
type: flow
id: user-login
name: User Login
description: Complete process from login form submission to dashboard access
trigger: user submits login form
screens: [login, dashboard]
modules:
  - id: auth-frontend
    file: login-view
    functions: [handleLogin]
  - id: auth-backend
    file: auth-controller
    functions: [login]
database: [users]
---

## Steps
1. User enters username and password on the login screen and submits the form
2. handleLogin() validates that both fields are non-empty before calling the API
3. handleLogin() calls POST /auth/login with { username, password }
4. login() queries the users table to find the user by username
5. login() compares the submitted password against the stored bcrypt hash
6. login() generates a signed JWT token and returns it with status 200
7. handleLogin() stores the token in localStorage under auth_token
8. handleLogin() navigates to the dashboard screen

## Error Cases
- Empty fields: handleLogin() shows inline validation errors without calling the API
- Invalid credentials: login() returns 401, handleLogin() shows error message on the login screen
- Server unavailable: login() returns 500, handleLogin() shows a generic error message

## Notes
Tokens expire after 24 hours. The frontend checks token validity on each page load.
```

---

## Preguntas para extraer la información del usuario

1. ¿Qué procesos importantes tiene la aplicación que involucren varios pasos o varias partes del sistema?
2. Para cada flujo identificado:
   - ¿Cómo se llama el proceso y qué hace?
   - ¿Qué lo inicia? (el usuario hace algo, llega un evento, se cumple una condición...)
   - ¿Qué pantallas participan en el proceso?
   - ¿Qué módulos participan (frontend y backend)?
   - ¿Qué datos lee o modifica en la base de datos?
   - Describe los pasos del proceso desde el inicio hasta el final
   - ¿Qué puede salir mal? ¿Cómo se gestiona cada error?

---

## Errores comunes y cómo evitarlos

| Error | Causa | Solución |
|-------|-------|----------|
| `[archivo] falta el campo requerido "trigger"` | Se omitió el campo `trigger` | Añade `trigger:` con una descripción de qué inicia el flujo |
| `[archivo] falta el campo requerido "description"` | Se omitió la descripción breve | Añade `description:` con una línea que resuma el flujo |
| Referencia rota en `modules[].id` | El ID no coincide con el sufijo del módulo | Verifica que el ID termina en `-backend` o `-frontend` |
| Referencia rota en `modules[].file` | El ID del archivo no existe en el módulo | El módulo debe tener ese `id` declarado en su campo `files` |
| La sección `## Steps` no produce pasos | Se escribió como párrafo en lugar de lista | Usa lista numerada (`1.`, `2.`) o lista de puntos (`-`) |
