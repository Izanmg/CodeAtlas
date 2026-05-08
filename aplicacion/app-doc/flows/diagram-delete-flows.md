---
type: flow
id: diagram-delete
name: Borrar diagrama
description: Eliminar un diagrama del proyecto
trigger: el usuario pulsa el icono de borrar en una tarjeta de diagrama
screens: [project-detail]
modules: [projects-frontend, diagrams-frontend, diagrams-backend]
database: [diagrams, projects]
---

## Steps
- [screen:project-detail] El usuario pulsa el icono de borrar en una tarjeta de diagrama
- [frontend:projects-frontend/DiagramCard.vue/startDelete] El componente abre el ConfirmDeleteModal con el nombre del diagrama
- [frontend:projects-frontend/DiagramCard.vue/confirmDelete] El usuario pulsa Confirmar; el componente emite el evento `deleted` con el id
- [frontend:projects-frontend/ProjectDetailView.vue/deleteDiagram] La vista llama a diagramsStore.remove y luego refresca el contador del proyecto
- [frontend:diagrams-frontend/diagrams.store.js/remove] El store delega en diagramsService.remove
- [frontend:diagrams-frontend/diagrams.service.js/remove] Se hace DELETE /api/diagrams/:id
- [backend:diagrams-backend/diagrams.controller.js/remove] Llega la petición al controller (con requireAuth)
- [backend:diagrams-backend/diagrams.service.js/remove] Se llama al repositorio
- [backend:diagrams-backend/diagrams.repository.js/remove] DELETE WHERE id=? AND user_id=?
- [database:diagrams] DELETE de la fila
- [database:projects] UPDATE last_update vía touchProject (el proyecto se queda con un diagrama menos)
- [frontend:diagrams-frontend/diagrams.store.js/remove] El store filtra el diagrama de `all` y limpia `current` si era el actual
- [frontend:projects-frontend/projects.store.js/bumpDiagramCount] Se refetcha el proyecto para refrescar `diagram_count` y `last_update`
- [screen:project-detail] La tarjeta desaparece y el contador del header se decrementa

## Error Cases
- Diagrama de otro usuario o ya borrado: el repositorio devuelve `affectedRows = 0`, el service lanza "Diagrama no encontrado", el cliente muestra 404 (no debería pasar en condiciones normales)
- Error de red durante el borrado: la vista mantiene la tarjeta y muestra un mensaje de error

## Notes
El borrado es definitivo (no hay soft-delete). El `model_json` y `layout_json` se pierden al borrar la fila.
El refresh del contador se hace con un GET adicional al proyecto en lugar de decrementarlo localmente, para garantizar consistencia con `last_update` y otros derivados que el backend pudiera calcular en el futuro.
