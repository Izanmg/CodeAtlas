/**
 * settings.repository.js
 *
 * Acceso a base de datos para la tabla `user_settings` (preferencias por usuario).
 * Solo consultas SQL parametrizadas, sin lógica de negocio.
 */

import pool from '../../database/db.js'

/**
 * Busca la fila de preferencias de un usuario.
 *
 * @param {string} userId - Id del usuario
 * @returns {Promise<object|null>} Fila de ajustes o null si el usuario aún no tiene
 */
export async function findByUser(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM user_settings WHERE user_id = ?',
    [userId]
  )
  return rows[0] ?? null
}

/**
 * Inserta o actualiza las preferencias del usuario en una sola consulta
 * (INSERT ... ON DUPLICATE KEY UPDATE). Así no hay que comprobar antes si la
 * fila existe: si ya hay preferencias se actualizan, y si no, se crean.
 *
 * @param {string} userId - Id del usuario
 * @param {object} datos
 * @param {string} datos.theme - Tema seleccionado ('light' | 'dark')
 * @returns {Promise<object>} La fila de ajustes resultante
 */
export async function upsert(userId, { theme }) {
  await pool.query(
    `INSERT INTO user_settings (user_id, theme) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE theme = VALUES(theme)`,
    [userId, theme]
  )
  return findByUser(userId)
}
