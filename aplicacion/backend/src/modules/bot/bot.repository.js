/**
 * bot.repository.js
 *
 * Persiste el estado del bot por sesión en MySQL. Un usuario puede tener
 * múltiples sesiones (conversaciones independientes), cada una con su propio
 * historial y conjunto de archivos generados.
 *
 * Tablas:
 *   - bot_sessions(id PK, user_id, title, history_json, created_at, updated_at)
 *     Una fila por conversación.
 *   - bot_files(session_id, path, content, updated_at, PK(session_id, path))
 *     Una fila por archivo dentro de una sesión.
 *
 * FK con ON DELETE CASCADE: al borrar una sesión se borran sus archivos;
 * al borrar el usuario se borra todo lo suyo.
 */

import { randomUUID } from 'crypto'
import pool from '../../database/db.js'

/**
 * Lista las sesiones de un usuario ordenadas por updated_at descendente.
 * Incluye el número de archivos generados en cada una.
 */
export async function listSessions(userId) {
  const [rows] = await pool.query(
    `SELECT s.id, s.title, s.created_at, s.updated_at,
            COUNT(f.path) AS file_count
       FROM bot_sessions s
       LEFT JOIN bot_files f ON f.session_id = s.id
      WHERE s.user_id = ?
      GROUP BY s.id
      ORDER BY s.updated_at DESC`,
    [userId]
  )
  return rows
}

/**
 * Crea una nueva sesión vacía y la devuelve.
 */
export async function createSession(userId, title = 'Nueva conversación') {
  const id = randomUUID()
  await pool.query(
    'INSERT INTO bot_sessions (id, user_id, title, history_json) VALUES (?, ?, ?, ?)',
    [id, userId, title, '[]']
  )
  return findSession(id, userId)
}

/**
 * Recupera una sesión por id verificando que pertenece al usuario.
 * Devuelve null si no existe o no es del usuario.
 */
export async function findSession(sessionId, userId) {
  const [rows] = await pool.query(
    'SELECT id, user_id, title, history_json, created_at, updated_at FROM bot_sessions WHERE id = ? AND user_id = ?',
    [sessionId, userId]
  )
  if (!rows[0]) return null
  return {
    id: rows[0].id,
    userId: rows[0].user_id,
    title: rows[0].title,
    createdAt: rows[0].created_at,
    updatedAt: rows[0].updated_at,
    history: JSON.parse(rows[0].history_json),
  }
}

/**
 * Devuelve el estado completo de una sesión: historial + archivos.
 * Lanza si la sesión no pertenece al usuario.
 */
export async function getSessionState(sessionId, userId) {
  const session = await findSession(sessionId, userId)
  if (!session) throw new Error('[bot] Sesión no encontrada')

  const [fileRows] = await pool.query(
    'SELECT path, content FROM bot_files WHERE session_id = ? ORDER BY path',
    [sessionId]
  )
  return { ...session, files: fileRows }
}

/**
 * Renombra una sesión del usuario. Devuelve true si se actualizó alguna fila.
 */
export async function renameSession(sessionId, userId, title) {
  const [result] = await pool.query(
    'UPDATE bot_sessions SET title = ? WHERE id = ? AND user_id = ?',
    [title, sessionId, userId]
  )
  return result.affectedRows > 0
}

/**
 * Borra una sesión del usuario (sus archivos caen por ON DELETE CASCADE).
 * Devuelve true si se borró alguna fila.
 */
export async function deleteSession(sessionId, userId) {
  // El ON DELETE CASCADE en bot_files se encarga de los archivos.
  const [result] = await pool.query(
    'DELETE FROM bot_sessions WHERE id = ? AND user_id = ?',
    [sessionId, userId]
  )
  return result.affectedRows > 0
}

/**
 * Añade un mensaje al historial de la sesión y toca updated_at.
 */
export async function appendMessage(sessionId, userId, message) {
  const session = await findSession(sessionId, userId)
  if (!session) throw new Error('[bot] Sesión no encontrada')

  const history = session.history
  history.push(message)

  await pool.query(
    'UPDATE bot_sessions SET history_json = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
    [JSON.stringify(history), sessionId, userId]
  )
}

/**
 * Inserta o actualiza archivos en bloque dentro de una sesión.
 */
export async function upsertFiles(sessionId, files) {
  if (!files.length) return
  const values = files.map(() => '(?, ?, ?)').join(', ')
  const params = files.flatMap(f => [sessionId, f.path, f.content])
  await pool.query(
    `INSERT INTO bot_files (session_id, path, content)
     VALUES ${values}
     ON DUPLICATE KEY UPDATE content = VALUES(content)`,
    params
  )
}

/**
 * Borra un archivo concreto de una sesión, comprobando antes que la sesión es
 * del usuario. Devuelve true si se borró alguna fila.
 */
export async function deleteFile(sessionId, userId, filePath) {
  // Verificar pertenencia antes de borrar para no permitir borrados cruzados.
  const session = await findSession(sessionId, userId)
  if (!session) return false
  const [result] = await pool.query(
    'DELETE FROM bot_files WHERE session_id = ? AND path = ?',
    [sessionId, filePath]
  )
  return result.affectedRows > 0
}

/**
 * Devuelve los archivos generados de una sesión, comprobando que es del usuario.
 */
export async function getFiles(sessionId, userId) {
  const session = await findSession(sessionId, userId)
  if (!session) throw new Error('[bot] Sesión no encontrada')
  const [rows] = await pool.query(
    'SELECT path, content FROM bot_files WHERE session_id = ? ORDER BY path',
    [sessionId]
  )
  return rows
}
