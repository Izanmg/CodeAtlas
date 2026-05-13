import { randomUUID } from 'crypto'
import pool from '../../database/db.js'
import { touchProject } from '../../core/projects.core.js'

/**
 * Normaliza el layout leído de la BD a la forma nueva:
 *   { main: { [nodeId]: { x, y } }, modules: { [moduleId]: { [fileNodeId]: { x, y } } } }
 *
 * Los diagramas viejos guardaron solo el canvas conceptual como un objeto
 * plano. Se detectan por ausencia de la clave `main` y se envuelven al vuelo.
 */
function normalizeLayout(raw) {
  if (!raw) return { main: {}, modules: {} }
  if (typeof raw === 'object' && 'main' in raw) {
    return { main: raw.main || {}, modules: raw.modules || {} }
  }
  return { main: raw, modules: {} }
}

/**
 * Todas las consultas de este repositorio incluyen `user_id` en el WHERE
 * (o en el INSERT). El service NO debe asumir que un id existe sin pasar
 * también el userId — si el diagrama pertenece a otro usuario, las funciones
 * devuelven null o no afectan filas.
 */

export async function findRecentByUser(userId, limit = 10) {
  const [rows] = await pool.query(
    `SELECT id, project_id, name, description,
            count_modules, count_screens, count_tables, count_flows,
            created_at
     FROM diagrams
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [userId, limit]
  )
  return rows
}

export async function findByProject(projectId, userId) {
  const [rows] = await pool.query(
    `SELECT id, project_id, name, description,
            count_modules, count_screens, count_tables, count_flows,
            created_at
     FROM diagrams
     WHERE project_id = ? AND user_id = ?
     ORDER BY created_at DESC`,
    [projectId, userId]
  )
  return rows
}

export async function findById(id, userId) {
  const [rows] = await pool.query(
    'SELECT * FROM diagrams WHERE id = ? AND user_id = ?',
    [id, userId]
  )
  if (!rows[0]) return null
  const row = rows[0]
  return {
    ...row,
    data: {
      model:  JSON.parse(row.model_json),
      layout: normalizeLayout(row.layout_json ? JSON.parse(row.layout_json) : null),
    },
  }
}

export async function create({ projectId, userId, name, description, model, layout }) {
  const id = randomUUID()
  const countModules = (model.modules?.backend?.length ?? 0) + (model.modules?.frontend?.length ?? 0)
  const countScreens = model.screens?.length ?? 0
  const countTables  = model.database?.length ?? 0
  const countFlows   = model.flows?.length ?? 0

  await pool.query(
    `INSERT INTO diagrams
       (id, user_id, project_id, name, description, model_json, layout_json,
        count_modules, count_screens, count_tables, count_flows)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, projectId, name, description ?? null,
     JSON.stringify(model), JSON.stringify(layout),
     countModules, countScreens, countTables, countFlows]
  )
  await touchProject(projectId)
  return findById(id, userId)
}

export async function updateLayout(id, userId, mainLayout) {
  // Lee el layout actual (con cualquier forma) y reemplaza solo `main`.
  // Así no machacamos los layouts de módulos guardados antes.
  const [[row]] = await pool.query(
    'SELECT layout_json FROM diagrams WHERE id = ? AND user_id = ?',
    [id, userId]
  )
  if (!row) return false
  const current = normalizeLayout(row.layout_json ? JSON.parse(row.layout_json) : null)
  current.main = mainLayout
  const [result] = await pool.query(
    'UPDATE diagrams SET layout_json = ? WHERE id = ? AND user_id = ?',
    [JSON.stringify(current), id, userId]
  )
  return result.affectedRows > 0
}

/**
 * Actualiza el layout del deep-dive de un módulo concreto. Hace merge en
 * `layout.modules[moduleId]` sin tocar el resto del JSON.
 */
export async function updateModuleLayout(id, userId, moduleId, moduleLayout) {
  const [[row]] = await pool.query(
    'SELECT layout_json FROM diagrams WHERE id = ? AND user_id = ?',
    [id, userId]
  )
  if (!row) return false
  const current = normalizeLayout(row.layout_json ? JSON.parse(row.layout_json) : null)
  if (!current.modules) current.modules = {}
  current.modules[moduleId] = moduleLayout
  const [result] = await pool.query(
    'UPDATE diagrams SET layout_json = ? WHERE id = ? AND user_id = ?',
    [JSON.stringify(current), id, userId]
  )
  return result.affectedRows > 0
}

export async function update(id, userId, { name, description, model, layout }) {
  const [[row]] = await pool.query(
    'SELECT project_id FROM diagrams WHERE id = ? AND user_id = ?',
    [id, userId]
  )
  if (!row) return null

  const params = [name, description ?? null]
  let extraSets = ''

  if (model !== undefined) {
    const countModules = (model.modules?.backend?.length ?? 0) + (model.modules?.frontend?.length ?? 0)
    const countScreens = model.screens?.length ?? 0
    const countTables  = model.database?.length ?? 0
    const countFlows   = model.flows?.length ?? 0
    extraSets = ', model_json = ?, layout_json = ?, count_modules = ?, count_screens = ?, count_tables = ?, count_flows = ?'
    params.push(JSON.stringify(model), JSON.stringify(layout), countModules, countScreens, countTables, countFlows)
  }

  params.push(id, userId)
  await pool.query(
    `UPDATE diagrams SET name = ?, description = ?${extraSets} WHERE id = ? AND user_id = ?`,
    params
  )
  await touchProject(row.project_id)
  return findById(id, userId)
}

export async function remove(id, userId) {
  const [[row]] = await pool.query(
    'SELECT project_id FROM diagrams WHERE id = ? AND user_id = ?',
    [id, userId]
  )
  if (!row) return false
  await pool.query('DELETE FROM diagrams WHERE id = ? AND user_id = ?', [id, userId])
  await touchProject(row.project_id)
  return true
}
