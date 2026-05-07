import pool from '../database/db.js'

export async function touchProject(projectId) {
  await pool.query(
    'UPDATE projects SET last_update = NOW() WHERE id = ?',
    [projectId]
  )
}
