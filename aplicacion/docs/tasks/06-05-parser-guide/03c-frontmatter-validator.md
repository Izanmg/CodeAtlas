# 03c — core/frontmatter.config.js y core/validator.js

## Por qué existe la validación

El parser necesita detectar errores en los archivos `.md` lo antes posible y con mensajes que digan exactamente qué archivo tiene el problema y en qué línea. Un archivo con un campo requerido ausente o un tipo incorrecto no debe llegar al model-builder.

La validación ocurre justo después del parseo YAML, antes de construir el modelo.

---

## frontmatter.config.js

Define los campos requeridos, opcionales y sus tipos esperados para cada valor de `type`. Es la fuente de verdad derivada de los formatos definidos en `estructura-proyecto/lector-de-archivos/`.

```js
export const FRONTMATTER_SCHEMA = {
  'modules-index': {
    required: ['type', 'backend', 'frontend', 'file-types'],
    optional: [],
    types: {
      type: 'string',
      backend: 'array',
      frontend: 'array',
      'file-types': 'object'
    }
  },

  'module': {
    required: ['type', 'layer', 'id', 'name', 'description'],
    requiredByLayer: {
      backend: ['database', 'api', 'depends-on'],
      frontend: ['screens', 'consumes-api', 'depends-on']
    },
    optional: ['folders', 'files'],
    types: {
      type: 'string',
      layer: 'string',
      id: 'string',
      name: 'string',
      description: 'string',
      database: 'array',
      api: 'array',
      'depends-on': 'array',
      screens: 'array',
      'consumes-api': 'array',
      folders: 'array',
      files: 'array'
    }
  },

  'screen': {
    required: ['type', 'id', 'name', 'description', 'module', 'requires-auth'],
    optional: ['folder', 'file', 'routes', 'navigates-to', 'components'],
    types: {
      type: 'string',
      id: 'string',
      name: 'string',
      description: 'string',
      module: 'string',
      'requires-auth': 'boolean',
      folder: 'string',
      file: 'string',
      routes: 'array',
      'navigates-to': 'array',
      components: 'array'
    }
  },

  'flow': {
    required: ['type', 'id', 'name', 'description', 'trigger'],
    optional: ['screens', 'modules', 'database'],
    types: {
      type: 'string',
      id: 'string',
      name: 'string',
      description: 'string',
      trigger: 'string',
      screens: 'array',
      modules: 'array',
      database: 'array'
    }
  },

  'entity': {
    required: ['type', 'id', 'name', 'description'],
    optional: ['used-by', 'relations'],
    types: {
      type: 'string',
      id: 'string',
      name: 'string',
      description: 'string',
      'used-by': 'array',
      relations: 'array'
    }
  },

  'system-rules': {
    required: ['type'],
    optional: [],
    types: {
      type: 'string'
    }
  }
}

export const VALID_TYPES = Object.keys(FRONTMATTER_SCHEMA)
export const VALID_LAYERS = ['backend', 'frontend']
```

---

## validator.js

### Firma

```js
// Recibe: objeto yaml parseado, string yaml original (para calcular líneas), nombre del archivo
// Lanza un Error si algo no cuadra, no devuelve nada si todo está bien
export function validateFrontmatter(yaml, rawYaml, filename) {}
```

### Lógica interna

#### 1. Comprobar que `type` existe y es válido

```js
if (!yaml.type) {
  throw new Error(`[${filename}] missing required field "type" in frontmatter`)
}
if (!VALID_TYPES.includes(yaml.type)) {
  const line = getFieldLine(rawYaml, 'type')
  throw new Error(`[${filename}:${line}] unknown type "${yaml.type}". Valid types: ${VALID_TYPES.join(', ')}`)
}
```

#### 2. Obtener el schema del tipo

```js
const schema = FRONTMATTER_SCHEMA[yaml.type]
```

#### 3. Para `module`, comprobar que `layer` existe y es válido antes de seguir

```js
if (yaml.type === 'module') {
  if (!yaml.layer) {
    throw new Error(`[${filename}] missing required field "layer" in frontmatter`)
  }
  if (!VALID_LAYERS.includes(yaml.layer)) {
    const line = getFieldLine(rawYaml, 'layer')
    throw new Error(`[${filename}:${line}] invalid value "${yaml.layer}" for field "layer". Must be "backend" or "frontend"`)
  }
}
```

#### 4. Construir la lista de campos requeridos efectivos

```js
let requiredFields = [...schema.required]
if (yaml.type === 'module' && schema.requiredByLayer) {
  requiredFields = requiredFields.concat(schema.requiredByLayer[yaml.layer] ?? [])
}
```

#### 5. Comprobar campos requeridos ausentes

```js
for (const field of requiredFields) {
  if (yaml[field] === undefined || yaml[field] === null) {
    throw new Error(`[${filename}] missing required field "${field}" in frontmatter`)
  }
}
```

#### 6. Comprobar tipos de los campos presentes

Para todos los campos presentes en el yaml (tanto requeridos como opcionales), si el schema define su tipo, validarlo:

```js
for (const [field, value] of Object.entries(yaml)) {
  const expectedType = schema.types[field]
  if (!expectedType) continue  // campo desconocido, no validar tipo

  const actualType = Array.isArray(value) ? 'array' : typeof value
  if (actualType !== expectedType) {
    const line = getFieldLine(rawYaml, field)
    throw new Error(
      `[${filename}:${line}] field "${field}" must be ${expectedType}, got ${actualType}`
    )
  }
}
```

#### 7. Función auxiliar `getFieldLine`

Busca el nombre del campo en el string YAML original y devuelve el número de línea donde aparece. Si no lo encuentra, devuelve `'?'`.

```js
function getFieldLine(rawYaml, fieldName) {
  const lines = rawYaml.split('\n')
  const index = lines.findIndex(line => line.trimStart().startsWith(fieldName + ':'))
  return index === -1 ? '?' : index + 1
}
```

> El número de línea es relativo al bloque YAML del frontmatter, no al archivo completo. Es suficiente para localizar el problema rápidamente.

---

## Dónde se llama al validador

En `parser.service.js`, justo después de parsear el YAML y antes de construir el modelo:

```js
import { validateFrontmatter } from './core/validator.js'

const parsed = extracted.map((item, i) => {
  const yaml = parseYaml(item.yaml)
  if (!yaml) return null

  validateFrontmatter(yaml, item.yaml, files[i].filename)  // lanza si hay error

  return { yaml, sections: item.sections }
}).filter(Boolean)
```

Si `validateFrontmatter` lanza un error, el service no lo captura — lo deja subir hasta el controller, que lo devuelve como respuesta `400` con el mensaje exacto del error.

---

## Ejemplos de mensajes de error

```
[login-screens.md] missing required field "module" in frontmatter
[auth-backend-modules.md:5] field "depends-on" must be array, got string
[user-login-flows.md:2] unknown type "process". Valid types: module, screen, flow, entity, system-rules, modules-index
[auth-frontend-modules.md] missing required field "consumes-api" in frontmatter
[users-database.md:3] field "used-by" must be array, got string
```
