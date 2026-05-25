/**
 * projects.service.js (frontend)
 *
 * Capa de acceso a la API de proyectos desde el frontend. Cubre listar, leer,
 * crear, actualizar y borrar proyectos. Las lecturas pasan por normalize() para
 * traducir los campos snake_case del backend a camelCase.
 */

import { http } from '@/lib/http'

/**
 * Adapta un proyecto de la API (snake_case) a la forma del frontend (camelCase).
 * Usa last_update como updatedAt y cae a created_at si el proyecto nunca se ha
 * modificado.
 *
 * @param {object} p - Proyecto tal cual lo devuelve el backend
 * @returns {object} Proyecto normalizado en camelCase
 */
function normalize(p) {
  return {
    ...p,
    diagramCount: Number(p.diagram_count ?? p.diagramCount ?? 0),
    createdAt: p.created_at ?? p.createdAt,
    updatedAt: p.last_update ?? p.created_at ?? p.createdAt,
  }
}

/**
 * Trae todos los proyectos del usuario.
 *
 * @returns {Promise<object[]>} Proyectos normalizados
 */
export async function fetchAll() {
  const data = await http('/projects')
  return data.map(normalize)
}

/**
 * Trae un proyecto por su id.
 *
 * @param {string} id - Id del proyecto
 * @returns {Promise<object>} Proyecto normalizado
 */
export async function fetchById(id) {
  return normalize(await http(`/projects/${id}`))
}

/**
 * Crea un proyecto nuevo.
 *
 * @param {{name: string, description?: string}} datos
 * @returns {Promise<object>} El proyecto creado, normalizado
 */
export async function create({ name, description }) {
  return normalize(
    await http('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    })
  )
}

/**
 * Vuelve a leer un proyecto para refrescar su contador de diagramas. Se usa tras
 * crear o borrar un diagrama, cuando solo interesa actualizar el conteo.
 *
 * @param {string} projectId - Id del proyecto a refrescar
 * @returns {Promise<object>} El proyecto actualizado, normalizado
 */
export async function bumpDiagramCount(projectId) {
  return fetchById(projectId)
}

/**
 * Actualiza nombre y/o descripción de un proyecto.
 *
 * @param {string} id - Id del proyecto
 * @param {{name?: string, description?: string}} datos - Campos a actualizar
 * @returns {Promise<object>} El proyecto actualizado, normalizado
 */
export async function update(id, { name, description }) {
  return normalize(
    await http(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, description }),
    })
  )
}

/**
 * Borra un proyecto.
 *
 * @param {string} id - Id del proyecto
 * @returns {Promise<any>} Respuesta de la API
 */
export async function remove(id) {
  return http(`/projects/${id}`, { method: 'DELETE' })
}
