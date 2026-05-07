---
type: module
layer: backend
id: parser-backend
name: Parser
description: Processes .md documentation files through a pipeline and returns a unified JSON model
database: []
api:
  - POST /api/parser/doc
depends-on: []
folders:
  - id: sources
    path: src/modules/parser/sources
  - id: core
    path: src/modules/parser/core
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
    type: helper
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
Core module of the application. Receives an array of .md files (as in-memory buffers from multer), runs them through a sequential pipeline and returns the unified JSON model that the frontend will use to render the architecture diagram.

The pipeline runs in this fixed order:

1. **sortFiles** — reorders files so that dependencies are processed before dependents (modules index before individual modules, modules before screens, etc.)
2. **extractFromMarkdown** — extracts the YAML frontmatter string and all `## Section` blocks from each file's content
3. **validateAndParse** — parses the YAML with js-yaml and validates the frontmatter against the schema defined in `frontmatter.config.js`; throws a 400-mappable error on the first violation found
4. **buildModel** — assembles the unified JSON model from the validated data; converts kebab-case field names to camelCase and separates known sections from user-defined extensions
5. **resolveReferences** — checks that every cross-file ID reference points to an element that actually exists in the model; emits warnings but does not throw
6. **saveModel** — persists the result in memory (temporary implementation until the database is configured)

The module uses `multer` with `memoryStorage` so files are never written to disk.

## Functions

### parser-routes
- upload.array('files') — multer middleware, stores files in memory as Buffers

### parser-controller
- parseDoc(req, res) — maps multipart files to {filename, content} objects, calls parseDocumentation and returns the model; maps validation errors to 400 and internal errors to 500
- parseCode(req, res) — registered but not implemented; returns 501

### parser-service
- parseDocumentation(files) — orchestrates the full pipeline; only exported function of the service
- sortFiles(files) — distributes files into ordered buckets by filename pattern so the pipeline always processes in dependency order
- validateAndParse(extracted, sortedFiles) — calls parseYaml and validateFrontmatter for each file; discards files without frontmatter; propagates validation errors

### parser-repository
- saveModel(model) — stores the model in a module-level variable
- getModel() — returns the stored model, or null if nothing has been saved yet

### markdown-source
- extractFromMarkdown(files) — maps each file through extractOne and filters out files without frontmatter
- extractFrontmatter(content) — returns the raw YAML string between the two `---` delimiters, or null if absent
- extractSections(content) — returns an object with all `## Section` blocks found in the file, keyed by section name in lowercase

### yaml-parser
- parseYaml(yamlString) — wraps js-yaml.load with structured error handling; returns null on empty input; throws an error with a full code frame (line number + surrounding context with an arrow pointing at the problem) on syntax errors

### validator
- validateFrontmatter(yamlObject, rawYaml, filename) — validates the parsed YAML against FRONTMATTER_SCHEMA; checks type existence, layer validity for modules, presence of all required fields and correct JS types for each field; error messages always include the filename and the exact line number

### model-builder
- buildModel(parsedFiles) — iterates the parsed files, dispatches each to its type-specific builder and assembles the final model object with shape `{ modules: { backend, frontend }, screens, flows, database, systemRules }`
- splitSections(type, sections) — separates sections into knownSections (declared in sections.config.js) and extensions (everything else)
- buildModule / buildScreen / buildFlow / buildEntity / buildSystemRules — type-specific builders that convert field names from kebab-case to camelCase and parse list sections into arrays

### resolver
- resolveReferences(model) — builds a Set index of all declared IDs and checks every cross-reference field in the model; logs a warning for each broken reference but does not throw

## Notes
The repository is a temporary in-memory implementation. When the database is configured, only `parser.repository.js` needs to change — the service does not need to be touched.

The `POST /api/parser/code` endpoint is registered in `parser.routes.js` but returns 501. It is planned for a future iteration and will reuse the same pipeline; the only new piece will be `code-source.js` in the `sources/` folder.
