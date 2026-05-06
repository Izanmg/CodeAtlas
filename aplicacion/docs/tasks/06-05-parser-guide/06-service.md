# 06 — parser.service.js

## Qué hace
Orquesta el proceso completo de parseo. Es el único punto de entrada del módulo para el controller. Recibe los archivos crudos y devuelve el modelo JSON unificado listo para persistir y devolver.

## Responsabilidad
Este archivo no tiene lógica propia — solo llama a los demás en el orden correcto. Si hay que cambiar el pipeline (añadir un paso, cambiar el orden), este es el único archivo que hay que tocar.

---

## Firma

```js
// Recibe: array de objetos { filename: string, content: string }
// Devuelve: el modelo JSON unificado
// Lanza: Error si algún archivo falla la validación del frontmatter
export async function parseDocumentation(files) {}
```

---

## Estructura mínima del archivo

```js
import { extractFromMarkdown } from './sources/markdown-source.js'
import { parseYaml }           from './core/yaml-parser.js'
import { validateFrontmatter } from './core/validator.js'
import { buildModel }          from './core/model-builder.js'
import { resolveReferences }   from './core/resolver.js'
import { saveModel }           from './parser.repository.js'

export async function parseDocumentation(files) {
  const sorted    = sortFiles(files)
  const extracted = extractFromMarkdown(sorted)
  const parsed    = validateAndParse(extracted, sorted)
  const model     = buildModel(parsed)
  const resolved  = resolveReferences(model)

  await saveModel(resolved)
  return resolved
}
```

---

## Lógica de `sortFiles`

Los archivos deben procesarse en un orden concreto para que las referencias estén disponibles cuando se necesiten (los módulos antes que las pantallas, las pantallas antes que los flujos, etc.).

```js
function sortFiles(files) {
  const ORDER = [
    f => f.filename.includes('01-modules'),          // 1. índice de módulos
    f => f.filename.includes('modules/backend/') || f.filename.includes('modules/frontend/'),  // 2. módulos
    f => f.filename.includes('database/'),            // 3. entidades
    f => f.filename.includes('screens/'),             // 4. pantallas
    f => f.filename.includes('flows/'),               // 5. flujos
    f => f.filename.includes('05-system-rules'),      // 6. reglas del sistema
  ]

  const buckets = ORDER.map(() => [])
  const rest = []

  for (const file of files) {
    const bucketIndex = ORDER.findIndex(match => match(file))
    if (bucketIndex !== -1) {
      buckets[bucketIndex].push(file)
    } else {
      rest.push(file)
    }
  }

  return [...buckets.flat(), ...rest]
}
```

Cada archivo cae en el primer bucket cuya condición cumple. Los que no encajan en ninguno van al final.

---

## Lógica de `validateAndParse`

Parsea el YAML de cada archivo extraído y valida su frontmatter. Si alguno falla, el error sube directamente al controller sin capturarse aquí — es un error del usuario.

```js
function validateAndParse(extracted, sortedFiles) {
  return extracted
    .map((item, i) => {
      const yaml = parseYaml(item.yaml)
      if (!yaml) return null

      // lanza si el frontmatter no cumple el schema esperado
      validateFrontmatter(yaml, item.yaml, sortedFiles[i].filename)

      return { yaml, sections: item.sections }
    })
    .filter(Boolean)
}
```
