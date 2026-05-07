# 02 — sources/markdown-source.js

## Qué hace
Recibe un array de objetos `{ filename, content }` y de cada uno extrae el bloque YAML del frontmatter y el contenido de las secciones Markdown. No valida ni transforma — solo extrae. La validación la hace `validator.js` y la transformación `model-builder.js`.

## Por qué trabaja sobre strings y no sobre archivos
Para que el pipeline sea compartido con el futuro code parser. El code parser extraerá bloques `@codeatlas` del código, los convertirá a strings con formato `.md` y los pasará a esta misma función. Así el núcleo del parser no cambia.

## Relación con otros archivos de configuración

`markdown-source.js` no sabe qué secciones son esperadas ni qué campos son requeridos — eso no es su responsabilidad. Solo extrae todo lo que encuentra:

- **Qué secciones son esperadas** → definido en `core/sections.config.js`
- **Qué campos del frontmatter son requeridos** → definido en `core/frontmatter.config.js`

`markdown-source.js` devuelve todas las secciones que encuentre, tanto las esperadas como las que no lo son. La separación entre secciones conocidas y extensiones la hace `model-builder.js` usando `sections.config.js`.

---

## Firma

```js
// Recibe: array de objetos { filename: string, content: string }
// Devuelve: array de objetos { filename, yaml, sections } — sin los que no tienen frontmatter
export function extractFromMarkdown(files) {}
```

---

## Estructura mínima del archivo

```js
export function extractFromMarkdown(files) {
  return files
    .map(file => extractOne(file))
    .filter(Boolean)
}

function extractOne({ filename, content }) {
  const yaml = extractFrontmatter(content)
  if (!yaml) return null

  const sections = extractSections(content)

  return { filename, yaml, sections }
}

function extractFrontmatter(content) {
  // extrae el string YAML entre los dos ---
}

function extractSections(content) {
  // extrae todas las secciones ## como objeto { nombre: contenido }
}
```

---

## Lógica de `extractFrontmatter`

El frontmatter está entre el primer y el segundo `---` del string:

```
---          ← primer ---
type: screen
id: login
---          ← segundo ---

## Description
...
```

```js
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  return match ? match[1] : null
}
```

Si el archivo no tiene frontmatter (no hay match), devuelve `null`. El llamador descarta ese archivo.

---

## Lógica de `extractSections`

Las secciones empiezan con `##` seguido del nombre. El contenido de cada sección es todo lo que hay hasta el siguiente `##` o el final del string.

```js
function extractSections(content) {
  const sections = {}
  const sectionRegex = /^## (.+)$([\s\S]*?)(?=^## |\Z)/gm

  let match
  while ((match = sectionRegex.exec(content)) !== null) {
    const name = match[1].trim().toLowerCase()
    const body = match[2].trim()
    sections[name] = body
  }

  return sections
}
```

Devuelve todas las secciones sin filtrar — tanto las esperadas como las que no lo son. La clave es el nombre en minúsculas, el valor es el contenido como string sin espacios sobrantes en los extremos.

### Qué pasa con secciones no esperadas

`extractSections` no las ignora — las incluye igual en el objeto `sections`. Es `model-builder.js` quien, consultando `sections.config.js`, las separa en `knownSections` y `extensions`. Las extensiones se guardan en el campo `extensions` del objeto del modelo y el diagrama las muestra como bloques adicionales diferenciados.

Ejemplo: si un archivo de pantalla incluye una sección `## Accessibility` que no está definida como sección esperada para `screen`, aparecerá en `extensions.accessibility` del objeto resultante.

---

## Resultado esperado

Entrada:
```md
---
type: screen
id: login
name: Login
description: Entry point for unauthenticated users
module: auth-frontend
requires-auth: false
---

## Description
Allows unauthenticated users to log in.

## Elements
- username input
- password input

## Accessibility
Meets WCAG 2.1 AA standards.
```

Salida:
```js
{
  filename: "login-screens.md",
  yaml: "type: screen\nid: login\nname: Login\ndescription: Entry point for unauthenticated users\nmodule: auth-frontend\nrequires-auth: false",
  sections: {
    "description": "Allows unauthenticated users to log in.",
    "elements": "- username input\n- password input",
    "accessibility": "Meets WCAG 2.1 AA standards."   // ← sección no esperada, pasa igualmente
  }
}
```

`accessibility` no es una sección esperada para `screen` — pero `markdown-source` la incluye de todas formas. `model-builder` la detectará como extensión y la guardará en `extensions.accessibility`.
