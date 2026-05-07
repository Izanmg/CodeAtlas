import * as repo from './settings.repository.js'

const DEFAULTS = { theme: 'light' }

export async function getSettings(userId) {
  const row = await repo.findByUser(userId)
  return row ? { theme: row.theme } : { ...DEFAULTS }
}

export async function updateSettings(userId, patch) {
  const current = await getSettings(userId)
  const merged = { ...current }
  if (patch.theme !== undefined) merged.theme = patch.theme
  await repo.upsert(userId, merged)
  return merged
}
