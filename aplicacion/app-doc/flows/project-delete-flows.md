---
type: flow
id: project-delete
name: Borrar proyecto
description: Eliminar un proyecto que no tiene diagramas dentro
trigger: el usuario pulsa el icono de borrar en una tarjeta de proyecto
screens: [dashboard]
modules: [projects-frontend, projects-backend]
database: [projects]
---

## Steps
- [screen:dashboard] El usuario pulsa el icono de borrar en una tarjeta de proyecto (deshabilitado si tiene diagramas)
- [frontend:projects-frontend/ProjectCard.vue/startDelete] El componente abre el ConfirmDeleteModal con el nombre del proyecto
- [frontend:projects-frontend/ProjectCard.vue/confirmDelete] El usuario pulsa Confirmar
- [frontend:projects-frontend/projects.store.js/remove] El store llama a projectsService.remove y luego filtra el proyecto de la lista local
- [frontend:projects-frontend/projects.service.js/remove] Se hace DELETE /api/projects/:id
- [backend:projects-backend/projects.controller.js/remove] Llega la petición al controller (con requireAuth)
- [backend:projects-backend/projects.service.js/remove] Se obtiene el proyecto y se valida que `diagram_count === 0`
- [backend:projects-backend/projects.repository.js/remove] DELETE WHERE id=? AND user_id=?
- [database:projects] DELETE de la fila
- [frontend:projects-frontend/projects.store.js/remove] El store filtra el proyecto de la lista
- [screen:dashboard] La tarjeta desaparece del grid

## Error Cases
- El proyecto tiene diagramas: el service lanza "El proyecto tiene diagramas. Bórralos primero.", el controller devuelve 400 con el mensaje, el modal lo muestra y deja al usuario reintentar tras borrar los diagramas
- Proyecto de otro usuario o ya borrado: el repositorio devuelve `affectedRows = 0`, el service lanza "Proyecto no encontrado", cliente muestra 404
- Error de red: el modal muestra el mensaje y mantiene la tarjeta

## Notes
La validación "no se puede borrar con diagramas dentro" vive en el service del backend (no en una constraint de BD). El frontend además deshabilita el botón cuando `diagramCount > 0` para guiar la UX, pero la verdad final está en el backend.
La FK `diagrams.project_id` está con `ON DELETE CASCADE`, así que si esta validación se eliminara en el futuro, los diagramas se borrarían automáticamente al borrar el proyecto.
