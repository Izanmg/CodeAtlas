/**
 * diagrams.service.js (frontend)
 *
 * Capa de acceso a la API de diagramas desde el frontend. Cubre el listado, la
 * generación (subiendo .md), la edición, el guardado de posiciones (layout) y
 * el borrado.
 *
 * Todas las lecturas pasan por normalize() para convertir los nombres de campo
 * snake_case que devuelve el backend a camelCase, que es lo que usan los
 * componentes Vue.
 */

import { http } from '@/lib/http'

/**
 * Adapta un diagrama de la API (snake_case) a la forma que usa el frontend
 * (camelCase), rellenando contadores a 0 si vinieran ausentes.
 *
 * @param {object} d - Diagrama tal cual lo devuelve el backend
 * @returns {object} Diagrama normalizado en camelCase
 */
function normalize(d) {
  return {
    ...d,
    createdAt:    d.created_at    ?? d.createdAt,
    projectId:    d.project_id    ?? d.projectId,
    countModules: d.count_modules ?? d.countModules ?? 0,
    countScreens: d.count_screens ?? d.countScreens ?? 0,
    countTables:  d.count_tables  ?? d.countTables  ?? 0,
    countFlows:   d.count_flows   ?? d.countFlows   ?? 0,
  }
}

/**
 * Trae los diagramas más recientes del usuario (para el dashboard).
 *
 * @returns {Promise<object[]>} Diagramas normalizados
 */
export async function fetchAll() {
  const data = await http('/diagrams/recent')
  return data.map(normalize)
}

/**
 * Trae los diagramas de un proyecto concreto.
 *
 * @param {string} projectId - Id del proyecto
 * @returns {Promise<object[]>} Diagramas normalizados
 */
export async function fetchByProject(projectId) {
  const data = await http(`/projects/${projectId}/diagrams`)
  return data.map(normalize)
}

/**
 * Trae un diagrama completo por su id (modelo + layout).
 *
 * @param {string} id - Id del diagrama
 * @returns {Promise<object>} Diagrama normalizado
 */
export async function fetchById(id) {
  return normalize(await http(`/diagrams/${id}`))
}

/**
 * Genera un diagrama nuevo subiendo archivos .md como multipart. El callback
 * opcional onProgress permite que la UI muestre una barra de progreso por fases.
 *
 * @param {object} datos
 * @param {string} datos.projectId - Proyecto donde se crea el diagrama
 * @param {string} datos.name - Nombre del diagrama
 * @param {Array<{file: File, name: string}>} datos.files - Archivos .md a subir
 * @param {(p: {progress: number, label: string}) => void} [onProgress] - Callback de progreso
 * @returns {Promise<object>} El diagrama generado, normalizado
 */
export async function generate({ projectId, name, files }, onProgress) {
  onProgress?.({ progress: 25, label: 'Preparando archivos…' })

  const form = new FormData()
  form.append('name', name)
  for (const f of files) {
    if (f.file instanceof File) form.append('files', f.file, f.name)
  }

  onProgress?.({ progress: 50, label: 'Analizando documentación…' })

  const diagram = await http(`/projects/${projectId}/diagrams`, {
    method: 'POST',
    body: form,
  })

  onProgress?.({ progress: 100, label: '¡Diagrama generado!' })
  return normalize(diagram)
}

/**
 * Guarda las posiciones de los nodos del canvas principal.
 *
 * @param {string} id - Id del diagrama
 * @param {object} layout - Mapa de posiciones { [nodeId]: { x, y } }
 * @returns {Promise<any>} Respuesta de la API
 */
export async function saveLayout(id, layout) {
  return http(`/diagrams/${id}/layout`, {
    method: 'PATCH',
    body: JSON.stringify({ layout }),
  })
}

/**
 * Guarda las posiciones de los nodos del deep-dive de un módulo.
 *
 * @param {string} id - Id del diagrama
 * @param {string} moduleId - Id del módulo
 * @param {object} layout - Mapa de posiciones { [fileNodeId]: { x, y } }
 * @returns {Promise<any>} Respuesta de la API
 */
export async function saveModuleLayout(id, moduleId, layout) {
  return http(`/diagrams/${id}/modules/${moduleId}/layout`, {
    method: 'PATCH',
    body: JSON.stringify({ layout }),
  })
}

/**
 * Actualiza un diagrama. Si se pasan archivos, se reparsea el modelo; si no,
 * solo se cambia el nombre. onProgress ajusta los textos según haya o no .md.
 *
 * @param {string} id - Id del diagrama
 * @param {object} datos
 * @param {string} datos.name - Nombre del diagrama
 * @param {Array<{file: File, name: string}>} [datos.files] - Nuevos .md (opcional)
 * @param {(p: {progress: number, label: string}) => void} [onProgress] - Callback de progreso
 * @returns {Promise<object>} El diagrama actualizado, normalizado
 */
export async function update(id, { name, files = [] }, onProgress) {
  onProgress?.({ progress: 20, label: files.length ? 'Preparando archivos…' : 'Guardando…' })

  const form = new FormData()
  form.append('name', name)
  for (const f of files) {
    if (f.file instanceof File) form.append('files', f.file, f.name)
  }

  if (files.length) onProgress?.({ progress: 50, label: 'Analizando documentación…' })

  const diagram = await http(`/diagrams/${id}`, { method: 'PATCH', body: form })

  onProgress?.({ progress: 100, label: files.length ? '¡Diagrama actualizado!' : 'Guardado' })
  return normalize(diagram)
}

/**
 * Borra un diagrama.
 *
 * @param {string} id - Id del diagrama
 * @returns {Promise<any>} Respuesta de la API
 */
export async function remove(id) {
  return http(`/diagrams/${id}`, { method: 'DELETE' })
}
