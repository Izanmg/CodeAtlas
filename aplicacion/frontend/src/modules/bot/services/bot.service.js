import { http } from '@/lib/http'

export async function listSessions() {
  const data = await http('/bot/sessions')
  return data.sessions
}

export async function createSession() {
  return http('/bot/sessions', { method: 'POST' })
}

export async function fetchSession(sessionId) {
  return http(`/bot/sessions/${sessionId}`)
}

export async function renameSession(sessionId, title) {
  return http(`/bot/sessions/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  })
}

export async function deleteSession(sessionId) {
  return http(`/bot/sessions/${sessionId}`, { method: 'DELETE' })
}

export async function sendMessage(sessionId, message, model) {
  return http(`/bot/sessions/${sessionId}/message`, {
    method: 'POST',
    body: JSON.stringify({ message, model }),
  })
}

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
export const DEFAULT_MODEL = 'gemini-2.5-flash-lite'

export function modelLabel(id) {
  return MODELS.find(m => m.id === id)?.label || id
}

export async function fetchFiles(sessionId) {
  const data = await http(`/bot/sessions/${sessionId}/files`)
  return data.files
}

export async function deleteFile(sessionId, path) {
  return http(`/bot/sessions/${sessionId}/files?path=${encodeURIComponent(path)}`, {
    method: 'DELETE',
  })
}

const STORAGE_KEY = 'codeatlas:auth'
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
  URL.revokeObjectURL(url)
}
