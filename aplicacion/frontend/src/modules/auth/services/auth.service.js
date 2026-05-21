import { http } from '@/lib/http'

const STORAGE_KEY = 'codeatlas:auth'

// ---- sesión local ----

function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function computeInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?'
}

function normalizeUser(user) {
  return { ...user, initials: computeInitials(user.name) }
}

// ---- API ----

export async function login({ email, password }) {
  const { user, token } = await http('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  const normalized = normalizeUser(user)
  saveSession({ user: normalized, token })
  return { user: normalized, token }
}

export async function register({ name, email, password }) {
  const { user, token } = await http('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
  const normalized = normalizeUser(user)
  saveSession({ user: normalized, token })
  return { user: normalized, token }
}

export function getCurrentUser() {
  const session = readSession()
  return session?.user ?? null
}

export function logout() {
  localStorage.clear()
}

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

export async function changePassword(payload) {
  return http('/auth/me/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
