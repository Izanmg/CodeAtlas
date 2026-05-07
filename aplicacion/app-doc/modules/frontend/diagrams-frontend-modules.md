---
type: module
layer: frontend
id: diagrams-frontend
name: Diagrams
description: Canvas interactivo de visualización de arquitectura con Vue Flow — seis tipos de nodo, filtros, modo foco, side panel de detalle y generación de diagramas por subida de archivos .md
screens: [diagram-view, diagram-new]
consumes-api: [parser-backend]
depends-on: [auth-frontend, projects-frontend]
folders:
  - id: diagrams-views
    path: src/modules/diagrams/views
  - id: diagrams-components
    path: src/modules/diagrams/components
  - id: diagrams-nodes
    path: src/modules/diagrams/components/nodes
  - id: diagrams-panel
    path: src/modules/diagrams/components/panel
  - id: diagrams-stores
    path: src/modules/diagrams/stores
  - id: diagrams-core
    path: src/modules/diagrams/core
  - id: diagrams-mock
    path: src/modules/diagrams/logica-temporal
files:
  - id: diagram-view-file
    folder: diagrams-views
    path: DiagramView.vue
    type: view
  - id: diagram-new-view
    folder: diagrams-views
    path: DiagramNewView.vue
    type: view
  - id: canvas-toolbar
    folder: diagrams-components
    path: CanvasToolbar.vue
    type: component
  - id: canvas-legend
    folder: diagrams-components
    path: CanvasLegend.vue
    type: component
  - id: side-panel
    folder: diagrams-components
    path: SidePanel.vue
    type: component
  - id: backend-node
    folder: diagrams-nodes
    path: BackendNode.vue
    type: component
  - id: frontend-node
    folder: diagrams-nodes
    path: FrontendNode.vue
    type: component
  - id: screen-node
    folder: diagrams-nodes
    path: ScreenNode.vue
    type: component
  - id: database-node
    folder: diagrams-nodes
    path: DatabaseNode.vue
    type: component
  - id: flow-node
    folder: diagrams-nodes
    path: FlowNode.vue
    type: component
  - id: rules-node
    folder: diagrams-nodes
    path: RulesNode.vue
    type: component
  - id: overview-tab
    folder: diagrams-panel
    path: OverviewTab.vue
    type: component
  - id: connections-tab
    folder: diagrams-panel
    path: ConnectionsTab.vue
    type: component
  - id: details-tab
    folder: diagrams-panel
    path: DetailsTab.vue
    type: component
  - id: connection-row
    folder: diagrams-panel
    path: ConnectionRow.vue
    type: component
  - id: diagrams-store
    folder: diagrams-stores
    path: diagrams.store.js
    type: store
  - id: node-meta
    folder: diagrams-core
    path: node-meta.js
    type: helper
  - id: compute-connections
    folder: diagrams-core
    path: compute-connections.js
    type: helper
  - id: auto-layout
    folder: diagrams-core
    path: auto-layout.js
    type: helper
  - id: diagrams-mock-file
    folder: diagrams-mock
    path: diagrams-mock.js
    type: helper
---

## Purpose

Módulo más complejo del frontend. Cubre dos flujos: la **creación** de un nuevo diagrama (subida de archivos `.md` al parser) y la **visualización** interactiva del resultado en un canvas Vue Flow.

El canvas (`DiagramView`) renderiza seis tipos de nodo personalizados (backend, frontend, screen, database, flow, rules), cada uno con su shell visual (`NodeShell`) y contenido específico del modelo. El usuario puede:

- **Modo foco**: clic en un nodo resalta sus vecinos directos y atenúa el resto
- **Filtros**: activar/desactivar tipos de nodo y sus edges asociados
- **Side panel**: tres pestañas (Resumen, Conexiones, Detalle) sobre el nodo seleccionado
- **Minimap**: visión global del canvas, con colores por tipo de nodo
- **Leyenda**: lista de tipos de bloque y estilos de conexión (expandible/colapsable)

La lógica de dominio permanente vive en `core/`:
- `node-meta.js` — icono, color y label de cada tipo de nodo
- `compute-connections.js` — calcula las conexiones entrantes/salientes de un nodo a partir del modelo
- `auto-layout.js` — transforma el modelo JSON en nodos y edges de Vue Flow con posiciones por defecto

La capa `logica-temporal/diagrams-mock.js` simula el backend (CRUD de diagramas y llamada al parser). Cuando se conecte el backend real, solo cambia este archivo.

## State

- all (lista global de diagramas)
- loaded
- current (diagrama actualmente abierto)

## Functions

### diagrams-store
- fetchAll(force)
- fetchByProject(projectId)
- fetchById(id)
- generate(payload, onProgress)

### auto-layout
- autoLayout(modelData)

### compute-connections
- computeConnections(node, model)

### node-meta
- NODE_META (objeto con metadatos por tipo)
- KIND_KEYS (lista de tipos)

### diagram-view-file
- onMounted() — carga diagrama por id de URL, construye nodos y edges
- onNodeClick(event)
- onPaneClick()
- clearFocus()
- toggleFilter(kind)
- goBack()
- colorFor(node)

## Notes

`auto-layout.js` vive en `core/` aunque parte de su lógica (las posiciones de los nodos) será temporal cuando el backend empiece a enviar coordenadas propias. La derivación de edges a partir del modelo es permanente y justifica que el archivo esté en `core/`.

`DiagramView` inyecta `_allScreens` en los nodos de tipo `frontend` para que `FrontendNode` pueda resolver los nombres de las pantallas que contiene, sin que el store o el builder lo necesiten conocer.

El guard de la ruta `requiresAuth: true` redirige al login si no hay sesión antes de cargar el canvas.
