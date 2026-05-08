---
type: flow
id: diagram-edit
name: Editar diagrama
description: Renombrar un diagrama y opcionalmente regenerar su contenido subiendo nuevos archivos .md
trigger: el usuario pulsa el botón de editar en una tarjeta de diagrama
screens: [project-detail]
modules: [projects-frontend, diagrams-frontend, diagrams-backend, parser-backend]
database: [diagrams, projects]
---

## Steps
- [screen:project-detail] El usuario pulsa el icono de editar en una tarjeta de diagrama
- [frontend:projects-frontend/DiagramCard.vue/startEdit] El componente abre el DiagramEditModal con el nombre actual pre-rellenado
- [frontend:projects-frontend/DiagramEditModal.vue/save] El usuario modifica el nombre y/o arrastra nuevos archivos .md y pulsa Guardar
- [frontend:diagrams-frontend/diagrams.store.js/update] El store delega en diagramsService.update con { name, files } y un callback de progreso
- [frontend:diagrams-frontend/diagrams.service.js/update] Se construye FormData con name + files[] (si hay) y se hace PATCH /api/diagrams/:id
- [backend:diagrams-backend/diagrams.controller.js/update] Llega la petición al controller con multer (memoryStorage)
- [backend:diagrams-backend/diagrams.service.js/update] Se valida el nombre; si hay archivos se llama al parser para regenerar
- [backend:parser-backend/parser.service.js/parseDocumentation] Pipeline completo de parseo (solo si llegaron archivos)
- [backend:diagrams-backend/diagrams.repository.js/update] UPDATE dinámico: siempre actualiza name; si hay model nuevo, actualiza también model_json y layout_json
- [database:diagrams] UPDATE de la fila WHERE id=? AND user_id=?
- [database:projects] UPDATE last_update vía touchProject
- [frontend:diagrams-frontend/diagrams.store.js/update] El store actualiza el diagrama en `all` y `current`
- [screen:project-detail] La tarjeta del diagrama refleja el nuevo nombre; si hubo regeneración, los contadores también

## Error Cases
- Nombre vacío: el frontend bloquea el botón Guardar antes de enviar
- Archivos .md inválidos: el parser devuelve 400 con `[nombre-archivo] campo requerido "X"`; la vista lo muestra dentro del modal sin cerrarlo
- Diagrama de otro usuario: el repositorio no encuentra fila (filtro user_id), service lanza "Diagrama no encontrado", el cliente muestra 404
- Error de red durante el guardado: la vista muestra un mensaje y permite reintentar

## Notes
La actualización es flexible: si el usuario solo cambia el nombre, el endpoint hace un UPDATE pequeño sin tocar `model_json` ni `layout_json`. Si añade archivos, el parser regenera el modelo completo y se guardan los nuevos `model_json` y `layout_json`.
El `touchProject` se llama siempre (haya o no regeneración) para que `last_update` del proyecto refleje la edición.
El layout se reinicia al regenerar — el usuario perderá las posiciones que hubiera guardado manualmente. La UI advierte de esto antes de confirmar cuando hay archivos seleccionados.
