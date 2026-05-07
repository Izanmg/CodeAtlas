import { randomUUID } from 'crypto'
import pool from '../../database/db.js'

export async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  )
  return rows[0] ?? null
}

export async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, email, name, created_at FROM users WHERE id = ?',
    [id]
  )
  return rows[0] ?? null
}

export async function createUser({ email, name, passwordHash }) {
  const id = randomUUID()
  await pool.query(
    'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
    [id, email, name, passwordHash]
  )
  return findById(id)
}

export async function updateUser(id, { name, email }) {
  await pool.query(
    'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?',
    [name ?? null, email ?? null, id]
  )
  return findById(id)
}

export async function updatePassword(id, passwordHash) {
  await pool.query(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [passwordHash, id]
  )
}
