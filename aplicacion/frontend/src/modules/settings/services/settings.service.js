/**
 * settings.service.js (frontend)
 *
 * Capa de acceso a la API de preferencias del usuario y, además, caché local de
 * esas preferencias en localStorage. La copia local permite aplicar el tema
 * (claro/oscuro) al instante en el arranque, sin esperar a la respuesta del
 * servidor.
 */

import { http } from '@/lib/http'

// Clave de localStorage donde se cachean las preferencias.
const STORAGE_KEY = 'codeatlas:settings'

/**
 * Lee las preferencias cacheadas en local. Devuelve null si no hay nada o el
 * contenido está corrupto.
 *
 * @returns {object|null} Preferencias cacheadas o null
 */
export function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Guarda las preferencias en la caché local.
 *
 * @param {object} settings - Preferencias a cachear
 */
export function saveLocal(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

/**
 * Borra la caché local de preferencias (p. ej. al cerrar sesión).
 */
export function clearLocal() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Trae las preferencias del usuario desde la API.
 *
 * @returns {Promise<object>} Preferencias del usuario
 */
export async function fetchSettings() {
  return http('/settings')
}

/**
 * Actualiza las preferencias del usuario en la API.
 *
 * @param {object} patch - Campos a cambiar (p. ej. { theme: 'dark' })
 * @returns {Promise<object>} Preferencias ya actualizadas
 */
export async function patchSettings(patch) {
  return http('/settings', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}
