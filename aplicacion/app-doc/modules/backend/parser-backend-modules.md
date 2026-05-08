---
type: module
layer: backend
id: parser-backend
name: Parser de documentación
description: Pipeline que convierte archivos .md en el modelo JSON unificado del diagrama
database: []
api:
  - POST /api/parser/doc
  - POST /api/parser/code
depends-on: []
folders:
  - id: parser-root
    path: src/modules/parser
  - id: parser-sources
    path: src/modules/parser/sources
  - id: parser-core
    path: src/modules/parser/core
files:
  - id: parser-routes
    folder: parser-root
    path: parser.routes.js
    type: router
    imports: [parser-controller]
  - id: parser-controller
    folder: parser-root
    path: parser.controller.js
    type: controller
    imports: [parser-service]
  - id: parser-service
    folder: parser-root
    path: parser.service.js
    type: service
    imports: [markdown-source, yaml-parser, validator, model-builder, resolver, layout-calculator, parser-repository]
  - id: parser-repository
    folder: parser-root
    path: parser.repository.js
    type: repository
  - id: markdown-source
    folder: parser-sources
    path: markdown-source.js
    type: source
  - id: yaml-parser
    folder: parser-core
    path: yaml-parser.js
    type: core
  - id: validator
    folder: parser-core
    path: validator.js
    type: core
    imports: [frontmatter-config]
  - id: frontmatter-config
    folder: parser-core
    path: frontmatter.config.js
    type: core
  - id: sections-config
    folder: parser-core
    path: sections.config.js
    type: core
  - id: model-builder
    folder: parser-core
    path: model-builder.js
    type: core
    imports: [sections-config]
  - id: resolver
    folder: parser-core
    path: resolver.js
    type: core
  - id: layout-calculator
    folder: parser-core
    path: layout-calculator.js
    type: core
---

## Purpose
Recibe un conjunto de archivos `.md` en multipart y los transforma en el modelo unificado JSON que consume el frontend para renderizar el diagrama. El pipeline es lineal y cada paso se aísla en su propio archivo: extracción del frontmatter, parseo YAML, validación contra el esquema, construcción del modelo, resolución de referencias cruzadas, cálculo del layout inicial. Es el único módulo del backend que no toca la base de datos directamente — el cliente final del modelo es `diagrams-backend`.

## Functions

### parser-routes
- monta POST /doc con multer (multipart, campo files)
- monta POST /code (501 Not Implemented por ahora)

### parser-controller
- parseDoc(req, res)
- parseCode(req, res)

### parser-service
- parseDocumentation(files)

### parser-repository
- saveModel(diagram)
- getModel()

### markdown-source
- extractFromMarkdown(files)

### yaml-parser
- parseYaml(text)

### validator
- validateAndParse(extracted, sortedFiles)

### model-builder
- buildModel(parsedFiles)
- parseFlowSteps(text)
- computeNodeId(layer, moduleId)

### resolver
- resolveReferences(model)

### layout-calculator
- calculateLayout(model)

## Notes
El orden de procesamiento es importante: módulos primero (definen file-types), después database, después screens (referencian módulos), después flows (referencian todo), por último system-rules. Esto lo aplica `sortFiles` en el service.
Los pasos de flujo soportan el prefijo opcional `[capa:moduleId/archivo/función]`. El parser extrae este prefijo y calcula el `nodeId` correspondiente (`scr-X`, `mod-X`, `db-X`) directamente en el modelo, así el frontend no necesita resolver las convenciones de Vue Flow.
La persistencia del parser (`parser.repository`) es solo en memoria; el cliente real (`diagrams-backend`) no la usa — recoge el resultado directamente del service y lo guarda en su propia tabla.
Las rutas del parser no requieren autenticación porque están pensadas para uso interno (las llamadas vienen del módulo `diagrams-backend` cuando un usuario autenticado genera un diagrama).
