# Backend — Módulo parser

Este archivo define cómo funcionará exactamente el módulo parser del backend antes de escribir el código.

## Objetivo
Recibir los archivos `.md` de documentación subidos por el usuario, procesarlos y devolver el modelo JSON unificado definido en `arquitectura-general/03-modelo-json-unificado.md`.

## Estructura de archivos

El módulo sigue el esquema estándar de todos los módulos del backend, más sus subcarpetas propias:

```
parser/
├── parser.routes.js       ← endpoints del módulo
├── parser.controller.js   ← recibe la petición y devuelve la respuesta
├── parser.service.js      ← lógica de negocio
├── parser.repository.js   ← consultas a base de datos
├── core/
│   ├── yaml-parser.js     ← convierte un string YAML en objeto JS
│   ├── model-builder.js   ← construye el modelo JSON unificado
│   └── resolver.js        ← resuelve las referencias entre IDs
└── sources/
    └── markdown-source.js ← extrae el YAML del frontmatter de cada .md

```

---

## Endpoints

```
POST /api/parser/doc
Content-Type: multipart/form-data
```
El usuario sube todos sus archivos `.md` en una sola petición. El backend los procesa y devuelve el modelo JSON unificado.

```
POST /api/parser/code
Content-Type: multipart/form-data
```
El usuario sube sus archivos de código. El backend extrae los bloques `@codeatlas` y devuelve el mismo modelo JSON unificado.

> Por ahora solo se desarrolla `POST /api/parser/doc`. El endpoint de código queda reservado para el siguiente avance.

---

## Flujo completo

```
Petición con archivos .md
        │
        ▼
parser.controller.js
recibe los archivos (multer) y llama al service
        │
        ▼
parser.service.js
orquesta el proceso:
  1. llama a markdown-source para extraer el YAML de cada archivo
  2. llama a yaml-parser para convertir cada YAML en objeto JS
  3. llama a model-builder para construir el modelo unificado
  4. llama a resolver para resolver las referencias entre IDs
  5. guarda el modelo en base de datos (repository)
        │
        ▼
parser.controller.js
devuelve el modelo JSON al frontend
```

---

## Responsabilidades por archivo

### `parser.routes.js`
Define el endpoint `POST /api/parser/parse` y aplica el middleware de multer para aceptar los archivos subidos.

### `parser.controller.js`
- Recibe los archivos del middleware multer
- Llama a `parser.service.js` con los archivos
- Devuelve el modelo JSON con status 200, o el error correspondiente si algo falla

### `parser.service.js`
- Orquesta el proceso completo de parseo
- Llama a `markdown-source` para obtener los bloques YAML y el contenido Markdown de cada archivo
- Llama a `yaml-parser` para convertir cada bloque en objeto JS
- Llama a `model-builder` para ensamblar el modelo unificado
- Llama a `resolver` para sustituir los IDs por referencias cruzadas resueltas
- Llama al repository para persistir el modelo

### `parser.repository.js`
- Guarda el modelo JSON generado en la base de datos asociado al proyecto
- Permite recuperar el modelo guardado para cargarlo sin reparsear

### `core/yaml-parser.js`
- Recibe un string YAML
- Lo convierte en un objeto JS usando `js-yaml`
- Lo devuelve al llamador

### `core/model-builder.js`
- Recibe la lista de objetos parseados (uno por archivo)
- Los clasifica por tipo (`module`, `screen`, `flow`, `entity`, `system-rules`)
- Ensambla y devuelve el modelo JSON unificado con la estructura definida en `03-modelo-json-unificado.md`

### `core/resolver.js`
- Recibe el modelo unificado
- Recorre todos los campos de referencia (por ejemplo `module: "auth-frontend"` en una pantalla)
- Verifica que cada ID referenciado existe en el modelo
- Devuelve el modelo con las referencias validadas (los valores siguen siendo IDs, no objetos)

### `sources/markdown-source.js`
- Recibe un array de **strings de contenido** (no archivos directamente)
- De cada string extrae:
  - El bloque YAML del frontmatter (entre los `---`)
  - El contenido de cada sección Markdown (`## Steps`, `## Purpose`, etc.)
- Devuelve un array de objetos `{ yaml: string, sections: { [nombre]: string } }`

> Trabajar sobre strings y no sobre archivos es una decisión deliberada: permite que tanto el doc parser como el code parser usen el mismo `markdown-source` sin duplicar lógica.

### `sources/code-source.js` _(no se desarrolla en este avance)_
- Recibe un array de archivos de código
- Localiza los bloques `@codeatlas` dentro de los comentarios `/** */`
- Elimina los `*` iniciales de cada línea y formatea el resultado como contenido `.md` válido
- Pasa esos strings a `markdown-source` y devuelve su resultado

El pipeline a partir de `markdown-source` es idéntico para los dos casos. El único código nuevo que necesita el code parser es `code-source.js`.

---

## Orden de procesamiento de archivos

El service procesa los archivos en este orden para que las referencias estén disponibles cuando se necesiten:

1. `01-modules.md` — vocabulario de tipos de archivo
2. `modules/backend/*.md` y `modules/frontend/*.md` — módulos
3. `database/*.md` — entidades
4. `screens/*.md` — pantallas
5. `flows/*.md` — flujos
6. `05-system-rules.md` — reglas del sistema

---

## Respuesta

El endpoint devuelve el modelo JSON unificado definido en `arquitectura-general/03-modelo-json-unificado.md`:

```json
{
  "modules": { "backend": [...], "frontend": [...] },
  "screens": [...],
  "flows": [...],
  "database": [...],
  "systemRules": {}
}
```

---

## Code parser — diseño previo (no se implementa en este avance)

El endpoint `POST /api/parser/code` recibirá archivos de código fuente. La documentación estará embebida en los propios archivos dentro de bloques `/** */` marcados con `@codeatlas`, usando el mismo formato YAML que los archivos `.md`:

```js
/**
 * @codeatlas
 * type: module
 * layer: backend
 * id: auth-backend
 * name: Authentication
 * description: Handles user identity and session management
 * database: [users]
 * api:
 *   - POST /auth/login
 * depends-on: []
 */
```

El flujo del code parser será:

```
Archivos de código
        │
        ▼
code-source.js
1. Localiza todos los bloques /** @codeatlas ... */ en cada archivo
2. Elimina los * iniciales de cada línea
3. Construye un string con formato .md válido por cada bloque encontrado
        │
        ▼
markdown-source.js       ← mismo que usa el doc parser
        │
        ▼
yaml-parser → model-builder → resolver → repository
             (pipeline idéntico al doc parser)
```

---

## Cómo comparten código los dos parsers sin duplicar lógica

La clave está en que `markdown-source.js` trabaja sobre **strings de contenido**, no sobre archivos. Esto permite que cualquier fuente — ya sean archivos `.md` reales o bloques extraídos de código — alimente el mismo pipeline.

```
doc parser:
  archivos .md
      → leer contenido como strings
      → markdown-source.js
      → yaml-parser → model-builder → resolver

code parser:
  archivos de código
      → code-source.js extrae bloques @codeatlas y los convierte a strings .md
      → markdown-source.js        ← mismo archivo, misma función
      → yaml-parser → model-builder → resolver
```

Todo el núcleo del parser (`markdown-source`, `yaml-parser`, `model-builder`, `resolver`) se escribe una sola vez y es compartido. El único código exclusivo de cada fuente es:

| Archivo | Exclusivo de |
|---------|-------------|
| `sources/markdown-source.js` | Compartido por los dos (procesa el contenido) |
| `sources/code-source.js` | Solo code parser (extrae y formatea los bloques) |

Cuando llegue el momento de implementar el code parser, no habrá que tocar nada del núcleo. Solo añadir `code-source.js` y conectar el endpoint `POST /api/parser/code` en el controller.

