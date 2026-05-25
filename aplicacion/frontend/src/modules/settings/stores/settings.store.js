/**
 * settings.store.js
 *
 * Store de Pinia que gestiona las preferencias del usuario (por ahora el tema
 * claro/oscuro) y las aplica al documento. Mantiene sincronizadas tres copias:
 * el estado reactivo, la caché en localStorage y la API.
 *
 * Responsabilidad: estado reactivo del tema + aplicarlo al DOM. La persistencia
 * (local y remota) está en settings.service.js.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as service from '../services/settings.service'

// Preferencias por defecto si el usuario aún no ha elegido nada.
const DEFAULTS = { theme: 'light' }

/**
 * Aplica el tema al documento poniendo (o quitando) el atributo data-theme en
 * <html>, sobre el que cuelgan las variables CSS de cada tema.
 *
 * @param {string} value - Tema a aplicar ('light' | 'dark')
 */
function applyTheme(value) {
  // Guarda por si el store se evalúa en un entorno sin DOM (p. ej. SSR/tests).
  if (typeof document === 'undefined') return
  if (value === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
  else document.documentElement.removeAttribute('data-theme')
}

export const useSettingsStore = defineStore('settings', () => {
  // Arrancamos con la copia local (o los valores por defecto) y aplicamos el
  // tema al instante para evitar el "parpadeo" antes de la respuesta del servidor.
  const local = service.readLocal() ?? DEFAULTS
  const theme = ref(local.theme)
  applyTheme(theme.value)

  /**
   * Carga las preferencias reales desde la API y actualiza estado, DOM y caché.
   * Se llama al iniciar sesión o al arrancar con sesión activa.
   *
   * @returns {Promise<void>}
   */
  async function load() {
    const s = await service.fetchSettings()
    theme.value = s.theme
    applyTheme(s.theme)
    service.saveLocal(s)
  }

  /**
   * Cambia el tema: lo aplica al instante (estado + DOM + caché) y lo persiste
   * en la API después, para que el cambio se sienta inmediato.
   *
   * @param {string} value - Nuevo tema ('light' | 'dark')
   * @returns {Promise<void>}
   */
  async function setTheme(value) {
    theme.value = value
    applyTheme(value)
    service.saveLocal({ theme: value })
    await service.patchSettings({ theme: value })
  }

  /**
   * Alterna entre tema claro y oscuro.
   */
  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  /**
   * Vuelve al tema por defecto y borra la caché local. Se usa al cerrar sesión.
   */
  function reset() {
    theme.value = DEFAULTS.theme
    applyTheme(DEFAULTS.theme)
    service.clearLocal()
  }

  return { theme, load, setTheme, toggleTheme, reset }
})
