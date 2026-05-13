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
    imports: [diagrams-store]
    role: Pantalla de subida de archivos .md y generación del diagrama. Muestra progreso en tres fases y redirige al canvas tras éxito.
  - id: diagram-view
    folder: views
    path: DiagramView.vue
    type: view
    imports: [diagrams-store, auto-layout, node-meta, backend-node, frontend-node, screen-node, database-node, rules-node, floating-edge, canvas-toolbar, canvas-legend, canvas-rules, canvas-flow-selector, canvas-flow-panel, side-panel]
    role: Canvas principal del diagrama. Orquesta modos (Relaciones / Flujos), filtros, búsqueda con autocompletado, undo/redo, persistencia del layout y doble-click para entrar al deep-dive.
  - id: module-deep-dive-view
    folder: views
    path: ModuleDeepDiveView.vue
    type: view
    imports: [diagrams-store, auto-layout-deep, file-node, folder-node, frontier-node, floating-edge, canvas-flow-selector, canvas-flow-panel]
    role: Vista interna de un módulo. Renderiza carpetas como columnas, archivos como nodos UML y frontiers de pantallas y módulos relacionados. Soporta modo Flujos con secuencia numerada entre funciones.
  - id: canvas-toolbar
    folder: components
    path: CanvasToolbar.vue
    type: component
    imports: [node-meta]
    role: Panel desplegable de la esquina superior derecha. Contiene buscador con autocompletado, toggle Relaciones/Flujos, filtros por tipo, toggle de indirectas y botón ajustar vista.
  - id: canvas-legend
    folder: components
    path: CanvasLegend.vue
    type: component
    imports: [node-meta]
    role: Pastilla flotante en la esquina inferior izquierda. Al expandir muestra los tipos de bloque y los estilos de conexión.
  - id: canvas-rules
    folder: components
    path: CanvasRules.vue
    type: component
    role: Panel flotante en la esquina superior izquierda en modo Relaciones. Muestra las reglas del sistema agrupadas por categoría y el Overview del proyecto.
  - id: canvas-flow-selector
    folder: components
    path: CanvasFlowSelector.vue
    type: component
    role: Panel flotante de la esquina superior derecha en modo Flujos. Permite seleccionar el flujo activo o ver "Todos los flujos".
  - id: canvas-flow-panel
    folder: components
    path: CanvasFlowPanel.vue
    type: component
    role: Panel flotante en la esquina superior izquierda en modo Flujos. Muestra pasos secuenciales del flujo activo agrupados por nodo, error cases y notas.
  - id: side-panel
    folder: components
    path: SidePanel.vue
    type: component
    imports: [node-meta, compute-connections, overview-tab, connections-tab, details-tab]
    role: Panel lateral derecho que aparece al seleccionar un nodo. Tiene tres pestañas (Resumen / Conexiones / Detalle) y permite saltar a nodos relacionados.
  - id: floating-edge
    folder: components
    path: FloatingEdge.vue
    type: component
    role: Edge personalizado que calcula sus extremos como intersecciones entre la línea centro-a-centro y los rectángulos de los nodos. Reactivo al drag.
  - id: backend-node
    folder: nodes
    path: BackendNode.vue
    type: component
    imports: [node-shell, node-handles, node-flow-chips]
    role: Nodo del canvas conceptual para módulos backend. Muestra nombre + endpoints como lista interna.
  - id: frontend-node
    folder: nodes
    path: FrontendNode.vue
    type: component
    imports: [node-shell, node-handles, node-flow-chips]
    role: Nodo del canvas conceptual para módulos frontend. Muestra nombre + pantallas vinculadas.
  - id: screen-node
    folder: nodes
    path: ScreenNode.vue
    type: component
    imports: [node-shell, node-handles, node-flow-chips]
    role: Nodo del canvas conceptual para pantallas. Muestra ruta + badge de auth (lock o external).
  - id: database-node
    folder: nodes
    path: DatabaseNode.vue
    type: component
    imports: [node-shell, node-handles, node-flow-chips]
    role: Nodo del canvas conceptual para entidades de BD. Muestra los campos con su tipo y marca PK/FK/UQ.
  - id: rules-node
    folder: nodes
    path: RulesNode.vue
    type: component
    imports: [node-shell, node-handles]
    role: Nodo de reglas del sistema. Solo se usa para el side panel (en el canvas se filtra y se sustituye por CanvasRules).
  - id: node-shell
    folder: nodes
    path: NodeShell.vue
    type: component
    imports: [node-meta]
    role: 'Marco común de todos los nodos del canvas: header con icono+label+contador, gestión del estado seleccionado, slot para el cuerpo.'
  - id: node-handles
    folder: nodes
    path: NodeHandles.vue
    type: component
    role: Ocho handles invisibles (source + target en cada lado del nodo). Permite que FloatingEdge conecte por cualquier lado dinámicamente.
  - id: node-flow-chips
    folder: nodes
    path: NodeFlowChips.vue
    type: component
    role: Chips amarillos al pie de cada nodo que indican qué flujos lo recorren. Click en un chip activa el modo Flujos con ese flujo.
  - id: file-node
    folder: nodes
    path: FileNode.vue
    type: component
    imports: [node-handles]
    role: Nodo UML del deep-dive (estilo clase). Header con path + tipo + botón Info de la nota del archivo; cuerpo con funciones desplegables que abren su doc.
  - id: folder-node
    folder: nodes
    path: FolderNode.vue
    type: component
    role: Etiqueta de carpeta sobre cada columna de archivos en el deep-dive. No es un container real de Vue Flow, solo agrupación visual.
  - id: frontier-node
    folder: nodes
    path: FrontierNode.vue
    type: component
    imports: [node-handles]
    role: Nodo pequeño dashed en el borde del deep-dive. Representa pantallas (izquierda) o módulos dependidos (derecha) que conectan con archivos del módulo.
  - id: details-tab
    folder: panel
    path: DetailsTab.vue
    type: component
    imports: [panel-section-header]
    role: Pestaña "Detalle" del side panel. Renderiza secciones específicas según el tipo de nodo (endpoints, pantallas, ruta, esquema DBML, pasos del flujo, archivos del módulo, etc.).
  - id: connections-tab
    folder: panel
    path: ConnectionsTab.vue
    type: component
    imports: [panel-section-header, connection-row]
    role: Pestaña "Conexiones" del side panel. Lista incoming/outgoing del nodo seleccionado con su tipo de relación.
  - id: overview-tab
    folder: panel
    path: OverviewTab.vue
    type: component
    imports: [stat-tile, panel-section-header, connection-row]
    role: Pestaña "Resumen" del side panel. Muestra dos stats principales del nodo y un preview de sus 3 conexiones más relevantes.
  - id: panel-section-header
    folder: panel
    path: PanelSectionHeader.vue
    type: component
    role: Cabecera tipográfica reutilizable de sección dentro del side panel (texto uppercase + contador opcional).
  - id: stat-tile
    folder: panel
    path: StatTile.vue
    type: component
    role: Tarjeta pequeña con label uppercase y valor grande. Usada en el OverviewTab.
  - id: connection-row
    folder: panel
    path: ConnectionRow.vue
    type: component
    imports: [node-meta]
    role: Fila de conexión clickable con icono, nombre del nodo destino y etiqueta del tipo de relación.
  - id: diagrams-store
    folder: stores
    path: diagrams.store.js
    type: store
    imports: [diagrams-frontend-service]
    role: Estado global de diagramas. Mantiene listas (all, recent) y el diagrama actual. Expone operaciones CRUD + saveLayout.
  - id: diagrams-frontend-service
    folder: services
    path: diagrams.service.js
    type: service
    role: Cliente HTTP del módulo. Implementa el progreso por fases en generate/update (preparando → analizando → regenerando) y normaliza model_json/layout_json al deserializar.
  - id: auto-layout
    folder: core
    path: auto-layout.js
    type: helper
    role: Transforma { model, layout } del backend en nodos y edges de Vue Flow. Genera nodos por capa (database/backend/frontend/screen/rules) y edges tipados (consumes, uses-db, db-rel, etc.).
  - id: auto-layout-deep
    folder: core
    path: auto-layout-deep.js
    type: helper
    role: Equivalente al auto-layout pero para la vista interna de un módulo. Genera columnas-carpeta + nodos UML + frontiers y, en modo Flujos, secuencias numeradas entre funciones.
  - id: compute-connections
    folder: core
    path: compute-connections.js
    type: helper
    role: Para cada nodo del canvas calcula sus conexiones entrantes y salientes a partir del modelo. Lo consumen OverviewTab y ConnectionsTab.
  - id: node-meta
    folder: core
    path: node-meta.js
    type: helper
    role: Fuente única de la apariencia de cada tipo de nodo (label, icono lucide, color, fondo). Lo usan toolbar, leyenda, NodeShell y ConnectionRow.
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
  doc: Recibe los archivos del input/drop, filtra los .md y los muestra en la lista local antes de enviarlos.
- handleGenerate()
  doc: Llama a diagramsStore.generate con el callback de progreso y, tras éxito, navega a /diagrams/:id.
- onProgress({ progress, label })
  doc: Actualiza la barra de progreso y la etiqueta de fase actual ("preparando archivos", "analizando documentación", etc.).

### diagram-view
- onMounted: carga el diagrama, construye nodes/edges con autoLayout, pinta el canvas
  doc: Hace fetchById, construye nodes/edges con autoLayout, inyecta los flowChips por nodo y guarda el snapshot inicial del historial.
- handleNodesChange(changes)
  doc: Recibe los position changes de Vue Flow. Acumula posiciones durante el drag y, al recibir dragging:false, commitea a nodes.value y empuja un snapshot al historial.
- saveLayout()
  doc: Construye el mapa { [nodeId]: { x, y } } y llama a diagramsStore.saveLayout. Resetea el historial dejando el snapshot actual como base limpia.
- undo() / redo()
  doc: Navega por la pila de snapshots aplicando las posiciones guardadas. Bloquea la emisión de change events durante la aplicación.
- setMode(next) / handlePickFlow({ flowId })
  doc: setMode cambia entre 'relations' y 'flows'. handlePickFlow se dispara desde los chips de flujo en los nodos.
- onNodeClick / onPaneClick / clearFocus
  doc: Click en nodo abre el side panel y activa modo foco; click en lienzo o Esc cierran. clearFocus también limpia la búsqueda activa.
- onNodeDoubleClick({ node }) — navega al deep-dive del módulo
  doc: Solo dispara para nodos backend/frontend. Construye la ruta /diagrams/:id/modules/:moduleId y navega.
- onSearchChange(value) / onNodeSelected(id)
  doc: onSearchChange actualiza el query; si rompe la coincidencia con el nodo bloqueado, lo desbloquea. onNodeSelected fija un nodo concreto y oculta todo lo no relacionado.
- toggleFilter(k) / toggleIndirect()
  doc: toggleFilter oculta nodos de un tipo (backend/frontend/screen/database). toggleIndirect oculta las aristas discontinuas (uses-db, navigates, dependsOn).

### module-deep-dive-view
- onMounted: carga diagrama, busca el módulo, construye nodos/edges del deep-dive
  doc: Reutiliza diagramsStore.fetchById (cacheado). Si el módulo no existe, redirige al diagrama principal.
- setMode(next)
  doc: Cambia entre 'relations' (imports + screen.file) y 'flows' (secuencia numerada del flujo activo).
- goBack()
  doc: Navega a /diagrams/:id (canvas conceptual).
- onKeydown(e) — Esc vuelve al diagrama principal
  doc: Listener global registrado en onMounted y limpiado en onUnmounted.

### canvas-toolbar
- emite 'mode' al cambiar entre Relaciones y Flujos
- emite 'toggle' al activar/desactivar un filtro de tipo
- emite 'select-node' al elegir una sugerencia del autocompletado
- emite 'update:search' al teclear, 'toggle-indirect', 'fit' y 'clear-focus'

### canvas-flow-selector
- emite 'select' con el flowId al elegir un flujo (null para "Todos los flujos")

### canvas-flow-panel
- agrupa pasos consecutivos del mismo nodeId
- resalta los pasos del nodo actualmente seleccionado
- muestra también `## Error Cases` y `## Notes` del flujo activo

### node-flow-chips
- emite 'pick-flow' al hacer click en un chip de flujo

### diagrams-store
- fetchAll(force)
  doc: Lista global de diagramas del usuario (todos los proyectos). Cacheado salvo force=true.
- fetchByProject(projectId)
  doc: Listado de diagramas de un proyecto concreto. No cacheado (siempre fresco).
- fetchById(id)
  doc: Carga un diagrama completo (incluye model_json y layout_json). Reusa `current` si ya está cargado y coincide.
- generate(payload, onProgress)
  doc: Crea un diagrama nuevo subiendo archivos .md. onProgress recibe { progress: 0-100, label: string }.
- update(id, payload, onProgress)
  doc: Renombra y opcionalmente regenera el diagrama. Si no hay files, solo PATCH simple sin progreso.
- saveLayout(id, layout)
  doc: Persiste solo las posiciones de los nodos en layout_json. No regenera nada.
- remove(id)
  doc: DELETE + filtra de las listas locales + limpia `current` si era el actual.

### diagrams-frontend-service
- fetchAll()
  doc: GET /api/diagrams/recent (sin filtro de proyecto, listado global).
- fetchByProject(projectId)
  doc: GET /api/projects/:projectId/diagrams.
- fetchById(id)
  doc: GET /api/diagrams/:id. Parsea los JSON columns antes de devolver.
- generate({ projectId, name, files }, onProgress)
  doc: POST multipart. Reporta progreso falso por fases (la generación real ocurre del lado servidor sin streaming).
- update(id, { name, files }, onProgress)
  doc: PATCH multipart. Si `files` está vacío, solo manda { name } y omite multer.
- saveLayout(id, layout)
  doc: PATCH /api/diagrams/:id/layout con el objeto completo de posiciones.
- remove(id)
  doc: DELETE /api/diagrams/:id.

### side-panel
- emite 'close' y 'select(id)' para navegar entre nodos relacionados

### floating-edge
- getNodeIntersection(intersectionNode, otherNode)
  doc: Algoritmo del ejemplo "Floating Edges" de React/Vue Flow. Calcula dónde cruza la línea centro-a-centro el rectángulo del primer nodo.
- getEdgePosition(node, point)
  doc: Determina qué cara del nodo (Top/Right/Bottom/Left) corresponde al punto de intersección, para que smoothstep pueda enrutar correctamente los segmentos.

### auto-layout
- autoLayout({ model, layout })
  doc: Devuelve { nodes, edges } listos para Vue Flow. Si `layout` tiene coords usa esas, si no aplica el fallback por columnas (database | backend | frontend | screen).

### auto-layout-deep
- buildDeepDive(module, model)
  doc: Calcula nodos (carpetas, archivos, frontiers) y edges (imports + screen.file binding) para un módulo. El layout se computa fresh cada vez (no se persiste).
- buildFlowEdgesForModule(flow, module)
  doc: Para cada par consecutivo de pasos del flujo cuyos archivos caen dentro del módulo, genera una arista numerada (1, 2, 3...) animada.

### compute-connections
- computeConnections(node, model)
  doc: Devuelve { incoming: [], outgoing: [], total: number } para el nodo dado. La lógica difiere por kind (backend, frontend, screen, database).

### node-meta
- NODE_META por tipo (label, icon, color, bg)
- KIND_KEYS para los filtros del toolbar

## Notes
Vue Flow se usa en modo controlado: el componente `DiagramView` mantiene `nodes` y `edges` como `ref()` y aplica los cambios manualmente desde `@nodes-change` (el helper estándar `applyNodeChanges` no funciona porque solo muta GraphNode internos).
Los flujos no se renderizan como nodos del canvas. El parser deja `model.flows` con los pasos enriquecidos (cada step lleva `nodeId`); el canvas inyecta en cada nodo un campo `flowChips` con los flujos que lo tocan, que se renderiza vía `NodeFlowChips`.
Hay dos modos: `relations` (edges coloreados por tipo, filtros de tipo activos, `CanvasRules` a la izquierda) y `flows` (edges amarillos del flujo activo, `CanvasFlowSelector` a la derecha, `CanvasFlowPanel` a la izquierda con los pasos secuenciales).
El historial de undo/redo guarda snapshots de posiciones de nodos. Hay un modal de "salir sin guardar" que intercepta la navegación cuando hay cambios sin persistir.
