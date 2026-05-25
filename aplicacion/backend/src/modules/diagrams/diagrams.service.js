/**
 * diagrams.service.js
 *
 * Lógica de negocio del módulo de diagramas: validaciones, control de acceso y
 * orquestación del parser. Delega la persistencia en diagrams.repository.js.
 *
 * Cada operación del servicio recibe un `userId` que se propaga al repositorio.
 * El repositorio aplica el filtro WHERE user_id = ? en todas las queries, así
 * que un diagrama de otro usuario simplemente "no existe" desde la perspectiva
 * del servicio (devuelve null o no afecta filas).
 */

import * as repo from './diagrams.repository.js'
import * as projectsRepo from '../projects/projects.repository.js'
import { parseDocumentation } from '../parser/parser.service.js'

/**
 * Comprueba que un proyecto exista y pertenezca al usuario. Solo es necesaria
 * en `generate`, donde estamos creando un diagrama nuevo y hay que confirmar
 * que el proyecto destino es del usuario antes del INSERT.
 *
 * @param {string} projectId - Id del proyecto destino
 * @param {string} userId - Id del usuario propietario
 * @returns {Promise<object>} El proyecto si el usuario tiene acceso
 * @throws {Error} Si el proyecto no existe o no es del usuario
 */
async function verifyProjectAccess(projectId, userId) {
  const project = await projectsRepo.findById(projectId, userId)
  if (!project) throw new Error('Proyecto no encontrado')
  return project
}

/**
 * Lista los diagramas de un proyecto, tras comprobar que el proyecto es del usuario.
 *
 * @param {string} projectId - Id del proyecto
 * @param {string} userId - Id del usuario propietario
 * @returns {Promise<object[]>} Lista de diagramas del proyecto
 */
export async function getByProject(projectId, userId) {
  await verifyProjectAccess(projectId, userId)
  return repo.findByProject(projectId, userId)
}

/**
 * Devuelve un diagrama completo (modelo JSON + layout) del usuario.
 *
 * @param {string} id - Id del diagrama
 * @param {string} userId - Id del usuario propietario
 * @returns {Promise<object>} El diagrama encontrado
 * @throws {Error} Si el diagrama no existe (o no es del usuario)
 */
export async function getById(id, userId) {
  const diagram = await repo.findById(id, userId)
  if (!diagram) throw new Error('Diagrama no encontrado')
  return diagram
}

/**
 * Genera un diagrama nuevo: valida el acceso al proyecto y los datos de entrada,
 * pasa los .md por el parser para obtener el modelo y el layout, y lo persiste.
 *
 * @param {string} projectId - Id del proyecto destino
 * @param {string} userId - Id del usuario propietario
 * @param {object} datos
 * @param {string} datos.name - Nombre del diagrama (obligatorio)
 * @param {Array<{filename: string, content: string}>} datos.files - Archivos .md a parsear
 * @returns {Promise<object>} El diagrama creado
 * @throws {Error} Si el nombre falta, no hay archivos o el proyecto no es del usuario
 */
export async function generate(projectId, userId, { name, files }) {
  await verifyProjectAccess(projectId, userId)
  if (!name?.trim()) throw new Error('El nombre del diagrama es obligatorio')
  if (!files?.length) throw new Error('Se requiere al menos un archivo .md')

  const { model, layout } = await parseDocumentation(files)
  return repo.create({ projectId, userId, name: name.trim(), model, layout })
}

/**
 * Actualiza un diagrama. Si llegan archivos nuevos los reparsea y regenera el
 * modelo y el layout; si no llegan, solo cambia el nombre y conserva el resto.
 *
 * @param {string} id - Id del diagrama
 * @param {string} userId - Id del usuario propietario
 * @param {object} datos
 * @param {string} datos.name - Nombre del diagrama (obligatorio)
 * @param {Array<{filename: string, content: string}>} [datos.files] - Nuevos .md (opcional)
 * @returns {Promise<object>} El diagrama actualizado
 * @throws {Error} Si el diagrama no existe o falta el nombre
 */
export async function update(id, userId, { name, files }) {
  const diagram = await repo.findById(id, userId)
  if (!diagram) throw new Error('Diagrama no encontrado')
  if (!name?.trim()) throw new Error('El nombre del diagrama es obligatorio')

  let model, layout
  if (files?.length) {
    const parsed = await parseDocumentation(files)
    model = parsed.model
    layout = parsed.layout
  }

  // Solo incluimos model/layout en el patch si se reparseó; así una edición de
  // solo el nombre no pisa el modelo existente.
  return repo.update(id, userId, {
    name: name.trim(),
    description: diagram.description ?? null,
    ...(model !== undefined ? { model, layout } : {}),
  })
}

/**
 * Guarda las posiciones de los nodos del canvas principal.
 *
 * @param {string} id - Id del diagrama
 * @param {string} userId - Id del usuario propietario
 * @param {object} layout - Mapa de posiciones { [nodeId]: { x, y } }
 * @returns {Promise<void>}
 * @throws {Error} Si el diagrama no existe (o no es del usuario)
 */
export async function saveLayout(id, userId, layout) {
  const ok = await repo.updateLayout(id, userId, layout)
  if (!ok) throw new Error('Diagrama no encontrado')
}

/**
 * Guarda las posiciones de los nodos del deep-dive de un módulo concreto.
 *
 * @param {string} id - Id del diagrama
 * @param {string} userId - Id del usuario propietario
 * @param {string} moduleId - Id del módulo cuyo layout se guarda
 * @param {object} layout - Mapa de posiciones { [fileNodeId]: { x, y } }
 * @returns {Promise<void>}
 * @throws {Error} Si el diagrama no existe (o no es del usuario)
 */
export async function saveModuleLayout(id, userId, moduleId, layout) {
  const ok = await repo.updateModuleLayout(id, userId, moduleId, layout)
  if (!ok) throw new Error('Diagrama no encontrado')
}

/**
 * Borra un diagrama del usuario.
 *
 * @param {string} id - Id del diagrama
 * @param {string} userId - Id del usuario propietario
 * @returns {Promise<void>}
 * @throws {Error} Si el diagrama no existe (o no es del usuario)
 */
export async function remove(id, userId) {
  const ok = await repo.remove(id, userId)
  if (!ok) throw new Error('Diagrama no encontrado')
}
