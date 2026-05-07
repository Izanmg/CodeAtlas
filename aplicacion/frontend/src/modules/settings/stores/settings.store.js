import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as service from '../services/settings.service'

const DEFAULTS = { theme: 'light' }

function applyTheme(value) {
  if (typeof document === 'undefined') return
  if (value === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
  else document.documentElement.removeAttribute('data-theme')
}

export const useSettingsStore = defineStore('settings', () => {
  const local = service.readLocal() ?? DEFAULTS
  const theme = ref(local.theme)
  applyTheme(theme.value)

  async function load() {
    const s = await service.fetchSettings()
    theme.value = s.theme
    applyTheme(s.theme)
    service.saveLocal(s)
  }

  async function setTheme(value) {
    theme.value = value
    applyTheme(value)
    service.saveLocal({ theme: value })
    await service.patchSettings({ theme: value })
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function reset() {
    theme.value = DEFAULTS.theme
    applyTheme(DEFAULTS.theme)
    service.clearLocal()
  }

  return { theme, load, setTheme, toggleTheme, reset }
})
