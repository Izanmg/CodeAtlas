# 07-05 — Frontend vinculado al backend real

## Qué se hizo

Se eliminó toda la lógica temporal (`logica-temporal/`) del frontend y se conectaron todos los módulos a la API real del backend.

## Cambios por módulo

**Auth**
- Creado `src/lib/http.js` — cliente HTTP compartido que inyecta el token JWT automáticamente
- Creado `modules/auth/services/auth.service.js` — login, register, logout, updateUser, changePassword contra `/api/auth`
- Actualizado `auth.store.js` para usar el servicio real
- Eliminado `logica-temporal/`

**Projects**
- Creado `modules/projects/services/projects.service.js` — fetchAll, fetchById, create, bumpDiagramCount contra `/api/projects`
- Creado `modules/projects/utils/time-format.js` — utilidad de fechas en español (movida fuera de logica-temporal)
- Actualizado `projects.store.js` para usar el servicio real
- Eliminado `logica-temporal/`

**Diagrams**
- Creado `modules/diagrams/services/diagrams.service.js` — fetchByProject, fetchById, generate (con FormData), remove contra `/api/diagrams`
- La pantalla de nuevo diagrama soporta subida de archivos `.md` individuales y carpetas completas (drag & drop recursivo con FileSystem API + input `webkitdirectory`)
- Actualizado `diagrams.store.js` para usar el servicio real
- Eliminado `logica-temporal/`

**Settings**
- Eliminado `logica-temporal/settings-mock.js`
- `SettingsView.vue` llama directamente a `authStore.updateUser` y `authStore.changePassword`
- El cambio de contraseña muestra errores del backend

## Otros cambios

- Añadida columna `last_update` en la tabla `projects` de MySQL
- Creado `backend/src/core/projects.core.js` con `touchProject(projectId)` — función que actualiza `last_update` al crear o eliminar un diagrama
- La normalización del frontend mapea `last_update` al campo `updatedAt` que muestran las tarjetas de proyecto
