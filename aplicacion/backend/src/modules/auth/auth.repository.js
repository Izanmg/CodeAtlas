/**
 * auth.repository.js
 *
 * Acceso a base de datos para la tabla `users`. Contiene únicamente consultas
 * SQL parametrizadas; no hay lógica de negocio aquí.
 *
 * Responsabilidad: leer y escribir filas de usuarios.
 * Todas las consultas usan placeholders (?) para evitar inyección SQL.
 */

import { randomUUID } from 'crypto'
import pool from '../../database/db.js'

/**
 * Busca un usuario por su email. Devuelve la fila completa (incluye el
 * password_hash), por lo que se usa internamente para login y cambio de clave.
 *
 * @param {string} email - Email a buscar
 * @returns {Promise<object|null>} Fila del usuario o null si no existe
 */
export async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  )
  return rows[0] ?? null
}

/**
 * Busca un usuario por su id. Solo devuelve campos públicos (sin el hash de
 * la contraseña), pensado para responder al cliente.
 *
 * @param {string} id - Id del usuario
 * @returns {Promise<object|null>} Datos públicos del usuario o null si no existe
 */
export async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, email, name, created_at FROM users WHERE id = ?',
    [id]
  )
  return rows[0] ?? null
}

/**
 * Inserta un usuario nuevo. El id se genera aquí como UUID para no depender de
 * autoincrementos de la BD.
 *
 * @param {object} datos
 * @param {string} datos.email - Email del usuario
 * @param {string} datos.name - Nombre del usuario
 * @param {string} datos.passwordHash - Contraseña ya hasheada (nunca en claro)
 * @returns {Promise<object>} El usuario recién creado (datos públicos)
 */
export async function createUser({ email, name, passwordHash }) {
  const id = randomUUID()
  await pool.query(
    'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
    [id, email, name, passwordHash]
  )
  return findById(id)
}

/**
 * Actualiza nombre y/o email de un usuario. Usa COALESCE para que los campos
 * que llegan como null se queden con su valor anterior (actualización parcial).
 *
 * @param {string} id - Id del usuario a actualizar
 * @param {object} datos
 * @param {string} [datos.name] - Nuevo nombre (opcional)
 * @param {string} [datos.email] - Nuevo email (opcional)
 * @returns {Promise<object>} El usuario ya actualizado
 */
export async function updateUser(id, { name, email }) {
  await pool.query(
    'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?',
    [name ?? null, email ?? null, id]
  )
  return findById(id)
}

/**
 * Cambia el hash de la contraseña de un usuario.
 *
 * @param {string} id - Id del usuario
 * @param {string} passwordHash - Nueva contraseña ya hasheada
 * @returns {Promise<void>}
 */
export async function updatePassword(id, passwordHash) {
  await pool.query(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [passwordHash, id]
  )
}
