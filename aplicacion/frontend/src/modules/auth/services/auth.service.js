/**
 * auth.service.js (frontend)
 *
 * Capa de acceso a la API de autenticación desde el frontend. Habla con el
 * backend a través del cliente http y, además, gestiona la sesión local: guarda
 * y lee { user, token } de localStorage para mantener al usuario logueado entre
 * recargas.
 *
 * Responsabilidad: llamadas a la API de auth + persistencia local de la sesión.
 * No gestiona estado reactivo de Vue; eso es el store (auth.store.js).
 */

import { http } from '@/lib/http'

// Clave de localStorage donde se guarda la sesión { user, token }.
const STORAGE_KEY = 'codeatlas:auth'

// ---- sesión local ----

/**
 * Guarda la sesión en localStorage para que sobreviva a recargas de página.
 *
 * @param {{user: object, token: string}} session - Sesión a persistir
 */
function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

/**
 * Lee la sesión guardada. Devuelve null si no hay sesión o está corrupta.
 *
 * @returns {{user: object, token: string}|null} Sesión guardada o null
 */
function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Calcula las iniciales del usuario a partir de su nombre (máximo dos letras)
 * para mostrarlas en el avatar. Devuelve '?' si el nombre está vacío.
 *
 * @param {string} name - Nombre completo del usuario
 * @returns {string} Hasta dos iniciales en mayúscula
 */
function computeInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?'
}

/**
 * Añade el campo calculado `initials` al objeto de usuario que devuelve la API.
 *
 * @param {object} user - Usuario tal cual lo devuelve el backend
 * @returns {object} El mismo usuario con `initials` añadido
 */
function normalizeUser(user) {
  return { ...user, initials: computeInitials(user.name) }
}

// ---- API ----

/**
 * Inicia sesión contra la API y guarda la sesión localmente.
 *
 * @param {{email: string, password: string}} credenciales
 * @returns {Promise<{user: object, token: string}>} Usuario normalizado y token
 */
export async function login({ email, password }) {
  const { user, token } = await http('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  const normalized = normalizeUser(user)
  saveSession({ user: normalized, token })
  return { user: normalized, token }
}

/**
 * Registra un usuario nuevo y deja la sesión iniciada (la guarda localmente).
 *
 * @param {{name: string, email: string, password: string}} datos
 * @returns {Promise<{user: object, token: string}>} Usuario normalizado y token
 */
export async function register({ name, email, password }) {
  const { user, token } = await http('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
  const normalized = normalizeUser(user)
  saveSession({ user: normalized, token })
  return { user: normalized, token }
}

/**
 * Devuelve el usuario de la sesión guardada (sin llamar a la API).
 *
 * @returns {object|null} Usuario actual o null si no hay sesión
 */
export function getCurrentUser() {
  const session = readSession()
  return session?.user ?? null
}

/**
 * Cierra la sesión borrando todo el almacenamiento local.
 */
export function logout() {
  localStorage.clear()
}

/**
 * Actualiza el perfil del usuario en la API y refresca la sesión local con los
 * datos nuevos.
 *
 * @param {object} patch - Campos a actualizar (name, email)
 * @returns {Promise<object>} Usuario actualizado y normalizado
 */
export async function updateUser(patch) {
  const user = await http('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  const session = readSession()
  const normalized = normalizeUser(user)
  if (session) saveSession({ ...session, user: normalized })
  return normalized
}

/**
 * Cambia la contraseña del usuario a través de la API.
 *
 * @param {{currentPassword: string, newPassword: string, confirmPassword: string}} payload
 * @returns {Promise<any>} Respuesta de la API
 */
export async function changePassword(payload) {
  return http('/auth/me/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
