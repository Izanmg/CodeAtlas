# Formato completo — Reglas del sistema

Este documento es la referencia exhaustiva para generar el archivo `05-system-rules.md` que CodeAtlas necesita.

---

## Propósito del tipo `system-rules`

El archivo de reglas del sistema recoge las **reglas globales y decisiones técnicas transversales** de la aplicación: aquellas que afectan a toda la aplicación y no tienen un sitio más específico donde documentarse.

Es el único tipo de archivo de documentación que:
- No tiene carpeta asociada ni archivos de detalle — todo el contenido vive en un único documento
- Tiene el frontmatter más simple posible (solo el campo `type`)
- No tiene secciones obligatorias — las secciones son completamente libres

---

## Diferencia con las notas en módulos y flujos

Los módulos y flujos tienen una sección `## Notes` opcional para decisiones específicas de ese elemento. `05-system-rules.md` es distinto:

- **`## Notes` en un módulo**: "este módulo hashea las contraseñas con bcrypt"
- **`05-system-rules.md`**: "en toda la aplicación, ninguna contraseña se guarda en texto plano"

Si una regla aplica solo a un módulo o flujo concreto, va en ese módulo o flujo. Si aplica a toda la aplicación, va aquí.

---

## Ruta

```
project-docs/05-system-rules.md
```

---

## Formato completo

```markdown
---
type: system-rules
---

## Auth
- All routes require authentication except /auth/login and /auth/register
- Sessions expire after 24 hours of inactivity
- Two roles exist: user and admin
- Admin routes are prefixed with /admin and require role: admin

## Navigation
- Unauthenticated users are redirected to /login regardless of the requested route
- After a successful login, users are redirected to /dashboard
- After logout, users are redirected to /login
- After a successful registration, users are logged in automatically and redirected to /dashboard

## Validation
- Passwords must be at least 8 characters and contain at least one number
- Usernames must be unique, between 3 and 30 characters, alphanumeric with underscores allowed
- Email addresses must be valid and are stored in lowercase
- All dates are sent from the frontend in ISO 8601 format (YYYY-MM-DD)

## Conventions
- API responses always use camelCase for field names
- All timestamps are stored and returned in UTC
- HTTP error responses always include a message field with a human-readable explanation
- Frontend stores the session token in localStorage under the key auth_token
- File names use kebab-case
- Database column names use snake_case

## Technical Decisions
- Session tokens are JWT signed with HS256 and expire after 24 hours
- Passwords are always hashed with bcrypt (cost factor 12) before storage
- The frontend never stores plain-text passwords, not even temporarily
- File uploads are validated by MIME type and size (max 10 MB) on both frontend and backend
- The backend never returns the password_hash field in any API response
```

---

## Referencia de campos del frontmatter

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `type` | string | **sí** | Siempre `system-rules` |

No hay más campos en el frontmatter. Su valor es identificar el tipo de archivo para el parser.

---

## Referencia de secciones Markdown

Las secciones de este archivo son **completamente libres**. No hay secciones obligatorias ni un conjunto fijo de nombres. El proyecto define las secciones que necesita.

El parser de CodeAtlas reconoce estas secciones como "conocidas" y las procesa de forma estructurada (las convierte en listas de strings):

| Sección reconocida | Qué documenta |
|-------------------|---------------|
| `## Auth` | Autenticación, autorización, roles, comportamiento de sesiones |
| `## Navigation` | Redirecciones automáticas, comportamiento tras login/logout/registro |
| `## Validation` | Reglas de validación globales aplicadas en frontend, backend o ambos |
| `## Conventions` | Convenciones de código, formato de respuestas API, nombres de campos |
| `## Technical Decisions` | Decisiones de arquitectura o tecnología que afectan a todo el sistema |

Cualquier otra sección que se añada (por ejemplo `## Performance`, `## Security`, `## Accessibility`) se trata como extensión y también aparece en el diagrama. No genera errores.

---

## Guía de contenido por sección

### `## Auth`

Documenta cómo funciona la autenticación y autorización a nivel de toda la aplicación:

- ¿Qué rutas son públicas? ¿Cuáles requieren autenticación?
- ¿Existen roles de usuario? ¿Cuáles y qué pueden hacer cada uno?
- ¿Cuánto duran las sesiones? ¿Cómo se renueva el token?
- ¿Hay rutas reservadas para administradores?
- ¿Qué pasa cuando el token expira? ¿Se redirige al login?

```markdown
## Auth
- All routes require authentication except /auth/login and /auth/register
- Sessions expire after 24 hours of inactivity
- Two roles exist: user and admin
- Admin routes are prefixed with /admin and require role: admin
- Expired tokens cause an automatic redirect to /login with a session-expired message
```

### `## Navigation`

Documenta redirecciones automáticas y el flujo de navegación global:

- ¿Adónde se redirige a un usuario no autenticado que intenta acceder a una ruta protegida?
- ¿Adónde se redirige tras un login exitoso?
- ¿Adónde se redirige tras un registro exitoso?
- ¿Adónde se redirige tras un logout?
- ¿Hay una ruta "catch-all" para páginas no encontradas?

```markdown
## Navigation
- Unauthenticated users are redirected to /login regardless of the requested route
- After a successful login, users are redirected to /dashboard
- After a successful registration, users are automatically logged in and redirected to /dashboard
- After logout, users are redirected to /login
- Unknown routes redirect to a 404 page
```

### `## Validation`

Documenta las reglas de validación que aplican en toda la aplicación (no las de una pantalla o módulo concreto):

- ¿Qué formato deben tener las contraseñas?
- ¿Qué restricciones tienen los nombres de usuario?
- ¿Qué formato tienen las fechas?
- ¿Hay límites de tamaño en los archivos que se pueden subir?
- ¿Hay campos que deben ser únicos en toda la aplicación?

```markdown
## Validation
- Passwords must be at least 8 characters and contain at least one number and one uppercase letter
- Usernames must be unique, between 3 and 30 characters, alphanumeric with underscores allowed
- Email addresses must be valid format and are stored in lowercase
- All dates are sent in ISO 8601 format (YYYY-MM-DD)
- File uploads are limited to 10 MB and only accept image/png, image/jpeg, application/pdf
```

### `## Conventions`

Documenta las convenciones de desarrollo que afectan a cómo se comunican las partes del sistema:

- ¿Qué formato usan las respuestas de la API? (camelCase, snake_case...)
- ¿En qué zona horaria se almacenan las fechas?
- ¿Qué incluyen siempre las respuestas de error?
- ¿Cómo se nombran los archivos? ¿Las columnas de la base de datos?
- ¿Dónde guarda el frontend el token de sesión?

```markdown
## Conventions
- API responses always use camelCase for field names
- All timestamps are stored in the database and returned by the API in UTC
- HTTP error responses always include a message field with a human-readable description
- Frontend stores the session token in localStorage under the key auth_token
- Database column names use snake_case
- File names use kebab-case
```

### `## Technical Decisions`

Documenta decisiones de arquitectura, tecnología o seguridad que afectan a toda la aplicación:

- ¿Qué algoritmo se usa para las contraseñas? ¿Con qué configuración?
- ¿Cómo se firman los tokens? ¿Qué algoritmo?
- ¿Qué datos nunca devuelve el backend?
- ¿Hay decisiones de infraestructura relevantes?

```markdown
## Technical Decisions
- Session tokens are JWT signed with HS256 and expire after 24 hours
- Passwords are always hashed with bcrypt with cost factor 12 before storage
- The backend never returns the password_hash field in any API response
- The frontend never stores plain-text passwords, not even temporarily
- All file uploads are validated by MIME type on the backend regardless of frontend validation
```

---

## Cómo manejar el contenido de cada sección

El contenido de cada sección es una lista de puntos. El parser la convierte en un array de strings.

Usa listas con `-`:

```markdown
## Auth
- All routes require authentication except /auth/login and /auth/register
- Sessions expire after 24 hours
```

También puedes usar párrafos de texto libre, aunque las listas son más fáciles de procesar y mostrar en el diagrama.

---

## Preguntas para extraer la información del usuario

### Autenticación y roles

1. ¿Qué rutas de la aplicación son públicas (sin necesidad de estar autenticado)?
2. ¿Hay roles de usuario? ¿Cuáles y qué diferencia hay entre ellos?
3. ¿Cuánto dura una sesión? ¿Qué pasa cuando expira?
4. ¿Hay rutas o secciones reservadas para administradores?

### Navegación

5. Si un usuario no autenticado intenta acceder a una página protegida, ¿adónde se le redirige?
6. ¿Adónde va el usuario después de hacer login? ¿Y después del registro? ¿Y después del logout?

### Validación

7. ¿Qué reglas tienen las contraseñas? (longitud mínima, caracteres requeridos...)
8. ¿Hay restricciones para los nombres de usuario o emails?
9. ¿Hay límites de tamaño o tipo para archivos subidos?

### Convenciones

10. ¿En qué formato devuelve la API los datos? (camelCase, snake_case...)
11. ¿En qué zona horaria se almacenan y devuelven las fechas?
12. ¿Qué incluye siempre una respuesta de error de la API?
13. ¿Dónde guarda el frontend el token de sesión?

### Decisiones técnicas

14. ¿Qué algoritmo se usa para las contraseñas?
15. ¿Cómo se generan y firman los tokens de sesión?
16. ¿Hay datos sensibles que el backend nunca expone en las respuestas?

---

## Ejemplo mínimo

```markdown
---
type: system-rules
---

## Auth
- All routes require authentication except /auth/login and /auth/register
- Sessions expire after 24 hours

## Conventions
- API responses use camelCase
- Timestamps are stored and returned in UTC
```

---

## Errores comunes y cómo evitarlos

| Error | Causa | Solución |
|-------|-------|----------|
| El parser descarta el archivo sin avisar | El frontmatter no tiene el delimitador `---` de cierre | Asegúrate de que hay exactamente dos líneas con `---`: una al principio y una después del campo `type` |
| `[archivo] tipo desconocido "..."` | Se usó un tipo incorrecto en el frontmatter | El valor de `type` debe ser exactamente `system-rules`, con guion y en minúsculas |
| El contenido de una sección no aparece en el diagrama | Se escribió como párrafo continuo | Usa listas con `-` para que el parser pueda convertirlo en items individuales |
