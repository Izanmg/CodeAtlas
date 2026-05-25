/**
 * http.js
 *
 * Cliente HTTP centralizado del frontend. Es un wrapper sobre fetch que todos
 * los services usan en lugar de llamar a fetch directamente. Se encarga de:
 *   - añadir la URL base de la API a cada ruta
 *   - poner la cabecera Content-Type cuando se envía JSON
 *   - adjuntar el token de sesión (Authorization: Bearer) si lo hay
 *   - convertir las respuestas de error en Error con status y cuerpo adjuntos
 *
 * Responsabilidad: solo el transporte. No sabe nada de los datos concretos de
 * cada módulo; eso lo manejan los *.service.js.
 */

// URL base de la API, inyectada en build por Vite (variable VITE_API_URL).
const BASE = import.meta.env.VITE_API_URL

// Clave de localStorage donde el módulo auth guarda { user, token }.
const STORAGE_KEY = 'codeatlas:auth'

/**
 * Lee el token de sesión de localStorage. Devuelve null si no hay sesión o si
 * el contenido guardado está corrupto.
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
 * Hace una petición a la API y devuelve el cuerpo ya parseado como JSON.
 *
 * @param {string} path - Ruta relativa a la API (p. ej. '/auth/login')
 * @param {object} [options] - Opciones de fetch (method, body, headers...)
 * @returns {Promise<any|null>} Cuerpo JSON de la respuesta, o null si es 204
 * @throws {Error} Si la respuesta no es 2xx. El Error lleva `.status` y `.data`
 *                 (cuerpo JSON completo) para que el caller pueda inspeccionarlos.
 */
export async function http(path, options = {}) {
  const token = getToken()

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      // Solo marcamos JSON cuando NO es FormData: en las subidas de archivos hay
      // que dejar que el navegador ponga el Content-Type con su boundary.
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    // Adjuntamos status y el cuerpo JSON completo al Error para que los
    // callers puedan distinguir códigos de error específicos sin parsear
    // el mensaje a mano. Por ejemplo, errores de cuota del bot devuelven
    // { code: 'QUOTA_EXCEEDED', model, suggestedModel } y el frontend los
    // renderiza con UI especial.
    const err = new Error(data.error || `Error ${res.status}`)
    err.status = res.status
    err.data = data
    throw err
  }

  if (res.status === 204) return null
  return res.json()
}
