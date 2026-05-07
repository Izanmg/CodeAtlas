import pool from '../../database/db.js'

export async function findByUser(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM user_settings WHERE user_id = ?',
    [userId]
  )
  return rows[0] ?? null
}

export async function upsert(userId, { theme }) {
  await pool.query(
    `INSERT INTO user_settings (user_id, theme) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE theme = VALUES(theme)`,
    [userId, theme]
  )
  return findByUser(userId)
}
