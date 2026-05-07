# Formato completo — Base de datos

Este documento es la referencia exhaustiva para generar los archivos de entidad de base de datos que CodeAtlas necesita.

---

## Propósito del tipo `entity`

Un archivo de entidad documenta una **tabla o colección de la base de datos**: su estructura de campos, las relaciones con otras entidades, y qué módulos de backend la leen o modifican.

Cada archivo representa exactamente una entidad. Si la aplicación tiene 4 tablas, deben generarse 4 archivos separados.

---

## Ruta

```
project-docs/database/{id}-database.md
```

El `{id}` debe ser único, en minúsculas y con guiones si el nombre tiene varias palabras. Conviene usar el nombre de la tabla o colección (por ejemplo: `users`, `projects`, `user-sessions`).

---

## Formato completo (todos los campos)

```markdown
---
type: entity
id: users
name: User
description: Stores registered user accounts
used-by: [auth-backend, projects-backend]
relations:
  - target: projects
    type: one-to-many
    field: user_id
  - target: sessions
    type: one-to-many
    field: user_id
---

## Table

```dbml
Table users {
  id uuid [pk]
  username varchar [not null, unique]
  email varchar [not null, unique]
  password_hash varchar [not null]
  birth_date date
  role varchar [not null, default: 'user']
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Ref: users.id < projects.user_id
Ref: users.id < sessions.user_id
```

## Notes
Passwords are never stored in plain text. The password_hash field always stores a bcrypt hash.
The role field accepts: 'user', 'admin'.
```

---

## Referencia de campos del frontmatter

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `type` | string | **sí** | Siempre `entity` |
| `id` | string | **sí** | Identificador único de la entidad. Debe coincidir con el nombre del archivo antes de `-database.md` y con los IDs usados en `database` de los módulos de backend |
| `name` | string | **sí** | Nombre legible de la entidad (normalmente en singular: `User`, `Project`) |
| `description` | string | **sí** | Descripción breve en una sola línea de qué almacena esta entidad |
| `used-by` | array de IDs | no | IDs de módulos de backend que leen o modifican esta entidad. Cada ID apunta a `modules/backend/{id}-backend-modules.md` |
| `relations` | array de objetos | no | Relaciones de esta entidad con otras entidades de la base de datos |
| `relations[].target` | string | **sí** (si relations) | ID de la entidad destino. Apunta a `database/{id}-database.md` |
| `relations[].type` | string | **sí** (si relations) | Tipo de relación: `one-to-one`, `one-to-many`, `many-to-many` |
| `relations[].field` | string | no | Nombre del campo (columna) que actúa como clave foránea en la relación |

---

## Referencia de secciones Markdown

| Sección | Obligatoria | Contenido |
|---------|-------------|-----------|
| `## Table` | **sí** | Definición de la tabla en formato DBML dentro de un bloque de código etiquetado con `dbml` |
| `## Notes` | no | Decisiones técnicas relevantes sobre esta entidad: reglas de negocio que afectan a los datos, campos calculados, restricciones no evidentes, etc. |

---

## El formato DBML

La sección `## Table` debe contener un bloque de código con la etiqueta `dbml`:

````markdown
## Table

```dbml
Table nombre_tabla {
  campo tipo [atributos]
  ...
}

Ref: tabla_origen.campo < tabla_destino.campo
```
````

### Tipos de datos comunes

| Tipo | Descripción |
|------|-------------|
| `int` | Entero estándar |
| `bigint` | Entero de 64 bits, para IDs grandes o contadores |
| `float` | Número decimal de punto flotante |
| `decimal` | Número decimal de precisión exacta (ideal para monedas) |
| `boolean` | Verdadero o falso |
| `varchar` | Cadena de texto de longitud variable |
| `text` | Texto largo sin límite de longitud |
| `uuid` | Identificador único universal (36 caracteres) |
| `date` | Solo fecha (YYYY-MM-DD) |
| `timestamp` | Fecha y hora |
| `json` | Objeto JSON arbitrario |
| `jsonb` | JSON binario (PostgreSQL, más eficiente para consultas) |

### Atributos de columna

Los atributos van entre corchetes `[]` después del tipo, separados por comas:

| Atributo | Descripción |
|----------|-------------|
| `[pk]` | Clave primaria |
| `[not null]` | El campo no puede ser nulo |
| `[unique]` | El valor debe ser único en la tabla |
| `[default: valor]` | Valor por defecto. Strings van entre comillas: `[default: 'user']` |
| `[increment]` | Auto-incremento (para IDs enteros) |
| `[note: 'texto']` | Nota descriptiva sobre el campo |

Pueden combinarse: `[pk, not null]`, `[not null, unique]`, `[not null, default: 'active']`

### Relaciones con `Ref`

Las relaciones se definen fuera del bloque de tabla con la directiva `Ref`:

```dbml
Ref: tabla_origen.campo > tabla_destino.campo   // many-to-one  (muchos origen → uno destino)
Ref: tabla_origen.campo < tabla_destino.campo   // one-to-many  (uno origen → muchos destino)
Ref: tabla_origen.campo - tabla_destino.campo   // one-to-one
Ref: tabla_origen.campo <> tabla_destino.campo  // many-to-many
```

**Regla mnemotécnica:**
- `<` el símbolo apunta hacia el lado "uno"
- `>` el símbolo apunta hacia el lado "uno"
- Si `users` tiene muchos `projects`, el campo `projects.user_id` apunta a `users.id`:
  ```dbml
  Ref: projects.user_id > users.id   // muchos projects → un user
  // equivalente:
  Ref: users.id < projects.user_id   // un user → muchos projects
  ```

---

## Coherencia entre `relations` del frontmatter y `Ref` en DBML

El campo `relations` del frontmatter y las directivas `Ref` del DBML describen lo mismo desde dos perspectivas. **Deben ser consistentes** entre sí:

```yaml
# frontmatter
relations:
  - target: projects
    type: one-to-many
    field: user_id
```

```dbml
# sección ## Table
Ref: users.id < projects.user_id
```

El `target: projects` del frontmatter corresponde a la tabla `projects` en el `Ref`. El `type: one-to-many` corresponde al símbolo `<` (un user → muchos projects). El `field: user_id` corresponde al campo `user_id` de la tabla `projects`.

---

## Cómo funcionan las referencias cruzadas

| Campo | El parser busca en... |
|-------|----------------------|
| `used-by` | `project-docs/modules/backend/{id}-backend-modules.md` |
| `relations[].target` | `project-docs/database/{id}-database.md` |

Las referencias rotas generan advertencias, no errores.

---

## Ejemplos según nivel de detalle

### Mínimo (solo campos obligatorios)

```markdown
---
type: entity
id: users
name: User
description: Stores registered user accounts
---

## Table

```dbml
Table users {
  id uuid [pk]
  username varchar [not null, unique]
  password_hash varchar [not null]
  created_at timestamp [not null]
}
```
```

### Medio (con módulos que la usan y una relación)

```markdown
---
type: entity
id: users
name: User
description: Stores registered user accounts
used-by: [auth-backend]
relations:
  - target: projects
    type: one-to-many
    field: user_id
---

## Table

```dbml
Table users {
  id uuid [pk]
  username varchar [not null, unique]
  password_hash varchar [not null]
  birth_date date
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Ref: users.id < projects.user_id
```
```

### Completo (con múltiples relaciones, atributos avanzados y notas)

```markdown
---
type: entity
id: users
name: User
description: Stores registered user accounts
used-by: [auth-backend, projects-backend]
relations:
  - target: projects
    type: one-to-many
    field: user_id
  - target: sessions
    type: one-to-many
    field: user_id
---

## Table

```dbml
Table users {
  id uuid [pk]
  username varchar [not null, unique]
  email varchar [not null, unique]
  password_hash varchar [not null]
  birth_date date
  role varchar [not null, default: 'user']
  is_active boolean [not null, default: true]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Ref: users.id < projects.user_id
Ref: users.id < sessions.user_id
```

## Notes
Passwords are never stored in plain text. The password_hash field always stores a bcrypt hash with cost factor 12.
The role field accepts: 'user', 'admin'. Admin users have access to the /admin routes.
Soft-deleted users have is_active set to false instead of being removed from the table.
```

---

## Preguntas para extraer la información del usuario

1. ¿Tiene la aplicación base de datos? ¿De qué tipo? (SQL, MongoDB, etc.)
2. ¿Cuáles son las tablas o colecciones principales?
3. Para cada entidad:
   - ¿Cómo se llama y qué almacena?
   - ¿Qué campos tiene? Para cada campo: nombre, tipo de dato, si es obligatorio, si es único, si tiene valor por defecto
   - ¿Tiene clave primaria? ¿Es un UUID, un entero auto-incremental, o otro tipo?
   - ¿Tiene relaciones con otras tablas? Para cada relación: con qué tabla, de qué tipo (uno a uno, uno a muchos, muchos a muchos), cuál es el campo de enlace
   - ¿Qué módulos de backend leen o modifican esta tabla?
4. ¿Hay campos que tengan reglas de negocio importantes? (valores permitidos, restricciones, formatos esperados)

---

## Errores comunes y cómo evitarlos

| Error | Causa | Solución |
|-------|-------|----------|
| La sección `## Table` no se renderiza como diagrama | El bloque de código no tiene la etiqueta `dbml` | Usa ` ```dbml ` como apertura del bloque, no solo ` ``` ` |
| `[archivo] falta el campo requerido "description"` | Se omitió la descripción breve en el frontmatter | Añade `description:` con una línea que describe qué almacena la entidad |
| Las relaciones del frontmatter no coinciden con los `Ref` del DBML | Se definieron en un sitio pero no en el otro | Define ambas en paralelo para mantener consistencia |
| Referencia rota en `relations[].target` | El ID del target no tiene su archivo `-database.md` | Genera el archivo de la entidad destino antes de referenciarla |
| Referencia rota en `used-by` | El ID del módulo no tiene su archivo `-backend-modules.md` | Genera los módulos de backend antes que las entidades |
