/**
 * auth-mock.js
 *
 * Lógica temporal de autenticación. Sustituye por completo a la llamada
 * real al backend mientras la app está desconectada del servidor.
 *
 * Acepta cualquier email y contraseña no vacíos como credenciales válidas.
 * Devuelve siempre el mismo usuario semilla — el login no diferencia entre
 * usuarios reales, solo simula el flujo de UI.
 *
 * Cuando exista el backend real, todo el contenido de esta carpeta
 * `logica-temporal/` se reemplazará por un `auth.service.js` que llame al
 * endpoint correspondiente. Las firmas (login/register/getCurrentUser/logout)
 * deben mantenerse iguales para no tener que tocar el store ni las vistas.
 */

const SEED_USER = {
  id: 'u_001',
  name: 'Marcos Rivera',
  email: 'marcos@codeatlas.dev',
  initials: 'MR',
  joinedAt: '2026-02-14',
}

const STORAGE_KEY = 'codeatlas:auth'

/**
 * Simula un login. Si el email y la contraseña no están vacíos, "loguea"
 * al usuario semilla.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function login({ email, password }) {
  await fakeDelay(500)
  if (!email || !password) {
    throw new Error('Email y contraseña son obligatorios')
  }
  const session = { user: SEED_USER, token: 'mock-token-' + Date.now() }
  saveSession(session)
  return session
}

/**
 * Simula un registro. Crea un usuario derivado del nombre y email pasados
 * (las iniciales se calculan a partir del nombre).
 *
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function register({ name, email, password }) {
  await fakeDelay(600)
  if (!name || !email || !password) {
    throw new Error('Faltan campos obligatorios')
  }
  const user = {
    ...SEED_USER,
    name,
    email,
    initials: computeInitials(name),
  }
  const session = { user, token: 'mock-token-' + Date.now() }
  saveSession(session)
  return session
}

/**
 * Devuelve el usuario actual si existe sesión guardada, o null en caso
 * contrario.
 *
 * @returns {object|null}
 */
export function getCurrentUser() {
  const session = readSession()
  return session?.user ?? null
}

/**
 * Cierra la sesión local (borra el token y el usuario guardados).
 */
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

/**
 * Actualiza los datos de perfil del usuario activo y persiste en
 * localStorage. Se usa desde la pantalla de Configuración.
 *
 * @param {{ name?: string, email?: string }} patch
 */
export function updateUser(patch) {
  const session = readSession()
  if (!session) return null
  const updated = { ...session.user, ...patch }
  if (patch.name) updated.initials = computeInitials(patch.name)
  saveSession({ ...session, user: updated })
  return updated
}

// ---- helpers internos ----

function fakeDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function computeInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?'
}

function saveSession(session) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

function readSession() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}
