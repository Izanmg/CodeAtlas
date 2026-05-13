const BASE = import.meta.env.VITE_API_URL

const STORAGE_KEY = 'codeatlas:auth'

function getToken() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw).token : null
  } catch {
    return null
  }
}

export async function http(path, options = {}) {
  const token = getToken()

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
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
