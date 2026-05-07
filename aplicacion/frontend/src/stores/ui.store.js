/**
 * ui.store.js
 *
 * Estado global de UI compartido entre todos los módulos.
 * De momento solo gestiona el tema (claro/oscuro). Persiste en localStorage
 * y aplica `data-theme="dark"` al <html> para que tokens.css cambie de modo.
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'codeatlas:theme'

export const useUiStore = defineStore('ui', () => {
  // Lee preferencia guardada o usa el modo claro por defecto.
  const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  const theme = ref(stored === 'dark' ? 'dark' : 'light')

  applyTheme(theme.value)

  // Persiste y aplica cada cambio.
  watch(theme, (value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, value)
      applyTheme(value)
    }
  })

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setTheme(value) {
    theme.value = value
  }

  return { theme, toggleTheme, setTheme }
})

function applyTheme(value) {
  if (typeof document === 'undefined') return
  if (value === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
  else document.documentElement.removeAttribute('data-theme')
}
