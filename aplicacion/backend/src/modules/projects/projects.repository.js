import { randomUUID } from 'crypto'
import pool from '../../database/db.js'

/**
 * Todas las consultas filtran por `user_id`. Las funciones de lectura aceptan
 * `userId` como segundo parámetro y devuelven null si el proyecto no pertenece
 * al usuario. Las de escritura aceptan `userId` y limitan el WHERE igualmente.
 */

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

export async function findById(id, userId) {
  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE p.id = ? AND p.user_id = ? GROUP BY p.id`,
    [id, userId]
  )
  return rows[0] ?? null
}

export async function create({ userId, name, description }) {
  const id = randomUUID()
  await pool.query(
    'INSERT INTO projects (id, user_id, name, description, last_update) VALUES (?, ?, ?, ?, NOW())',
    [id, userId, name, description ?? null]
  )
  return findById(id, userId)
}

export async function update(id, userId, { name, description }) {
  const [result] = await pool.query(
    `UPDATE projects
     SET name = COALESCE(?, name),
         description = ?,
         last_update = NOW()
     WHERE id = ? AND user_id = ?`,
    [name ?? null, description ?? null, id, userId]
  )
  if (result.affectedRows === 0) return null
  return findById(id, userId)
}

export async function remove(id, userId) {
  const [result] = await pool.query(
    'DELETE FROM projects WHERE id = ? AND user_id = ?',
    [id, userId]
  )
  return result.affectedRows > 0
}
