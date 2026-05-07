---
type: flow
id: generate-diagram
name: Generar diagrama
description: Proceso completo desde que el usuario sube los archivos .md hasta que el canvas interactivo queda visible con el diagrama renderizado
trigger: el usuario sube archivos .md y pulsa Generar diagrama
screens: [diagram-new, diagram-view]
modules: [diagrams-frontend, parser-backend]
database: []
---

## Steps

1. El usuario navega a `/projects/:id/diagrams/new` y selecciona uno o varios archivos `.md`
2. Al pulsar Generar, el frontend llama a `diagramsStore.generate(payload, onProgress)`
3. El store delega a `diagrams-mock.js`, que llama a `POST /api/parser/doc` con los archivos en multipart
4. El backend ejecuta el pipeline: sortFiles → extractFromMarkdown → validateAndParse → buildModel → resolveReferences → calculateLayout → saveModel
5. El backend responde con `{ model, layout }`
6. `diagrams-mock.js` construye un objeto diagrama con ID, nombre, fecha, projectId y el payload `{ model, layout }`
7. El store añade el diagrama a `all` y lo guarda como `current`
8. El frontend redirige al canvas: `/diagrams/:id`
9. `DiagramView` monta y llama a `diagramsStore.fetchById(id)`, que devuelve el diagrama de `current`
10. `autoLayout(diagram.data)` transforma el modelo en nodos y edges de Vue Flow
11. Vue Flow renderiza el canvas con `fitView` inicial

## Error Cases

- Archivos sin frontmatter o con frontmatter inválido: el parser devuelve 400 con mensaje `[nombre-archivo] campo requerido "X" no está presente`; el frontend muestra el error en pantalla y permanece en la vista de creación
- Sin archivos seleccionados: el parser devuelve 400 con `No se han subido archivos`; el frontend bloquea el botón de envío
- Error interno del parser (500): el frontend muestra un mensaje genérico de error
