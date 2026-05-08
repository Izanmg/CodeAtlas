# Arquitectura del parser

## Principio central

CodeAtlas necesita leer dos tipos de fuentes distintas (archivos Markdown y archivos de código) y producir siempre el mismo resultado: un modelo JSON unificado que el frontend puede renderizar como diagrama.

El renderizador no sabe ni le importa de dónde vino la información. Solo consume el modelo. Eso significa que los dos parsers son intercambiables y el diagrama funciona igual independientemente de la fuente.

```
[Fuentes de entrada]                [Modelo interno unificado]         [Renderizador]

  Archivos .md          ──►
                                      { modules, screens,
  Archivos de código    ──►             flows, database,      ──►    Diagrama visual
  (con bloques @codeatlas)              systemRules }
```

---

## El parser de documentación: archivos Markdown

El parser de documentación recibe una carpeta `project-docs/` con la estructura definida en `04-estructura-documental-propuesta.md` y la convierte en el modelo unificado.

El proceso sigue estos pasos para cada archivo:

```
Archivo .md
    │
    ▼
Extraer frontmatter         ← todo lo que hay entre los delimitadores ---
    │
    ▼
Parsear YAML                ← convierte el string YAML en un objeto JS
    │
    ▼
Extraer secciones Markdown  ← lee los ## Steps, ## Functions, ## Purpose, etc.
    │
    ▼
Construir objeto tipado     ← un módulo, una pantalla, un flujo, etc.
    │
    ▼
Añadir al modelo unificado
```

El parser lee los archivos en un orden concreto porque algunos dependen de otros para resolver referencias:

1. `01-modules.md` — primero, porque define el vocabulario de tipos de archivo (`file-types`) que el resto necesita
2. `modules/backend/*.md` y `modules/frontend/*.md` — los módulos, porque pantallas y flujos los referencian
3. `database/*.md` — las entidades, independientes entre sí
4. `screens/*.md` — las pantallas, que referencian módulos
5. `flows/*.md` — los flujos, que referencian módulos, pantallas y entidades
6. `05-system-rules.md` — último, porque no tiene dependencias

Una vez que todos los archivos están parseados, el `resolver.js` recorre el modelo y sustituye los IDs por referencias reales a los objetos correspondientes. Por ejemplo, el campo `module: auth-frontend` de una pantalla deja de ser un string y pasa a apuntar directamente al objeto del módulo `auth-frontend`.

> **Modificación — 2026-05-08:** al parsear los archivos de flujo, el paso de construcción de `flow.steps` incluye ahora un sub-paso adicional para cada ítem de la lista:
>
> 1. Detectar si el ítem empieza con el patrón `[capa:ref]` mediante regex.
> 2. Si existe, extraer `layer`, `moduleId`, `file` y `fn` del prefijo (los niveles separados por `/` son opcionales).
> 3. Calcular `nodeId` aplicando las convenciones del canvas: `scr-{id}` para screens, `mod-{id}` para módulos backend y frontend, `db-{id}` para tablas.
> 4. Construir el `StepObject` con todos los campos. Si no hay prefijo, todos los campos de referencia son `null`.
>
> Este cálculo de `nodeId` se realiza en el parser (backend) para que el frontend reciba la referencia ya resuelta y no necesite conocer las convenciones de prefijado de Vue Flow.

---

## El parser de código: mismo YAML, distinto contenedor

Para leer la documentación embebida en archivos de código, se usa exactamente el mismo formato YAML que ya está definido para los archivos Markdown, pero dentro de un bloque de comentario `/** */` marcado con `@codeatlas`.

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
 *   - POST /auth/logout
 * depends-on: []
 */
```

Esto permite que el parser de Markdown y el parser de código compartan el mismo núcleo de parseo YAML. La única diferencia entre ambos es cómo extraen el bloque de texto antes de parsearlo:

- **Markdown**: lee el contenido entre los delimitadores `---` del frontmatter.
- **Código**: busca bloques `/** */` que contengan `@codeatlas`, elimina los `*` iniciales de cada línea y extrae el YAML resultante.

El núcleo del sistema se escribe una sola vez.

---

## Estructura modular

Tanto el frontend como el backend siguen una estructura modular. Todo el código funcional vive dentro de una carpeta `modules/`, donde cada módulo es una carpeta con responsabilidad propia.

### Backend

```
backend/
└── modules/
    ├── parser/
    │   ├── core/
    │   │   ├── yaml-parser.js       ← parsea YAML a objetos JS
    │   │   ├── model-builder.js     ← construye el modelo unificado
    │   │   └── resolver.js          ← resuelve referencias entre IDs
    │   ├── sources/
    │   │   ├── markdown-source.js   ← extrae YAML de frontmatter .md
    │   │   └── code-source.js       ← extrae YAML de bloques @codeatlas
    │   └── index.js                 ← orquesta: recibe archivos → devuelve modelo
    ├── auth/
    ├── projects/
    └── ...
```

### Frontend

```
frontend/
└── modules/
    ├── auth/
    ├── dashboard/
    ├── diagrams/        ← renderiza el modelo JSON como diagrama visual
    └── ...
```

---

## Responsabilidades internas del módulo parser

| Archivo | Responsabilidad |
|---------|----------------|
| `sources/markdown-source.js` | Recibe una lista de archivos `.md`, extrae el bloque YAML de cada frontmatter y el contenido Markdown de las secciones |
| `sources/code-source.js` | Recibe una lista de archivos de código, localiza bloques `@codeatlas` y extrae el YAML embebido |
| `core/yaml-parser.js` | Convierte un string YAML en un objeto JS. Compartido por ambas fuentes |
| `core/model-builder.js` | Toma los objetos parseados y construye el modelo unificado final |
| `core/resolver.js` | Recorre el modelo y resuelve las referencias entre IDs (por ejemplo, `auth-frontend` → el objeto del módulo correspondiente) |
| `index.js` | Punto de entrada del módulo. Recibe los archivos, elige la fuente adecuada y devuelve el modelo completo |

---

## Modelo unificado (salida del parser)

El modelo que devuelve el parser al frontend tiene esta forma general:

```json
{
  "modules": {
    "backend": [...],
    "frontend": [...]
  },
  "screens": [...],
  "flows": [...],
  "database": [...],
  "systemRules": { ... }
}
```

Este modelo es el contrato entre el backend y el frontend. El módulo `diagrams` del frontend lo consume directamente para construir el grafo visual.

---

## Orden de desarrollo

1. Definir en detalle el modelo JSON unificado (contrato backend ↔ frontend)
2. Construir el módulo `parser` del backend — primero con `markdown-source`, que es el MVP
3. Construir el módulo `diagrams` del frontend — recibe el modelo y renderiza el grafo
4. En el siguiente avance: añadir `code-source` al módulo `parser`, que enchufa al mismo pipeline y devuelve el mismo modelo
