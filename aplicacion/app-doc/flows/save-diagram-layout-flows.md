---
type: flow
id: save-diagram-layout
name: Guardar layout del diagrama
description: Persistir las nuevas posiciones de los nodos tras moverlos en el canvas
trigger: el usuario arrastra nodos y pulsa Guardar
screens: [diagram-view]
modules: [diagrams-frontend, diagrams-backend]
database: [diagrams]
---

## Steps
- [screen:diagram-view] El usuario arrastra uno o más nodos en el canvas
- [frontend:diagrams-frontend/DiagramView.vue/handleNodesChange] Vue Flow emite @nodes-change con dragging:false; el handler aplica las posiciones a nodes.value y guarda un snapshot en el historial
- [frontend:diagrams-frontend/DiagramView.vue/saveLayout] El usuario pulsa el botón Guardar (habilitado cuando dirty=true)
- [frontend:diagrams-frontend/diagrams.store.js/saveLayout] El store delega en diagramsService.saveLayout
- [frontend:diagrams-frontend/diagrams.service.js/saveLayout] Se hace PATCH /api/diagrams/:id/layout con { layout: { [nodeId]: { x, y } } }
- [backend:diagrams-backend/diagrams.controller.js/saveLayout] Llega la petición al controller (con requireAuth)
- [backend:diagrams-backend/diagrams.service.js/saveLayout] Se llama al repositorio
- [backend:diagrams-backend/diagrams.repository.js/updateLayout] UPDATE con WHERE id=? AND user_id=?
- [database:diagrams] UPDATE layout_json
- [frontend:diagrams-frontend/DiagramView.vue/saveLayout] Tras el 204, se resetea el historial dejando el snapshot actual como base limpia y se muestra brevemente "Guardado"

## Error Cases
- Diagrama de otro usuario: el repo no encuentra fila (filtro user_id), service lanza "Diagrama no encontrado", el cliente muestra 404
- Sin sesión activa: requireAuth devuelve 401
- Error de red durante el guardado: la vista muestra un mensaje de error y deja el botón Guardar habilitado para reintentar

## Notes
Si el usuario intenta navegar fuera del canvas con cambios sin guardar, un modal "Cambios sin guardar" intercepta la navegación y ofrece guardar y salir, salir sin guardar o cancelar.
El layout no se guarda automáticamente al mover — solo cuando el usuario lo confirma. Esto evita ráfagas de PATCH durante drag continuos.
