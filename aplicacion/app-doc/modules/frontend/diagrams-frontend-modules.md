---
type: module
layer: frontend
id: diagrams-frontend
name: Diagramas
description: Generación de diagramas, canvas Vue Flow, modos Relaciones/Flujos
screens: [diagram-new, diagram-view]
consumes-api: [diagrams-backend]
depends-on: [projects-frontend]
folders:
  - id: views
    path: src/modules/diagrams/views
  - id: components
    path: src/modules/diagrams/components
  - id: nodes
    path: src/modules/diagrams/components/nodes
  - id: panel
    path: src/modules/diagrams/components/panel
  - id: stores
    path: src/modules/diagrams/stores
  - id: services
    path: src/modules/diagrams/services
  - id: core
    path: src/modules/diagrams/core
files:
  - id: diagram-new-view
    folder: views
    path: DiagramNewView.vue
    type: view
  - id: diagram-view
    folder: views
    path: DiagramView.vue
    type: view
  - id: canvas-toolbar
    folder: components
    path: CanvasToolbar.vue
    type: component
  - id: canvas-legend
    folder: components
    path: CanvasLegend.vue
    type: component
  - id: canvas-rules
    folder: components
    path: CanvasRules.vue
    type: component
  - id: canvas-flow-selector
    folder: components
    path: CanvasFlowSelector.vue
    type: component
  - id: canvas-flow-panel
    folder: components
    path: CanvasFlowPanel.vue
    type: component
  - id: side-panel
    folder: components
    path: SidePanel.vue
    type: component
  - id: backend-node
    folder: nodes
    path: BackendNode.vue
    type: component
  - id: frontend-node
    folder: nodes
    path: FrontendNode.vue
    type: component
  - id: screen-node
    folder: nodes
    path: ScreenNode.vue
    type: component
  - id: database-node
    folder: nodes
    path: DatabaseNode.vue
    type: component
  - id: rules-node
    folder: nodes
    path: RulesNode.vue
    type: component
  - id: node-shell
    folder: nodes
    path: NodeShell.vue
    type: component
  - id: node-handles
    folder: nodes
    path: NodeHandles.vue
    type: component
  - id: node-flow-chips
    folder: nodes
    path: NodeFlowChips.vue
    type: component
  - id: details-tab
    folder: panel
    path: DetailsTab.vue
    type: component
  - id: connections-tab
    folder: panel
    path: ConnectionsTab.vue
    type: component
  - id: overview-tab
    folder: panel
    path: OverviewTab.vue
    type: component
  - id: diagrams-store
    folder: stores
    path: diagrams.store.js
    type: store
  - id: diagrams-frontend-service
    folder: services
    path: diagrams.service.js
    type: service
  - id: auto-layout
    folder: core
    path: auto-layout.js
    type: helper
  - id: compute-connections
    folder: core
    path: compute-connections.js
    type: helper
  - id: node-meta
    folder: core
    path: node-meta.js
    type: helper
---

## Purpose
Es el módulo más grande del frontend. Cubre dos vistas distintas: la de generación (`DiagramNewView`, donde el usuario sube los `.md` y arranca el parseo) y la del canvas interactivo (`DiagramView`, donde se renderiza el diagrama con Vue Flow). Incluye los nodos personalizados de cada tipo (backend, frontend, screen, database, rules), el SidePanel con sus tres tabs, y los dos paneles flotantes del modo flujos (`CanvasFlowSelector` a la derecha, `CanvasFlowPanel` a la izquierda).

## State
- all
- loaded
- current

## Functions

### diagram-new-view
- handleFilesSelected(files)
- handleGenerate()
- onProgress({ progress, label })

### diagram-view
- onMounted: carga el diagrama, construye nodes/edges con autoLayout, pinta el canvas
- handleNodesChange(changes)
- saveLayout()
- undo() / redo()
- setMode(next) / handlePickFlow({ flowId })
- onNodeClick / onPaneClick / clearFocus

### canvas-toolbar
- emite 'mode' al cambiar entre Relaciones y Flujos
- emite 'toggle' al activar/desactivar un filtro de tipo

### canvas-flow-selector
- emite 'select' con el flowId al elegir un flujo

### canvas-flow-panel
- agrupa pasos consecutivos del mismo nodeId
- resalta los pasos del nodo actualmente seleccionado

### node-flow-chips
- emite 'pick-flow' al hacer click en un chip de flujo

### diagrams-store
- fetchAll(force)
- fetchByProject(projectId)
- fetchById(id)
- generate(payload, onProgress)
- saveLayout(id, layout)
- remove(id)

### diagrams-frontend-service
- fetchAll()
- fetchByProject(projectId)
- fetchById(id)
- generate({ projectId, name, files }, onProgress)
- saveLayout(id, layout)
- remove(id)

### auto-layout
- autoLayout({ model, layout })

### compute-connections
- computeConnections(node, model)

### node-meta
- NODE_META por tipo (label, icon, color, bg)
- KIND_KEYS para los filtros del toolbar

## Notes
Vue Flow se usa en modo controlado: el componente `DiagramView` mantiene `nodes` y `edges` como `ref()` y aplica los cambios manualmente desde `@nodes-change` (el helper estándar `applyNodeChanges` no funciona porque solo muta GraphNode internos).
Los flujos no se renderizan como nodos del canvas. El parser deja `model.flows` con los pasos enriquecidos (cada step lleva `nodeId`); el canvas inyecta en cada nodo un campo `flowChips` con los flujos que lo tocan, que se renderiza vía `NodeFlowChips`.
Hay dos modos: `relations` (edges coloreados por tipo, filtros de tipo activos, `CanvasRules` a la izquierda) y `flows` (edges amarillos del flujo activo, `CanvasFlowSelector` a la derecha, `CanvasFlowPanel` a la izquierda con los pasos secuenciales).
El historial de undo/redo guarda snapshots de posiciones de nodos. Hay un modal de "salir sin guardar" que intercepta la navegación cuando hay cambios sin persistir.
