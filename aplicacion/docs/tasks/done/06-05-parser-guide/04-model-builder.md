# 04 — core/model-builder.js

## Qué hace
Recibe la lista de objetos parseados (uno por archivo) y los ensambla en el modelo JSON unificado definido en `arquitectura-general/03-modelo-json-unificado.md`. Convierte los campos de kebab-case a camelCase y separa las secciones conocidas de las extensiones.

## Responsabilidad
Este archivo transforma datos — convierte el resultado crudo del parser en el modelo estructurado que consume el frontend. No valida (eso es `validator.js`), no extrae (eso es `markdown-source.js`), no resuelve referencias (eso es `resolver.js`).

---

## Firma

```js
// Recibe: array de objetos { filename, yaml, sections }
// Devuelve: el modelo JSON unificado
export function buildModel(parsedFiles) {}
```

---

## Estructura mínima del archivo

```js
import { EXPECTED_SECTIONS } from './sections.config.js'

export function buildModel(parsedFiles) {
  const model = {
    modules: { backend: [], frontend: [] },
    screens: [],
    flows: [],
    database: [],
    systemRules: {}
  }

  for (const { yaml, sections } of parsedFiles) {
    const { knownSections, extensions } = splitSections(yaml.type, sections)
    dispatch(model, yaml, knownSections, extensions)
  }

  return model
}

// Enruta cada archivo a su función constructora según yaml.type
function dispatch(model, yaml, knownSections, extensions) {
  switch (yaml.type) {
    case 'modules-index':
      // no añade nada al modelo, solo sirve para el validator
      break
    case 'module':
      const built = buildModule(yaml, knownSections, extensions)
      model.modules[yaml.layer].push(built)
      break
    case 'screen':
      model.screens.push(buildScreen(yaml, knownSections, extensions))
      break
    case 'flow':
      model.flows.push(buildFlow(yaml, knownSections, extensions))
      break
    case 'entity':
      model.database.push(buildEntity(yaml, knownSections, extensions))
      break
    case 'system-rules':
      model.systemRules = buildSystemRules(yaml, knownSections, extensions)
      break
    default:
      console.warn(`[model-builder] Unknown type "${yaml.type}", skipping`)
  }
}

// Separa las secciones en conocidas y extensiones usando sections.config.js
function splitSections(type, sections) {
  const expected = EXPECTED_SECTIONS[type] ?? []
  const knownSections = {}
  const extensions = {}

  for (const [key, value] of Object.entries(sections)) {
    if (expected.includes(key)) {
      knownSections[key] = value
    } else {
      extensions[key] = value
    }
  }

  return { knownSections, extensions }
}
```

---

## Funciones constructoras

Cada función convierte el objeto yaml (kebab-case) en el objeto del modelo (camelCase) y añade `extensions`.

### `buildModule(yaml, knownSections, extensions)`

```js
function buildModule(yaml, knownSections, extensions) {
  const base = {
    id: yaml.id,
    name: yaml.name,
    description: yaml.description,
    layer: yaml.layer,
    folders: yaml.folders ?? [],
    files: yaml.files ?? [],
    dependsOn: yaml['depends-on'] ?? [],
    functions: parseFunctions(knownSections['functions'] ?? ''),
    purpose: knownSections['purpose'] ?? null,
    notes: knownSections['notes'] ?? null,
    extensions
  }

  if (yaml.layer === 'backend') {
    return { ...base, api: yaml.api ?? [], database: yaml.database ?? [] }
  }

  return {
    ...base,
    screens: yaml.screens ?? [],
    consumesApi: yaml['consumes-api'] ?? [],
    state: parseList(knownSections['state'] ?? '')
  }
}
```

### `buildScreen(yaml, knownSections, extensions)`

```js
function buildScreen(yaml, knownSections, extensions) {
  return {
    id: yaml.id,
    name: yaml.name,
    description: yaml.description,
    module: yaml.module,
    folder: yaml.folder ?? null,
    file: yaml.file ?? null,
    requiresAuth: yaml['requires-auth'],
    routes: yaml.routes ?? [],
    navigatesTo: yaml['navigates-to'] ?? [],
    components: yaml.components ?? [],
    fullDescription: knownSections['description'] ?? null,
    elements: parseList(knownSections['elements'] ?? ''),
    actions: parseList(knownSections['actions'] ?? ''),
    states: parseList(knownSections['states'] ?? ''),
    extensions
  }
}
```

### `buildFlow(yaml, knownSections, extensions)`

```js
function buildFlow(yaml, knownSections, extensions) {
  return {
    id: yaml.id,
    name: yaml.name,
    description: yaml.description,
    trigger: yaml.trigger,
    screens: yaml.screens ?? [],
    modules: yaml.modules ?? [],
    database: yaml.database ?? [],
    steps: parseList(knownSections['steps'] ?? ''),
    errorCases: parseList(knownSections['error cases'] ?? ''),
    notes: knownSections['notes'] ?? null,
    extensions
  }
}
```

### `buildEntity(yaml, knownSections, extensions)`

```js
function buildEntity(yaml, knownSections, extensions) {
  return {
    id: yaml.id,
    name: yaml.name,
    description: yaml.description,
    usedBy: yaml['used-by'] ?? [],
    relations: yaml.relations ?? [],
    table: knownSections['table'] ?? null,
    notes: knownSections['notes'] ?? null,
    extensions
  }
}
```

### `buildSystemRules(yaml, knownSections, extensions)`

```js
function buildSystemRules(yaml, knownSections, extensions) {
  return {
    auth: parseList(knownSections['auth'] ?? ''),
    navigation: parseList(knownSections['navigation'] ?? ''),
    validation: parseList(knownSections['validation'] ?? ''),
    conventions: parseList(knownSections['conventions'] ?? ''),
    technicalDecisions: parseList(knownSections['technical decisions'] ?? ''),
    extensions
  }
}
```

---

## Funciones auxiliares internas

### `parseList(text)`

Convierte un bloque de texto Markdown con items de lista en un array de strings limpios.

```js
function parseList(text) {
  if (!text) return []

  return text
    .split('\n')
    .map(line => line.replace(/^(\s*[-*]|\s*\d+\.)\s+/, '').trim())
    .filter(line => line.length > 0)
}
```

Ejemplos:
```
"- item one\n- item two"   →  ["item one", "item two"]
"1. first\n2. second"      →  ["first", "second"]
```

### `parseFunctions(text)`

Convierte la sección `## Functions` en un objeto donde la clave es el ID del archivo y el valor es un array de funciones.

```js
function parseFunctions(text) {
  if (!text) return {}

  const result = {}
  let currentKey = '_'

  for (const line of text.split('\n')) {
    const subsection = line.match(/^###\s+(.+)/)
    if (subsection) {
      currentKey = subsection[1].trim()
      result[currentKey] = []
      continue
    }

    const fn = line.replace(/^[-*]\s+/, '').trim()
    if (fn) {
      if (!result[currentKey]) result[currentKey] = []
      result[currentKey].push(fn)
    }
  }

  return result
}
```

Ejemplos:
```js
// Con subsecciones ### → vinculado a archivos
"### auth-controller\n- login()\n- register()\n### auth-service\n- hashPassword()"
→ { "auth-controller": ["login()", "register()"], "auth-service": ["hashPassword()"] }

// Sin subsecciones → clave "_"
"- login()\n- register()"
→ { "_": ["login()", "register()"] }
```
