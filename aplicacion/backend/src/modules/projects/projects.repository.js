import { randomUUID } from 'crypto'
import pool from '../../database/db.js'

const BASE_SELECT = `
  SELECT p.id, p.user_id, p.name, p.description, p.created_at, p.last_update,
         COUNT(d.id) AS diagram_count
  FROM projects p
  LEFT JOIN diagrams d ON d.project_id = p.id
`

export async function findAllByUser(userId) {
  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE p.user_id = ? GROUP BY p.id ORDER BY p.created_at DESC`,
    [userId]
  )
  return rows
}

export async function findById(id) {
  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE p.id = ? GROUP BY p.id`,
    [id]
  )
  return rows[0] ?? null
}

export async function create({ userId, name, description }) {
  const id = randomUUID()
  await pool.query(
    'INSERT INTO projects (id, user_id, name, description, last_update) VALUES (?, ?, ?, ?, NOW())',
    [id, userId, name, description ?? null]
  )
  return findById(id)
}

export async function update(id, { name, description }) {
  await pool.query(
    `UPDATE projects
     SET name = COALESCE(?, name),
         description = COALESCE(?, description),
         last_update = NOW()
     WHERE id = ?`,
    [name ?? null, description ?? null, id]
  )
  return findById(id)
}

export async function remove(id) {
  await pool.query('DELETE FROM projects WHERE id = ?', [id])
}
