/**
 * settings.service.js
 *
 * Lógica de negocio de las preferencias del usuario. Aplica los valores por
 * defecto cuando el usuario todavía no tiene ajustes guardados y combina los
 * cambios parciales con los existentes.
 *
 * Responsabilidad: reglas y valores por defecto. La persistencia está en el
 * repositorio.
 */

import * as repo from './settings.repository.js'

// Preferencias por defecto para un usuario que aún no ha guardado ninguna.
const DEFAULTS = { theme: 'light' }

/**
 * Devuelve las preferencias del usuario. Si no tiene fila en BD, devuelve una
 * copia de los valores por defecto.
 *
 * @param {string} userId - Id del usuario
 * @returns {Promise<{theme: string}>} Preferencias del usuario
 */
export async function getSettings(userId) {
  const row = await repo.findByUser(userId)
  return row ? { theme: row.theme } : { ...DEFAULTS }
}

/**
 * Actualiza las preferencias del usuario. Hace merge: parte de lo que ya tiene
 * y solo pisa los campos que vienen en el patch, así un cambio parcial no borra
 * el resto de preferencias.
 *
 * @param {string} userId - Id del usuario
 * @param {object} patch - Campos a cambiar (p. ej. { theme: 'dark' })
 * @returns {Promise<{theme: string}>} Las preferencias ya combinadas
 */
export async function updateSettings(userId, patch) {
  const current = await getSettings(userId)
  const merged = { ...current }
  if (patch.theme !== undefined) merged.theme = patch.theme
  await repo.upsert(userId, merged)
  return merged
}
