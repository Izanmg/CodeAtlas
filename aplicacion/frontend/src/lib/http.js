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
    throw new Error(data.error || `Error ${res.status}`)
  }

  if (res.status === 204) return null
  return res.json()
}
