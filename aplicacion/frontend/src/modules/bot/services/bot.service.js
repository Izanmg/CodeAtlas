/**
 * bot.service.js (frontend)
 *
 * Capa de acceso a la API del chatbot que guía al usuario para generar la
 * estructura de documentación de su app. Cubre las sesiones de chat, el envío
 * de mensajes, los archivos generados y la descarga del zip final.
 *
 * Además expone la lista de modelos de IA disponibles (MODELS) y utilidades
 * relacionadas, para que la vista no tenga que conocer los ids de los modelos.
 */

import { http } from '@/lib/http'

/**
 * Lista las sesiones de chat del usuario.
 *
 * @returns {Promise<object[]>} Sesiones del usuario
 */
export async function listSessions() {
  const data = await http('/bot/sessions')
  return data.sessions
}

/**
 * Crea una sesión de chat nueva.
 *
 * @returns {Promise<object>} La sesión creada
 */
export async function createSession() {
  return http('/bot/sessions', { method: 'POST' })
}

/**
 * Recupera una sesión concreta con su historial de mensajes.
 *
 * @param {string} sessionId - Id de la sesión
 * @returns {Promise<object>} La sesión con sus mensajes
 */
export async function fetchSession(sessionId) {
  return http(`/bot/sessions/${sessionId}`)
}

/**
 * Renombra una sesión de chat.
 *
 * @param {string} sessionId - Id de la sesión
 * @param {string} title - Nuevo título
 * @returns {Promise<object>} La sesión actualizada
 */
export async function renameSession(sessionId, title) {
  return http(`/bot/sessions/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  })
}

/**
 * Borra una sesión de chat.
 *
 * @param {string} sessionId - Id de la sesión
 * @returns {Promise<any>} Respuesta de la API
 */
export async function deleteSession(sessionId) {
  return http(`/bot/sessions/${sessionId}`, { method: 'DELETE' })
}

/**
 * Envía un mensaje del usuario al bot dentro de una sesión y devuelve la
 * respuesta del modelo.
 *
 * @param {string} sessionId - Id de la sesión
 * @param {string} message - Texto del usuario
 * @param {string} model - Id del modelo de IA a usar (ver MODELS)
 * @returns {Promise<object>} Respuesta del bot
 */
export async function sendMessage(sessionId, message, model) {
  return http(`/bot/sessions/${sessionId}/message`, {
    method: 'POST',
    body: JSON.stringify({ message, model }),
  })
}

// Modelos de IA disponibles para el chat. El `hint` describe el equilibrio
// velocidad/cuota de cada uno para que el usuario elija con criterio.
export const MODELS = [
  {
    id: 'gemini-2.5-flash-lite',
    label: 'Flash-lite',
    hint: 'Rápido · ~1000 req/día',
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Flash',
    hint: 'Más capaz · ~20 req/día',
  },
]
// Modelo elegido por defecto: el más rápido y con más cuota.
export const DEFAULT_MODEL = 'gemini-2.5-flash-lite'

/**
 * Traduce el id de un modelo a su etiqueta legible. Si no se reconoce el id,
 * devuelve el propio id como respaldo.
 *
 * @param {string} id - Id del modelo
 * @returns {string} Etiqueta del modelo
 */
export function modelLabel(id) {
  return MODELS.find(m => m.id === id)?.label || id
}

/**
 * Lista los archivos generados en una sesión (la estructura de .md propuesta).
 *
 * @param {string} sessionId - Id de la sesión
 * @returns {Promise<object[]>} Archivos de la sesión
 */
export async function fetchFiles(sessionId) {
  const data = await http(`/bot/sessions/${sessionId}/files`)
  return data.files
}

/**
 * Borra un archivo generado de la sesión.
 *
 * @param {string} sessionId - Id de la sesión
 * @param {string} path - Ruta del archivo a borrar
 * @returns {Promise<any>} Respuesta de la API
 */
export async function deleteFile(sessionId, path) {
  return http(`/bot/sessions/${sessionId}/files?path=${encodeURIComponent(path)}`, {
    method: 'DELETE',
  })
}

// Clave de localStorage de la sesión de auth (para leer el token a mano en la
// descarga, que no pasa por el cliente http).
const STORAGE_KEY = 'codeatlas:auth'

/**
 * Lee el token de sesión de localStorage.
 *
 * @returns {string|null} Token JWT o null
 */
function getToken() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw).token : null
  } catch {
    return null
  }
}

/**
 * Descarga el zip de la sesión disparando una descarga binaria en el navegador.
 *
 * No usa el cliente http porque la respuesta es un binario (blob), no JSON:
 * se descarga manualmente, se crea un enlace temporal y se simula el click para
 * que el navegador guarde el archivo.
 *
 * @param {string} sessionId - Id de la sesión cuyo zip se descarga
 * @returns {Promise<void>}
 * @throws {Error} Si la descarga falla
 */
export async function downloadZip(sessionId) {
  const token = getToken()
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/bot/sessions/${sessionId}/zip`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  )
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Error ${res.status}`)
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'app-doc.zip'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url) // liberamos la URL temporal para no dejar memoria colgando
}
