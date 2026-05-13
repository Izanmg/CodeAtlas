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
    role: Declara los endpoints standalone del parser (uso interno). Configura multer en memoria para recibir los .md sin escribir a disco.
  - id: parser-controller
    folder: parser-root
    path: parser.controller.js
    type: controller
    imports: [parser-service]
    role: Capa HTTP del parser. Recibe los archivos en multipart y delega en parseDocumentation. Mapea errores con prefijo [archivo] a 400.
  - id: parser-service
    folder: parser-root
    path: parser.service.js
    type: service
    imports: [markdown-source, yaml-parser, validator, model-builder, resolver, layout-calculator, parser-repository]
    role: Orquesta el pipeline secuencial de parseo. Pasa la salida de cada paso al siguiente y devuelve { model, layout } al cliente.
  - id: parser-repository
    folder: parser-root
    path: parser.repository.js
    type: repository
    role: Persistencia en memoria del último modelo parseado. Solo se usa para depuración del endpoint standalone; el cliente real (diagrams-backend) guarda en su propia tabla.
  - id: markdown-source
    folder: parser-sources
    path: markdown-source.js
    type: source
    role: Extrae el frontmatter YAML y las secciones `## Nombre` de cada archivo. Es la única pieza que toca markdown crudo.
  - id: yaml-parser
    folder: parser-core
    path: yaml-parser.js
    type: core
    role: Wrapper fino sobre js-yaml. Centraliza la dependencia para que sea sustituible y normaliza los errores de parseo.
  - id: validator
    folder: parser-core
    path: validator.js
    type: core
    imports: [frontmatter-config]
    role: Valida el frontmatter de cada archivo contra FRONTMATTER_SCHEMA. Lanza errores con prefijo `[nombre-archivo]` para que el controller los traduzca a 400.
  - id: frontmatter-config
    folder: parser-core
    path: frontmatter.config.js
    type: core
    role: Schema declarativo del frontmatter por tipo (qué campos son obligatorios, opcionales y de qué tipo). Lo consume validator.
  - id: sections-config
    folder: parser-core
    path: sections.config.js
    type: core
    role: Declara qué nombres de sección `## X` son "conocidos" por tipo. Las secciones no listadas pasan al campo `extensions` del modelo.
  - id: model-builder
    folder: parser-core
    path: model-builder.js
    type: core
    imports: [sections-config]
    role: Ensambla el modelo unificado a partir de los archivos parseados. Convierte secciones en arrays, parsea DBML para FKs y pasos de flujo con sus prefijos `[capa:ref]`.
  - id: resolver
    folder: parser-core
    path: resolver.js
    type: core
    role: Valida que las referencias cruzadas (IDs entre archivos) apunten a elementos existentes. No falla, solo emite warnings.
  - id: layout-calculator
    folder: parser-core
    path: layout-calculator.js
    type: core
    role: Calcula coordenadas { x, y } iniciales para cada nodo del modelo. Organiza por columnas (database | backend/flow | frontend | screens) con system-rules arriba a la izquierda.
---

## Purpose
Recibe un conjunto de archivos `.md` en multipart y los transforma en el modelo unificado JSON que consume el frontend para renderizar el diagrama. El pipeline es lineal y cada paso se aísla en su propio archivo: extracción del frontmatter, parseo YAML, validación contra el esquema, construcción del modelo, resolución de referencias cruzadas, cálculo del layout inicial. Es el único módulo del backend que no toca la base de datos directamente — el cliente final del modelo es `diagrams-backend`.

## Functions

### parser-routes
- monta POST /doc con multer (multipart, campo files)
- monta POST /code (501 Not Implemented por ahora)

### parser-controller
- parseDoc(req, res)
  doc: Recibe los archivos .md vía multer y llama a parseDocumentation. Devuelve { model, layout } o 400 con el primer error del validador.
- parseCode(req, res)
  doc: Endpoint reservado para una futura iteración (parsear archivos de código fuente). Hoy responde 501 Not Implemented.

### parser-service
- parseDocumentation(files)
  doc: Pipeline completo. Ordena los archivos por dependencia, extrae frontmatter+secciones, valida, ensambla el modelo, resuelve referencias, calcula el layout y persiste. Devuelve { model, layout }.

### parser-repository
- saveModel(diagram)
  doc: Guarda el último diagrama parseado en una variable de módulo. Útil para depurar el endpoint standalone.
- getModel()
  doc: Devuelve el diagrama almacenado en memoria. Devuelve null si no se ha parseado nada todavía.

### markdown-source
- extractFromMarkdown(files)
  doc: Para cada archivo separa el bloque YAML delimitado por `---` del resto del markdown, y trocea el cuerpo en secciones `## Nombre`.

### yaml-parser
- parseYaml(text)
  doc: Parsea con js-yaml y devuelve el objeto JS. Propaga el error sin transformar.

### validator
- validateAndParse(extracted, sortedFiles)
  doc: Para cada archivo parsea su YAML, comprueba campos obligatorios y tipos, y devuelve la lista de archivos válidos lista para buildModel.

### model-builder
- buildModel(parsedFiles)
  doc: Función principal. Encamina cada archivo a su builder según `type` y agrupa el resultado en `{ modules, screens, flows, database, systemRules, overview, fileTypes }`.
- parseFlowSteps(text)
  doc: Convierte la sección `## Steps` en un array de objetos `{ index, label, layer, moduleId, file, fn, nodeId }` extrayendo los prefijos `[capa:moduleId/archivo/función]`.
- computeNodeId(layer, moduleId)
  doc: Construye el ID que Vue Flow usa según la capa (`scr-X`, `mod-X`, `db-X`). Mantiene la convención del frontend.

### resolver
- resolveReferences(model)
  doc: Recorre todas las referencias entre elementos (modules.database, screens.module, flows.modules, file.imports, etc.) y emite un console.warn por cada ID inexistente. Nunca lanza.

### layout-calculator
- calculateLayout(model)
  doc: Asigna coordenadas { x, y } a cada nodo en columnas verticales. Las FKs entre tablas no afectan el cálculo (las edges se enrutan después con FloatingEdge).

## Notes
El orden de procesamiento es importante: módulos primero (definen file-types), después database, después screens (referencian módulos), después flows (referencian todo), por último system-rules. Esto lo aplica `sortFiles` en el service.
Los pasos de flujo soportan el prefijo opcional `[capa:moduleId/archivo/función]`. El parser extrae este prefijo y calcula el `nodeId` correspondiente (`scr-X`, `mod-X`, `db-X`) directamente en el modelo, así el frontend no necesita resolver las convenciones de Vue Flow.
La persistencia del parser (`parser.repository`) es solo en memoria; el cliente real (`diagrams-backend`) no la usa — recoge el resultado directamente del service y lo guarda en su propia tabla.
Las rutas del parser no requieren autenticación porque están pensadas para uso interno (las llamadas vienen del módulo `diagrams-backend` cuando un usuario autenticado genera un diagrama).
