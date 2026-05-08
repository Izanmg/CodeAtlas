---
type: flow
id: generate-diagram
name: Generación de diagrama
description: Proceso completo desde la subida de archivos .md hasta el canvas renderizado
trigger: el usuario sube archivos .md y pulsa Generar diagrama
screens: [diagram-new, diagram-view]
modules: [diagrams-frontend, diagrams-backend, parser-backend]
database: [diagrams, projects]
---

## Steps
- [screen:diagram-new] El usuario navega a /projects/:id/diagrams/new y selecciona uno o varios archivos .md
- [frontend:diagrams-frontend/DiagramNewView.vue/handleGenerate] Al pulsar Generar, se llama a diagramsStore.generate(payload, onProgress)
- [frontend:diagrams-frontend/diagrams.store.js/generate] El store delega en diagramsService.generate y muestra el progreso
- [frontend:diagrams-frontend/diagrams.service.js/generate] Se construye un FormData con name + files[] y se hace POST /api/projects/:projectId/diagrams
- [backend:diagrams-backend/diagrams.controller.js/generate] El controller recibe los archivos vía multer (memoryStorage)
- [backend:diagrams-backend/diagrams.service.js/generate] Se verifica que el proyecto pertenece al usuario y se llama al parser
- [backend:parser-backend/parser.service.js/parseDocumentation] Se ejecuta el pipeline: sortFiles → extractFromMarkdown → validateAndParse → buildModel → resolveReferences → calculateLayout
- [backend:parser-backend/model-builder.js/parseFlowSteps] Se procesan los pasos de cada flujo, extrayendo prefijos [capa:ref] y calculando nodeIds
- [backend:diagrams-backend/diagrams.repository.js/create] Se inserta el diagrama con model_json y layout_json calculados
- [database:diagrams] INSERT con id, user_id, project_id, name, model_json, layout_json y los contadores
- [database:projects] UPDATE last_update vía touchProject
- [frontend:diagrams-frontend/diagrams.store.js/generate] El store guarda el diagrama en current y lo añade a all
- [screen:diagram-view] El router navega a /diagrams/:id y se renderiza el canvas con autoLayout

## Error Cases
- Archivos sin frontmatter o con frontmatter inválido: el parser devuelve 400 con mensaje [nombre-archivo] campo requerido "X"; el frontend lo muestra en pantalla
- Sin archivos seleccionados: el frontend bloquea el botón antes de enviar
- Proyecto que no pertenece al usuario: el backend devuelve 403 (defensa en profundidad — el frontend no debería permitir llegar aquí)
- Error interno del parser: el frontend muestra mensaje genérico y permite reintentar

## Notes
La subida usa multer en memoria — los archivos no se persisten en disco antes del parseo, solo viven en el buffer de la petición.
El diagrama se persiste con su layout inicial calculado por `calculateLayout`. El usuario puede luego mover los nodos y guardar el nuevo layout vía PATCH /api/diagrams/:id/layout.
