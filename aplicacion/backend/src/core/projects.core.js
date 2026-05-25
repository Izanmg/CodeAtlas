/**
 * projects.core.js
 *
 * Funciones compartidas relacionadas con proyectos que necesitan otros módulos
 * (por ejemplo el de diagramas). Se sacan aquí para evitar dependencias
 * cruzadas entre repositorios.
 *
 * Responsabilidad: utilidades transversales sobre la tabla `projects`.
 */

import pool from '../database/db.js'

/**
 * Marca un proyecto como "tocado" actualizando su fecha de última modificación.
 * Se llama cada vez que cambia algo dentro del proyecto (crear, editar o borrar
 * un diagrama) para que el dashboard pueda ordenar los proyectos por actividad.
 *
 * @param {string} projectId - Id del proyecto a actualizar
 * @returns {Promise<void>}
 */
export async function touchProject(projectId) {
  await pool.query(
    'UPDATE projects SET last_update = NOW() WHERE id = ?',
    [projectId]
  )
}
