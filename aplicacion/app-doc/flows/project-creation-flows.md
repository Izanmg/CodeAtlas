---
type: flow
id: project-creation
name: Creación de proyecto
description: Crear un proyecto nuevo desde el dashboard
trigger: el usuario pulsa "Nuevo proyecto" e introduce el nombre
screens: [dashboard, project-detail]
modules: [projects-frontend, projects-backend]
database: [projects]
---

## Steps
- [screen:dashboard] El usuario pulsa el botón "Nuevo proyecto" y se abre un modal con los inputs
- [frontend:dashboard-frontend/DashboardView.vue/handleCreateProject] Se valida el nombre y se llama a projectsStore.create(payload)
- [frontend:projects-frontend/projects.store.js/create] El store delega en projectsService.create
- [frontend:projects-frontend/projects.service.js/create] Se hace POST /api/projects con { name, description }
- [backend:projects-backend/projects.controller.js/create] Llega la petición al controller (con requireAuth)
- [backend:projects-backend/projects.service.js/create] Se valida que el nombre no esté vacío y se llama al repositorio
- [backend:projects-backend/projects.repository.js/create] Se inserta el proyecto con un UUID nuevo
- [database:projects] INSERT con id, user_id (del JWT), name, description, last_update = NOW()
- [frontend:projects-frontend/projects.store.js/create] El store añade el proyecto a la lista local sin refetch
- [screen:project-detail] El usuario navega al detalle del proyecto recién creado

## Error Cases
- Nombre vacío: el frontend bloquea el envío; si llega al backend, devuelve 400 con "El nombre del proyecto es obligatorio"
- Sin sesión activa: el middleware requireAuth devuelve 401 y el cliente HTTP redirige a login

## Notes
El proyecto recién creado tiene `diagram_count = 0` y se muestra inmediatamente en el dashboard sin necesidad de refetchear el listado.
