import { randomUUID } from 'crypto'
import pool from '../../database/db.js'
import { touchProject } from '../../core/projects.core.js'

export async function findRecentByUser(userId, limit = 10) {
  const [rows] = await pool.query(
    `SELECT d.id, d.project_id, d.name, d.description,
            d.count_modules, d.count_screens, d.count_tables, d.count_flows,
            d.created_at
     FROM diagrams d
     JOIN projects p ON p.id = d.project_id
     WHERE p.user_id = ?
     ORDER BY d.created_at DESC
     LIMIT ?`,
    [userId, limit]
  )
  return rows
}

export async function findByProject(projectId) {
  const [rows] = await pool.query(
    `SELECT id, project_id, name, description,
            count_modules, count_screens, count_tables, count_flows,
            created_at
     FROM diagrams WHERE project_id = ? ORDER BY created_at DESC`,
    [projectId]
  )
  return rows
}

export async function findById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM diagrams WHERE id = ?',
    [id]
  )
  if (!rows[0]) return null
  const row = rows[0]
  return {
    ...row,
    data: {
      model:  JSON.parse(row.model_json),
      layout: row.layout_json ? JSON.parse(row.layout_json) : {},
    },
  }
}

export async function create({ projectId, name, description, model, layout }) {
  const id = randomUUID()
  const countModules = (model.modules?.backend?.length ?? 0) + (model.modules?.frontend?.length ?? 0)
  const countScreens = model.screens?.length ?? 0
  const countTables  = model.database?.length ?? 0
  const countFlows   = model.flows?.length ?? 0

  await pool.query(
    `INSERT INTO diagrams
       (id, project_id, name, description, model_json, layout_json,
        count_modules, count_screens, count_tables, count_flows)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, projectId, name, description ?? null,
     JSON.stringify(model), JSON.stringify(layout),
     countModules, countScreens, countTables, countFlows]
  )
  await touchProject(projectId)
  return findById(id)
}

export async function remove(id) {
  const [[row]] = await pool.query('SELECT project_id FROM diagrams WHERE id = ?', [id])
  await pool.query('DELETE FROM diagrams WHERE id = ?', [id])
  if (row) await touchProject(row.project_id)
}
