# AGENTS.md — CodeAtlas

Contexto general del proyecto para agentes de IA. Lee este archivo antes de tocar cualquier cosa.

---

## Qué es CodeAtlas

CodeAtlas es una aplicación web que lee archivos de documentación estructurados en Markdown y genera diagramas visuales de la arquitectura de una aplicación. El usuario sube sus archivos `.md`, el backend los parsea y devuelve un modelo JSON, y el frontend lo representa como un diagrama interactivo.

---

## Stack

| Parte | Tecnología |
|-------|-----------|
| Frontend | Vue 3 + Vite + Vue Router + Pinia |
| Backend | Node.js + Express (ES Modules) |

---

## Estructura del proyecto

```
aplicacion/
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   ├── projects/
│       │   └── parser/
│       │       ├── core/
│       │       └── sources/
│       ├── app.js
│       └── server.js
├── frontend/
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── projects/
│       │   └── diagrams/
│       ├── router/
│       │   └── index.js
│       ├── App.vue
│       └── main.js
└── docs/
    ├── backend.md
    ├── frontend.md
    └── tasks/
        └── done/
```

---

## Cómo arrancar

```bash
# Backend — http://localhost:3000
cd backend && npm run dev

# Frontend — http://localhost:5173
cd frontend && npm run dev
```

---

## Convenciones

### Backend
- ES Modules en todo el backend (`import/export`, `"type": "module"` en package.json)
- Todos los módulos siguen el mismo esquema de archivos:
  ```
  [modulo].routes.js      → define los endpoints
  [modulo].controller.js  → recibe la petición, devuelve la respuesta
  [modulo].service.js     → lógica de negocio
  [modulo].repository.js  → consultas a base de datos
  ```
- Las rutas de cada módulo se registran en `app.js`
- Variables de entorno en `.env` (no committed), leídas con `dotenv`

### Frontend
- Un módulo por funcionalidad dentro de `src/modules/`
- Cada módulo tiene sus propias `views/`, `stores/` y define sus propias rutas
- El router central está en `src/router/index.js`
- Estado global gestionado con Pinia

### Documentación en el código

**Todo el código debe estar ampliamente documentado y la documentación debe estar siempre en español.** El objetivo es que cualquier persona pueda entender qué hace cada archivo, función y bloque de lógica sin necesidad de contexto externo.

Reglas concretas:

- **El idioma de la documentación es siempre español.** Todos los comentarios de bloque, JSDoc, comentarios inline y mensajes de error en consola deben estar en español.
- **Cada archivo** debe empezar con un comentario de bloque que explique qué hace, de qué es responsable y qué no hace (límites de responsabilidad).
- **Cada función exportada** debe tener un JSDoc con `@param`, `@returns` y una descripción de su propósito.
- **La lógica no obvia** dentro de las funciones debe tener comentarios inline que expliquen el porqué, no el qué.
- **Las decisiones de diseño** que no sean evidentes deben estar comentadas en el sitio donde se aplican.

Ejemplo de lo que se espera:

```js
/**
 * yaml-parser.js
 *
 * Convierte un string YAML en un objeto JS plano.
 * Es un wrapper fino sobre js-yaml que añade un manejo de errores estructurado.
 *
 * Responsabilidad: solo conversión de formato (YAML → objeto JS).
 * NO valida la presencia de campos, ni los tipos, ni reglas de negocio — eso es validator.js.
 * NO convierte los nombres de campo a camelCase — eso es model-builder.js.
 */

import yaml from 'js-yaml'

/**
 * Parsea un string YAML y devuelve el objeto JS resultante.
 *
 * @param {string} yamlString - Contenido YAML extraído del frontmatter de un .md
 * @returns {object|null} Objeto JS parseado, o null si la entrada está vacía
 * @throws {Error} Si el YAML tiene errores de sintaxis — incluye línea, columna y un fragmento del contenido
 */
export function parseYaml(yamlString) {
  if (!yamlString || !yamlString.trim()) return null

  try {
    return yaml.load(yamlString)
  } catch (error) {
    throw new Error(formatYamlError(error, yamlString))
  }
}
```

---

## Arquitectura del sistema

El flujo principal:

```
Archivos .md → Parser (backend) → JSON → Frontend → Diagrama visual
```

El JSON generado se guarda en base de datos para no tener que reparsear en cada carga. Los archivos `.md` no se guardan — si el usuario quiere actualizar, vuelve a subirlos.

---

## Módulo parser (backend)

Es el núcleo de la aplicación. Recibe archivos `.md`, los procesa y devuelve el modelo JSON unificado.

**Endpoints:**
- `POST /api/parser/doc` — parsea archivos `.md` de documentación *(implementado)*
- `POST /api/parser/code` — parsea archivos de código con bloques `@codeatlas` *(pendiente)*

**Pipeline interno:**
```
archivos .md
  → markdown-source.js  (extrae YAML y secciones de cada archivo)
  → yaml-parser.js      (convierte YAML a objeto JS)
  → model-builder.js    (ensambla el modelo JSON unificado)
  → resolver.js         (valida referencias entre IDs)
  → repository          (persiste el modelo en BD)
```

El pipeline es compartido entre doc parser y code parser. El único código específico de cada fuente es el extractor (`markdown-source` / `code-source`). Ambos trabajan sobre strings de contenido, no sobre archivos directamente.

---

## Documentación interna

| Archivo | Contenido |
|---------|-----------|
| `docs/backend.md` | Funcionamiento general del backend |
| `docs/frontend.md` | Funcionamiento general del frontend |
| `docs/tasks/` | Tareas activas — una por módulo o funcionalidad |
| `docs/tasks/done/` | Tareas completadas |

Los archivos de tarea se nombran `DD-MM-nombre.md` (ejemplo: `06-05-backend-parser.md`). Cada tarea define cómo funciona algo antes de escribir el código.

---

## Documentación de formatos

Los formatos de los archivos `.md` que lee CodeAtlas están definidos en:

```
estructura-proyecto/lector-de-archivos/
├── 04.1-formato-modulos.md
├── 04.2-formato-indice-modulos.md
├── 04.3-formato-screens.md
├── 04.4-formato-flows.md
├── 04.5-formato-database.md
└── 04.6-formato-system-rules.md
```

El modelo JSON que produce el parser está definido en:

```
estructura-proyecto/arquitectura-general/03-modelo-json-unificado.md
```
