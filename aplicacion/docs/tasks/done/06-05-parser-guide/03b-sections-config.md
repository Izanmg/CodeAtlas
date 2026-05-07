# 03b — core/sections.config.js

## Qué hace
Define las secciones Markdown esperadas para cada tipo de archivo. Es la fuente de verdad que usa el model-builder para distinguir entre secciones conocidas y extensiones.

## Por qué existe este archivo
Centralizar aquí las secciones esperadas permite que el model-builder las trate de forma estructurada (parseando su contenido) y que cualquier otra sección no listada se guarde como extensión, sin que haga falta tocar el model-builder para añadir o cambiar secciones en el futuro.

## Contenido

```js
export const EXPECTED_SECTIONS = {
  'modules-index': ['overview'],
  'module': ['purpose', 'functions', 'state', 'notes'],
  'screen': ['description', 'elements', 'actions', 'states'],
  'flow': ['steps', 'error cases', 'notes'],
  'entity': ['table', 'notes'],
  'system-rules': ['auth', 'navigation', 'validation', 'conventions', 'technical decisions']
}
```

## Cómo lo usa el model-builder

Para cada archivo parseado, el model-builder separa sus secciones en dos grupos:

```js
import { EXPECTED_SECTIONS } from './sections.config.js'

const expected = EXPECTED_SECTIONS[yaml.type] ?? []

const knownSections = {}
const extensions = {}

for (const [key, value] of Object.entries(sections)) {
  if (expected.includes(key)) {
    knownSections[key] = value
  } else {
    extensions[key] = value
  }
}
```

- `knownSections` → se procesa de forma específica en cada función constructora (`buildModule`, `buildScreen`, etc.)
- `extensions` → se añade tal cual al campo `extensions` del objeto resultante

## El campo `extensions` en el modelo

Todos los tipos del modelo incluyen un campo `extensions`:

```js
{
  id: "login",
  name: "Login",
  // ... campos normales ...
  extensions: {
    "accessibility": "This screen meets WCAG 2.1 AA standards.",
    "analytics": "Tracks login attempts and success rate."
  }
}
```

Si no hay secciones extra, `extensions` es un objeto vacío `{}`.

## Para el diagrama

El módulo de diagramas del frontend debe renderizar las extensiones como bloques adicionales visualmente diferenciados de las secciones estándar. Así el usuario puede documentar información extra sin perderla ni romper el esquema.
