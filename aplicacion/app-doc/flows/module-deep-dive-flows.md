---
type: flow
id: module-deep-dive
name: Entrar al detalle de un módulo
description: Doble-click sobre un módulo del canvas para ver su estructura interna como UML
trigger: el usuario hace doble-click sobre un nodo de tipo backend o frontend
screens: [diagram-view]
modules: [diagrams-frontend]
database: []
---

## Steps
- [screen:diagram-view] El usuario hace doble-click sobre un nodo backend o frontend en el canvas
- [frontend:diagrams-frontend/DiagramView.vue/onNodeDoubleClick] El handler comprueba que el nodo es de tipo backend o frontend, extrae el moduleId del nodeId (sin prefijo `mod-`) y navega
- [frontend:diagrams-frontend/ModuleDeepDiveView.vue] La nueva ruta `/diagrams/:id/modules/:moduleId` monta la vista
- [frontend:diagrams-frontend/diagrams.store.js/fetchById] Se obtiene el diagrama (cacheado en `current` si ya estaba abierto)
- [frontend:diagrams-frontend/ModuleDeepDiveView.vue] Se busca el módulo por id en `model.modules.backend` o `model.modules.frontend`
- [frontend:diagrams-frontend/auto-layout-deep.js/buildDeepDive] Se calculan los nodos (folders como cabeceras, archivos como nodos UML, frontiers de pantallas a la izquierda, frontiers de módulos dependidos a la derecha) y las edges (file.imports + binding screen.file)
- [frontend:diagrams-frontend/ModuleDeepDiveView.vue] VueFlow renderiza el canvas con los nodeTypes file/folder/frontier y FloatingEdge
- El usuario explora la estructura. Si pasa al modo Flujos y selecciona un flujo, se calcula la secuencia numerada de pasos sobre los archivos del módulo:
- [frontend:diagrams-frontend/auto-layout-deep.js/buildFlowEdgesForModule] Recorre `flow.steps`; para cada par consecutivo cuyos `step.file` y `step.fn` caen dentro del módulo, genera una edge animada con número de orden
- [screen:diagram-view] Al pulsar Salir o Esc, el router vuelve a `/diagrams/:id` (canvas conceptual)

## Error Cases
- Módulo no encontrado en el modelo: la vista hace `router.push` de vuelta al diagrama principal
- Diagrama no encontrado: la vista redirige al dashboard `/`
- Módulo sin `files` documentados: el canvas se muestra vacío con un mensaje guía indicando que se debe rellenar `files:` en el frontmatter

## Notes
Es un flujo puramente cliente: no hay llamadas al backend. Toda la información se obtiene del `model_json` ya cargado del diagrama.
El layout interno del módulo se recalcula cada vez que se entra (no se persiste). Si el usuario arrastra los nodos del UML, esas posiciones se pierden al salir.
Solo los nodos backend y frontend abren el deep-dive — pantallas, base de datos y reglas no tienen estructura interna documentada por el formato.
Las edges file→file solo aparecen si los `.md` de módulo declaran `imports: [otro-file-id]` por archivo. Los diagramas viejos sin este campo solo verán las bindings desde pantallas y la secuencia del flujo activo.
