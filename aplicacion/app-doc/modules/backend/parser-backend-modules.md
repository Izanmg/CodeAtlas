---
type: module
layer: backend
id: parser-backend
name: Parser
description: Recibe archivos .md de documentación, los procesa por un pipeline secuencial y devuelve un modelo JSON con el diagrama y las coordenadas de cada nodo
database: []
api:
  - POST /api/parser/doc
  - POST /api/parser/code
depends-on: []
folders:
  - id: core
    path: src/modules/parser/core
  - id: sources
    path: src/modules/parser/sources
files:
  - id: parser-routes
    path: parser.routes.js
    type: router
  - id: parser-controller
    path: parser.controller.js
    type: controller
  - id: parser-service
    path: parser.service.js
    type: service
  - id: parser-repository
    path: parser.repository.js
    type: repository
  - id: markdown-source
    folder: sources
    path: markdown-source.js
    type: source
  - id: yaml-parser
    folder: core
    path: yaml-parser.js
    type: helper
  - id: validator
    folder: core
    path: validator.js
    type: helper
  - id: model-builder
    folder: core
    path: model-builder.js
    type: helper
  - id: resolver
    folder: core
    path: resolver.js
    type: helper
  - id: layout-calculator
    folder: core
    path: layout-calculator.js
    type: helper
  - id: frontmatter-config
    folder: core
    path: frontmatter.config.js
    type: config
  - id: sections-config
    folder: core
    path: sections.config.js
    type: config
---

## Purpose

Módulo principal del backend. Orquesta la transformación de archivos de documentación Markdown en un modelo JSON que describe la arquitectura de una aplicación.

El endpoint `POST /api/parser/doc` recibe N archivos `.md` vía multipart (multer en memoria), los procesa a través de un pipeline de 7 pasos y devuelve `{ model, layout }`. El endpoint `POST /api/parser/code` está reservado para una iteración futura y responde 501.

Pipeline completo:
1. **sortFiles** — reordena los archivos para que las dependencias se procesen primero (01-modules antes que módulos, módulos antes que pantallas, etc.)
2. **extractFromMarkdown** — extrae el YAML del frontmatter y las secciones `## Nombre` de cada archivo
3. **validateAndParse** — parsea el YAML con js-yaml y valida el frontmatter contra el schema; lanza error 400 en el primer fallo
4. **buildModel** — ensambla el modelo JSON unificado con shape `{ modules, screens, flows, database, systemRules }`
5. **resolveReferences** — comprueba que todas las referencias cruzadas de IDs apuntan a elementos que existen; emite advertencias sin lanzar
6. **calculateLayout** — calcula las coordenadas `{ x, y }` por defecto de cada nodo
7. **saveModel** — persiste `{ model, layout }` en memoria

## Functions

### parser-controller
- parseDoc(req, res)
- parseCode(req, res)

### parser-service
- parseDocumentation(files)
- sortFiles(files)
- validateAndParse(extracted, sortedFiles)

### parser-repository
- saveModel(diagram)
- getModel()

### markdown-source
- extractFromMarkdown(files)

### yaml-parser
- parseYaml(yamlString)

### validator
- validateFrontmatter(yaml, rawYaml, filename)

### model-builder
- buildModel(parsedItems)

### resolver
- resolveReferences(model)

### layout-calculator
- calculateLayout(model)

## Notes

`parser.repository.js` persiste en una variable de módulo. Cuando se conecte la base de datos solo cambia este archivo; el service no necesita tocarse.

`layout-calculator.js` asigna coordenadas por columnas: database | backend | frontend | screens (izquierda a derecha), flows debajo de la columna más larga, y system-rules en la esquina superior izquierda a y=60.

Los errores de validación siempre empiezan por `[nombre-archivo]`; el controller los mapea a HTTP 400. Cualquier otro error se mapea a HTTP 500.

`POST /api/parser/code` está registrado en las rutas pero devuelve 501. Cuando se implemente, añadirá un `code-source.js` en `sources/` sin cambiar el pipeline.
