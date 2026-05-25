/**
 * projects.service.js
 *
 * Lógica de negocio del módulo de proyectos: validaciones y reglas antes de
 * tocar la base de datos (que se hace en projects.repository.js).
 *
 * Responsabilidad: reglas como "el nombre es obligatorio" o "no se puede borrar
 * un proyecto que aún tiene diagramas".
 */

import * as repo from './projects.repository.js'

/**
 * Devuelve todos los proyectos de un usuario.
 *
 * @param {string} userId - Id del usuario
 * @returns {Promise<object[]>} Lista de proyectos
 */
export async function getAll(userId) {
  return repo.findAllByUser(userId)
}

/**
 * Busca un proyecto concreto del usuario.
 *
 * @param {string} id - Id del proyecto
 * @param {string} userId - Id del usuario propietario
 * @returns {Promise<object>} El proyecto encontrado
 * @throws {Error} Si el proyecto no existe (o no es del usuario)
 */
export async function getById(id, userId) {
  const project = await repo.findById(id, userId)
  if (!project) throw new Error('Proyecto no encontrado')
  return project
}

/**
 * Crea un proyecto nuevo. El nombre es obligatorio y se le quitan los espacios
 * sobrantes antes de guardarlo.
 *
 * @param {string} userId - Id del usuario propietario
 * @param {object} datos
 * @param {string} datos.name - Nombre del proyecto (obligatorio)
 * @param {string} [datos.description] - Descripción opcional
 * @returns {Promise<object>} El proyecto creado
 * @throws {Error} Si el nombre está vacío
 */
export async function create(userId, { name, description }) {
  if (!name?.trim()) throw new Error('El nombre del proyecto es obligatorio')
  return repo.create({ userId, name: name.trim(), description })
}

/**
 * Actualiza un proyecto del usuario.
 *
 * @param {string} id - Id del proyecto
 * @param {string} userId - Id del usuario propietario
 * @param {object} patch - Campos a actualizar
 * @returns {Promise<object>} El proyecto actualizado
 * @throws {Error} Si el proyecto no existe (o no es del usuario)
 */
export async function update(id, userId, patch) {
  const updated = await repo.update(id, userId, patch)
  if (!updated) throw new Error('Proyecto no encontrado')
  return updated
}

/**
 * Borra un proyecto, pero solo si está vacío: si todavía tiene diagramas,
 * obliga a borrarlos primero para no dejar diagramas huérfanos.
 *
 * @param {string} id - Id del proyecto
 * @param {string} userId - Id del usuario propietario
 * @returns {Promise<void>}
 * @throws {Error} Si el proyecto no existe o aún contiene diagramas
 */
export async function remove(id, userId) {
  const project = await getById(id, userId)
  if (Number(project.diagram_count) > 0)
    throw new Error('El proyecto tiene diagramas. Bórralos primero.')
  await repo.remove(id, userId)
}
