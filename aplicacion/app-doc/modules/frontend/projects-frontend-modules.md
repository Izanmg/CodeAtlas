---
type: module
layer: frontend
id: projects-frontend
name: Proyectos
description: Detalle de proyecto, listado de diagramas y CRUD de proyectos
screens: [project-detail]
consumes-api: [projects-backend, diagrams-backend]
depends-on: []
folders:
  - id: views
    path: src/modules/projects/views
  - id: components
    path: src/modules/projects/components
  - id: stores
    path: src/modules/projects/stores
  - id: services
    path: src/modules/projects/services
  - id: utils
    path: src/modules/projects/utils
files:
  - id: project-detail-view
    folder: views
    path: ProjectDetailView.vue
    type: view
    imports: [projects-store, stat-cell, section-label, empty-state, diagram-card, time-format]
    role: Vista de un proyecto. Muestra header con datos del proyecto + grid de diagramas. Es el punto de entrada para crear nuevos diagramas y borrar el proyecto.
  - id: project-card
    folder: components
    path: ProjectCard.vue
    type: component
    imports: [projects-store, project-thumb, empty-thumb, confirm-delete-modal, project-edit-modal, time-format]
    role: Tarjeta de proyecto del dashboard. Click abre el detalle; expone botones de editar y borrar con sus respectivos modales.
  - id: diagram-card
    folder: components
    path: DiagramCard.vue
    type: component
    imports: [diagram-thumb, confirm-delete-modal, diagram-edit-modal, time-format]
    role: Tarjeta de diagrama (usada en dashboard y detalle de proyecto). Click navega al canvas; expone editar y borrar.
  - id: confirm-delete-modal
    folder: components
    path: ConfirmDeleteModal.vue
    type: component
    role: Modal de confirmación genérico antes de cualquier borrado destructivo. Recibe el nombre del recurso por prop.
  - id: project-edit-modal
    folder: components
    path: ProjectEditModal.vue
    type: component
    imports: [projects-store]
    role: Modal para renombrar el proyecto y editar su descripción. Permite vaciar la descripción.
  - id: diagram-edit-modal
    folder: components
    path: DiagramEditModal.vue
    type: component
    role: Modal para renombrar el diagrama y opcionalmente re-subir archivos .md para regenerar el modelo completo.
  - id: project-thumb
    folder: components
    path: ProjectThumb.vue
    type: component
    role: Miniatura visual del proyecto. Genera un patrón de bloques pseudoaleatorio basado en el id para diferenciar proyectos sin contenido real.
  - id: diagram-thumb
    folder: components
    path: DiagramThumb.vue
    type: component
    role: Miniatura visual del diagrama. Patrón geométrico decorativo para las tarjetas mientras no se renderiza el diagrama real.
  - id: empty-thumb
    folder: components
    path: EmptyThumb.vue
    type: component
    role: Variante de miniatura para tarjetas de proyecto sin diagramas todavía. Indica visualmente el estado vacío.
  - id: empty-state
    folder: components
    path: EmptyState.vue
    type: component
    role: Bloque genérico de "aún no hay contenido aquí" con icono, título, descripción y CTA. Reusable en cualquier listado vacío.
  - id: section-label
    folder: components
    path: SectionLabel.vue
    type: component
    role: Etiqueta de sección uppercase + contador opcional. Encabeza grupos de tarjetas en el dashboard y detalle de proyecto.
  - id: stat-cell
    folder: components
    path: StatCell.vue
    type: component
    role: Celda de estadística para el strip superior del detalle de proyecto (Diagramas / Última modificación / Creado).
  - id: projects-store
    folder: stores
    path: projects.store.js
    type: store
    imports: [projects-frontend-service]
    role: Estado global de proyectos. Mantiene la lista en caché para evitar refetchs y aplica las mutaciones (create/update/remove) localmente.
  - id: projects-frontend-service
    folder: services
    path: projects.service.js
    type: service
    role: Cliente HTTP del módulo. Normaliza los campos snake_case del backend a camelCase (diagram_count → diagramCount, last_update → updatedAt).
  - id: time-format
    folder: utils
    path: time-format.js
    type: helper
    role: Helpers de formateo de fechas. Convierte timestamps a frases relativas (hace 5 min) y absolutas (15 may 2026).
---

## Purpose
Gestiona la vista de detalle del proyecto con sus diagramas y el CRUD de proyectos desde el cliente. El store mantiene la lista de proyectos en caché para evitar peticiones redundantes al backend (la cache se invalida pasando `force=true` o creando/borrando un proyecto). Los componentes `ProjectCard` y `DiagramCard` se usan también desde el dashboard.

## State
- projects
- loading
- loaded

## Functions

### project-detail-view
- onMounted: carga el proyecto y sus diagramas
  doc: Llama a projectsStore.fetchById y diagramsStore.fetchByProject en paralelo. Redirige al dashboard si el proyecto no existe.
- handleCreateDiagram()
  doc: Navega a /projects/:id/diagrams/new.
- handleDeleteProject()
  doc: Abre el ConfirmDeleteModal. Tras confirmar, llama a projectsStore.remove y navega al dashboard.
- handleDeleteDiagram(diagramId)
  doc: Llama a diagramsStore.remove y refresca diagram_count del proyecto via projectsStore.bumpDiagramCount.

### project-card
- onClick: navega al detalle del proyecto
  doc: Bloqueado si hay un modal abierto encima de la tarjeta.
- onDelete: emite el evento de borrado (con confirmación)
  doc: Deshabilitado en el frontend si diagramCount > 0; el backend revalida igualmente.

### diagram-card
- onClick: navega al diagrama
  doc: Bloqueado si hay modal de editar o borrar abierto.
- onDelete: emite el evento de borrado (con confirmación)
  doc: Confirmación pasa por ConfirmDeleteModal mostrando el nombre del diagrama.

### project-edit-modal
- close()
  doc: Cancela y cierra el modal. Bloqueado mientras hay una petición en curso.
- save()
  doc: Llama a projectsStore.update con { name, description }. Si description está vacío envía null para borrar el campo en BD.

### diagram-edit-modal
- addFiles(fileList)
  doc: Filtra solo .md y .markdown, deduplica por nombre + lastModified.
- onSelectFiles(e)
  doc: Handler del input file estándar y del input con webkitdirectory.
- onDrop(e)
  doc: Procesa archivos arrastrados, incluso carpetas (recorre webkitGetAsEntry para extraer archivos recursivamente).
- removeFile(id)
  doc: Quita un archivo de la lista local antes de subirlo.
- formatSize(bytes)
  doc: Helper para mostrar tamaños como "12.3 KB" o "456 B".
- close()
  doc: Cierra el modal. Bloqueado mientras `state === 'loading'`.
- save()
  doc: Llama a diagramsStore.update. Si hay archivos, muestra progreso por fases (preparando / analizando / regenerando).

### projects-store
- fetchAll(force)
  doc: Devuelve la caché si está cargada y force=false. Si no, hace GET /api/projects.
- fetchById(id)
  doc: Devuelve el proyecto desde el backend (sin caché — siempre fresco para tener last_update y diagram_count actualizados).
- create(payload)
  doc: POST y añade el proyecto al inicio de la lista local. No refetcha.
- bumpDiagramCount(projectId, delta)
  doc: Refetcha el proyecto desde el backend para refrescar diagram_count y last_update. Más fiable que decrementar localmente.
- update(id, patch)
  doc: PATCH y reemplaza el proyecto in-place en la lista local manteniendo el orden.
- remove(id)
  doc: DELETE y filtra el proyecto de la lista local. Si el backend devuelve 400 (tiene diagramas), no toca la lista y propaga el error.

### projects-frontend-service
- fetchAll()
  doc: GET /api/projects. Normaliza cada item con snake_case → camelCase.
- fetchById(id)
  doc: GET /api/projects/:id. Misma normalización que fetchAll.
- create({ name, description })
  doc: POST /api/projects. Devuelve el proyecto normalizado con id, diagram_count: 0 y created_at/last_update.
- bumpDiagramCount(projectId)
  doc: Implementación actual: hace un fetchById para traer los contadores frescos del backend.
- remove(id)
  doc: DELETE /api/projects/:id. Devuelve null en 204; propaga 400 con mensaje si el proyecto tiene diagramas.

### time-format
- formatRelative(date)
  doc: Devuelve frases tipo "hace 5 minutos", "hace 2 horas", "ayer". Usa Intl.RelativeTimeFormat con locale es.
- formatDate(date)
  doc: Devuelve la fecha absoluta corta tipo "15 may 2026".

## Notes
El service normaliza los campos snake_case del backend a camelCase para uso en componentes (`diagram_count` → `diagramCount`, `created_at` → `createdAt`, `last_update` → `updatedAt`).
La acción `bumpDiagramCount` no incrementa localmente — refetcha el proyecto desde el backend para garantizar consistencia (incluye `last_update` y el contador real).
Borrar un proyecto con diagramas dentro falla con el mensaje del backend ("El proyecto tiene diagramas. Bórralos primero."). El componente de confirmación muestra ese error sin cerrar el modal.
