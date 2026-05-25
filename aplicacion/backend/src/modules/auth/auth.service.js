/**
 * auth.service.js
 *
 * Lógica de negocio de autenticación y gestión de la cuenta del usuario.
 * Aquí vive todo lo relacionado con contraseñas (hash y comprobación con bcrypt)
 * y con los tokens de sesión (firma y verificación con JWT).
 *
 * Responsabilidad: reglas de negocio del login/registro/perfil.
 * NO toca la base de datos directamente — eso lo hace auth.repository.js.
 * NO sabe nada de Express (req/res) — eso es auth.controller.js.
 */

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as repo from './auth.repository.js'

// Secreto para firmar los JWT. En producción se inyecta por variable de entorno;
// el valor por defecto solo sirve para desarrollo local.
const JWT_SECRET = process.env.JWT_SECRET || 'codeatlas_dev_secret'
// Duración del token: una semana antes de tener que volver a iniciar sesión.
const JWT_EXPIRES = '7d'
// Coste del hash de bcrypt (número de rondas de sal). 10 es un equilibrio razonable
// entre seguridad y tiempo de cómputo.
const SALT_ROUNDS = 10

/**
 * Registra un usuario nuevo: comprueba que el email esté libre, hashea la
 * contraseña y crea la fila en BD. Devuelve también un token para dejar la
 * sesión iniciada justo después del registro.
 *
 * @param {object} datos
 * @param {string} datos.email - Email del nuevo usuario (debe ser único)
 * @param {string} datos.name - Nombre visible del usuario
 * @param {string} datos.password - Contraseña en claro (se hashea antes de guardar)
 * @returns {Promise<{user: object, token: string}>} Usuario creado y su token JWT
 * @throws {Error} Si el email ya está registrado
 */
export async function register({ email, name, password }) {
  const existing = await repo.findByEmail(email)
  if (existing) throw new Error('El email ya está registrado')

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await repo.createUser({ email, name, passwordHash })
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
  return { user, token }
}

/**
 * Valida las credenciales de un usuario y, si son correctas, devuelve sus
 * datos públicos junto a un token de sesión.
 *
 * @param {object} datos
 * @param {string} datos.email - Email con el que se intenta acceder
 * @param {string} datos.password - Contraseña en claro a comprobar
 * @returns {Promise<{user: object, token: string}>} Datos del usuario y token JWT
 * @throws {Error} Si el email no existe o la contraseña no coincide
 */
export async function login({ email, password }) {
  const row = await repo.findByEmail(email)
  // Mismo mensaje tanto si el email no existe como si la contraseña falla,
  // para no revelar qué emails están registrados.
  if (!row) throw new Error('Credenciales incorrectas')

  const valid = await bcrypt.compare(password, row.password_hash)
  if (!valid) throw new Error('Credenciales incorrectas')

  const user = { id: row.id, email: row.email, name: row.name, createdAt: row.created_at }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
  return { user, token }
}

/**
 * Recupera los datos públicos del usuario autenticado.
 *
 * @param {string} userId - Id del usuario (extraído del token por el middleware)
 * @returns {Promise<object>} Datos del usuario
 * @throws {Error} Si el usuario no existe
 */
export async function getMe(userId) {
  const user = await repo.findById(userId)
  if (!user) throw new Error('Usuario no encontrado')
  return user
}

/**
 * Actualiza el perfil del usuario (nombre y/o email).
 *
 * @param {string} userId - Id del usuario a modificar
 * @param {object} patch - Campos a actualizar (name, email)
 * @returns {Promise<object>} Usuario ya actualizado
 */
export async function updateUser(userId, patch) {
  return repo.updateUser(userId, patch)
}

/**
 * Cambia la contraseña del usuario. Antes de aplicar el cambio comprueba que
 * la contraseña actual sea correcta y que la nueva cumpla las reglas mínimas.
 *
 * @param {string} userId - Id del usuario
 * @param {object} datos
 * @param {string} datos.currentPassword - Contraseña actual (para verificar identidad)
 * @param {string} datos.newPassword - Contraseña nueva
 * @param {string} datos.confirmPassword - Repetición de la contraseña nueva
 * @returns {Promise<void>}
 * @throws {Error} Si las contraseñas nuevas no coinciden, son demasiado cortas
 *                 o la contraseña actual es incorrecta
 */
export async function changePassword(userId, { currentPassword, newPassword, confirmPassword }) {
  if (newPassword !== confirmPassword)
    throw new Error('Las contraseñas nuevas no coinciden')

  if (newPassword.length < 8)
    throw new Error('La nueva contraseña debe tener al menos 8 caracteres')

  // findById no devuelve el hash, así que volvemos a buscar por email para
  // obtener la fila completa y poder comparar la contraseña actual.
  const row = await repo.findByEmail(
    (await repo.findById(userId)).email
  )
  const valid = await bcrypt.compare(currentPassword, row.password_hash)
  if (!valid) throw new Error('La contraseña actual es incorrecta')

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
  await repo.updatePassword(userId, passwordHash)
}

/**
 * Verifica y decodifica un token JWT. Lo usa el middleware de autenticación
 * para sacar el userId de cada petición protegida.
 *
 * @param {string} token - Token JWT (sin el prefijo "Bearer ")
 * @returns {object} Payload decodificado del token (incluye userId)
 * @throws {Error} Si el token es inválido o ha expirado
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}
