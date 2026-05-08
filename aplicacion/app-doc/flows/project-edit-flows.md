---
type: flow
id: project-edit
name: Editar proyecto
description: Renombrar un proyecto o cambiar su descripción
trigger: el usuario pulsa el icono de editar en una tarjeta de proyecto
screens: [dashboard]
modules: [projects-frontend, projects-backend]
database: [projects]
---

## Steps
- [screen:dashboard] El usuario pulsa el icono de editar en una tarjeta de proyecto
- [frontend:projects-frontend/ProjectCard.vue/startEdit] El componente abre el ProjectEditModal con nombre y descripción pre-rellenados
- [frontend:projects-frontend/ProjectEditModal.vue/save] El usuario edita los campos y pulsa Guardar
- [frontend:projects-frontend/projects.store.js/update] El store delega en projectsService.update con { name, description }
- [frontend:projects-frontend/projects.service.js/update] Se hace PATCH /api/projects/:id
- [backend:projects-backend/projects.controller.js/update] Llega la petición al controller (con requireAuth)
- [backend:projects-backend/projects.service.js/update] Se llama al repositorio
- [backend:projects-backend/projects.repository.js/update] UPDATE de la fila WHERE id=? AND user_id=?
- [database:projects] UPDATE de name, description y last_update = NOW()
- [frontend:projects-frontend/projects.store.js/update] El store reemplaza el proyecto en la lista local con el normalizado del backend
- [screen:dashboard] La tarjeta del proyecto refleja inmediatamente los cambios

## Error Cases
- Nombre vacío: el frontend bloquea el botón Guardar antes de enviar
- Proyecto de otro usuario: el repositorio no encuentra fila (filtro user_id), service lanza "Proyecto no encontrado", el cliente muestra 404
- Error de red: la vista muestra un mensaje en el modal y permite reintentar

## Notes
La descripción puede vaciarse: el frontend envía `null` cuando el campo queda en blanco y el repositorio escribe NULL en la columna (UPDATE sin COALESCE para `description`).
El `name` sigue usando COALESCE en el SQL como defensa por si el cliente lo enviara nulo, pero el service lo valida antes.
A diferencia de `project-creation` que añade el proyecto al inicio de la lista, `update` lo reemplaza in-place manteniendo el orden actual.
