import { http } from '@/lib/http'

const STORAGE_KEY = 'codeatlas:settings'

export function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveLocal(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function clearLocal() {
  localStorage.removeItem(STORAGE_KEY)
}

export async function fetchSettings() {
  return http('/settings')
}

export async function patchSettings(patch) {
  return http('/settings', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}
