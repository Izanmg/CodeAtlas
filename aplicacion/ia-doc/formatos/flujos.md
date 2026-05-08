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

## Cuándo generarlos

**Los flujos siempre se generan al final**, después de haber definido módulos de backend, módulos de frontend, entidades de base de datos y pantallas. Los prefijos de referencia de los pasos usan IDs de esos elementos — si no están definidos todavía, los prefijos no se pueden rellenar correctamente.

En el modo entrevista: no preguntes sobre flujos hasta que los bloques anteriores estén completos. Si el usuario menciona un flujo antes, anótalo y vuelve a él cuando llegue el momento.

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
- [screen:login] El usuario rellena el formulario con usuario y contraseña
- [frontend:auth-frontend/LoginView.vue/handleLogin] Se validan los campos y se llama a POST /auth/login
- [backend:auth-backend/auth.controller.ts/login] Se busca el usuario por nombre en la tabla users
- [backend:auth-backend/auth.controller.ts/login] Se compara la contraseña con el hash almacenado
- [database:users] Se consulta el registro del usuario
- [backend:auth-backend/auth.service.ts/generateToken] Se genera un JWT firmado y se crea la sesión
- [database:sessions] Se guarda el registro de sesión
- [frontend:auth-frontend/LoginView.vue/handleLogin] Se guarda el token en localStorage bajo auth_token
- [screen:dashboard] El usuario es redirigido al dashboard

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

**Los dos formatos pueden coexistir** en el mismo flujo. Algunos módulos pueden ir con detalle y otros solo con ID.

---

## Formato de la sección `## Steps`

Cada paso es un ítem de lista (`-`) con un **prefijo de referencia opcional** seguido del texto descriptivo:

```
- [capa:moduleId/archivo/función] Descripción del paso
```

### Sintaxis del prefijo

| Capa | Ejemplo | Qué referencia |
|---|---|---|
| `screen` | `[screen:login]` | Una pantalla por su ID |
| `frontend` | `[frontend:auth-frontend/LoginView.vue]` | Módulo frontend / componente |
| `backend` | `[backend:auth-backend/auth.service.ts/generateToken]` | Módulo backend / archivo / función |
| `database` | `[database:users]` | Tabla de base de datos |
| *(sin prefijo)* | *(ausente)* | Paso sin nodo asignado — válido, aparece en el panel como texto simple |

Los niveles de granularidad son **opcionales de derecha a izquierda**:
- `[backend:auth-backend]` → solo módulo
- `[backend:auth-backend/auth.service.ts]` → módulo + archivo
- `[backend:auth-backend/auth.service.ts/generateToken]` → módulo + archivo + función

### Efecto en el diagrama

- Cada nodo del canvas que tenga al menos un paso referenciado muestra un **chip** con el nombre del flujo.
- En el **modo Flujos** del canvas, se dibujan edges amarillos entre los nodos de pasos consecutivos cuando el nodo cambia. Si dos pasos consecutivos apuntan al mismo nodo, se agrupan visualmente sin generar edge entre ellos.
- El panel lateral muestra los pasos en orden con su referencia (capa, archivo, función). El nodo seleccionado en el canvas resalta sus pasos con un borde.

---

## Referencia de secciones Markdown

| Sección | Obligatoria | Contenido |
|---------|-------------|-----------|
| `## Steps` | **sí** | Lista de pasos (`-`) con prefijo `[capa:ref]` opcional. Describe el proceso completo de principio a fin |
| `## Error Cases` | no | Qué puede fallar en cada momento del flujo y cómo se gestiona. Lista de puntos |
| `## Notes` | no | Decisiones técnicas relevantes del flujo que no encajan en ningún paso concreto |

---

## Cómo escribir buenos `## Steps`

Los pasos deben contar la historia completa del proceso. Usa el prefijo de referencia para indicar qué parte del sistema ejecuta cada paso. Un buen conjunto de pasos responde a estas preguntas:

- ¿Qué hace el usuario para iniciar el flujo? → `[screen:...]`
- ¿Qué valida el frontend antes de llamar al backend? → `[frontend:...]`
- ¿Qué llamada API realiza el frontend? → `[frontend:...]`
- ¿Qué hace el backend con esa llamada? → `[backend:...]`
- ¿Qué lee o escribe en la base de datos? → `[database:...]`
- ¿Qué devuelve el backend y cómo lo procesa el frontend? → `[frontend:...]`
- ¿Cuál es el estado final visible para el usuario? → `[screen:...]`

**Ejemplo de pasos demasiado vagos (evitar):**

```markdown
## Steps
- User logs in
- Backend validates
- User is redirected
```

**Ejemplo de pasos bien detallados con prefijos:**

```markdown
## Steps
- [screen:login] El usuario introduce usuario y contraseña y pulsa submit
- [frontend:auth-frontend/LoginView.vue/handleLogin] Se validan los campos (no vacíos)
- [frontend:auth-frontend/LoginView.vue/handleLogin] Se llama a POST /auth/login con { username, password }
- [backend:auth-backend/auth.controller.ts/login] Se busca el usuario en la tabla users
- [database:users] Se consulta el registro por nombre de usuario
- [backend:auth-backend/auth.controller.ts/login] Se compara la contraseña con el hash almacenado
- [backend:auth-backend/auth.service.ts/generateToken] Se genera un JWT firmado con HS256
- [frontend:auth-frontend/LoginView.vue/handleLogin] Se guarda el token en localStorage y se navega al dashboard
- [screen:dashboard] El usuario ve el dashboard
```

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
| Prefijo `[screen:id]` en steps | ID de una pantalla definida en `screens/` |
| Prefijo `[frontend:id/...]` en steps | ID de un módulo frontend definido en `modules/frontend/` |
| Prefijo `[backend:id/...]` en steps | ID de un módulo backend definido en `modules/backend/` |
| Prefijo `[database:id]` en steps | ID de una entidad definida en `database/` |

---

## Ejemplos según nivel de detalle

### Mínimo (solo campos obligatorios, sin prefijos en steps)

Compatible con el formato antiguo. Los pasos aparecen en el panel como texto simple pero no generan edges ni chips en nodos.

```markdown
---
type: flow
id: user-login
name: User Login
description: Complete process from login form submission to dashboard access
trigger: user submits login form
---

## Steps
- User enters username and password on the login screen
- Frontend validates the form and calls the login API
- Backend validates credentials and returns a session token
- Frontend redirects the user to the dashboard
```

### Medio (prefijos de capa sin detalle de archivo ni función)

Los nodos relevantes muestran el chip del flujo y se generan edges entre capas distintas.

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
- [screen:login] El usuario introduce sus credenciales
- [frontend:auth-frontend] Se llama a POST /auth/login con las credenciales
- [backend:auth-backend] Se validan las credenciales contra la tabla users
- [database:users] Se consulta el usuario en base de datos
- [backend:auth-backend] Se genera y devuelve el token de sesión
- [screen:dashboard] Se almacena el token y se redirige al dashboard

## Error Cases
- Invalid credentials: show error message on login screen
- Server error: show generic error and stay on login screen
```

### Completo (con detalle de archivo y función en cada paso)

Máxima granularidad. El panel lateral muestra archivo y función en cada paso.

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
- [screen:login] El usuario introduce usuario y contraseña y pulsa submit
- [frontend:auth-frontend/LoginView.vue/handleLogin] Se validan los campos y se llama a POST /auth/login
- [backend:auth-backend/auth.controller.ts/login] Se busca el usuario en la tabla users
- [database:users] Se consulta el registro por nombre de usuario
- [backend:auth-backend/auth.controller.ts/login] Se compara la contraseña con el hash almacenado
- [backend:auth-backend/auth.service.ts/generateToken] Se genera un JWT firmado con HS256
- [frontend:auth-frontend/LoginView.vue/handleLogin] Se guarda el token en localStorage y se navega al dashboard
- [screen:dashboard] El usuario ve el dashboard

## Error Cases
- Empty fields: handleLogin() shows inline validation errors without calling the API
- Invalid credentials: login() returns 401, handleLogin() shows error message on the login screen
- Server unavailable: login() returns 500, handleLogin() shows a generic error message

## Notes
Tokens expire after 24 hours. The frontend checks token validity on each page load.
```

---

## Preguntas para extraer la información del usuario

Haz estas preguntas **solo después** de tener definidos módulos, base de datos y pantallas, ya que los prefijos de los pasos dependen de esos IDs.

1. ¿Qué procesos importantes tiene la aplicación que involucren varios pasos o varias partes del sistema?
2. Para cada flujo identificado:
   - ¿Cómo se llama el proceso y qué hace?
   - ¿Qué lo inicia? (el usuario hace algo, llega un evento, se cumple una condición...)
   - ¿Qué pantallas participan en el proceso?
   - ¿Qué módulos participan (frontend y backend)?
   - ¿Qué datos lee o modifica en la base de datos?
   - Describe los pasos del proceso desde el inicio hasta el final
   - Para cada paso: ¿en qué capa ocurre y en qué archivo/función concretos, si lo sabes?
   - ¿Qué puede salir mal? ¿Cómo se gestiona cada error?

---

## Errores comunes y cómo evitarlos

| Error | Causa | Solución |
|-------|-------|----------|
| `[archivo] falta el campo requerido "trigger"` | Se omitió el campo `trigger` | Añade `trigger:` con una descripción de qué inicia el flujo |
| `[archivo] falta el campo requerido "description"` | Se omitió la descripción breve | Añade `description:` con una línea que resuma el flujo |
| Referencia rota en `modules[].id` | El ID no coincide con el sufijo del módulo | Verifica que el ID termina en `-backend` o `-frontend` |
| Referencia rota en `modules[].file` | El ID del archivo no existe en el módulo | El módulo debe tener ese `id` declarado en su campo `files` |
| La sección `## Steps` no produce pasos | Se escribió como párrafo en lugar de lista | Usa lista de puntos (`-`) |
| Prefijo `[capa:id]` no genera chip ni edge | El ID del prefijo no coincide con ningún elemento definido | Verifica que el ID existe en la capa correspondiente (módulo, pantalla o tabla) |
| Prefijo con capa inválida | Se usó una capa que no es `screen`, `frontend`, `backend` ni `database` | Corrige la capa al valor correcto |
