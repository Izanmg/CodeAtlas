/**
 * auth.store.js
 *
 * Store de Pinia que mantiene el estado reactivo de la sesión del usuario.
 * Es la fuente de verdad que consultan los componentes y el router (guards)
 * para saber si hay un usuario logueado.
 *
 * Responsabilidad: estado reactivo + coordinar el service de auth con el de
 * settings (al entrar/salir hay que cargar o resetear las preferencias).
 * Las llamadas a la API y la persistencia local viven en auth.service.js.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authService from '../services/auth.service'
import { useSettingsStore } from '@/modules/settings/stores/settings.store'

export const useAuthStore = defineStore('auth', () => {
  // Se inicializa con la sesión guardada para que al recargar la página el
  // usuario siga apareciendo como logueado.
  const user = ref(authService.getCurrentUser())

  // true si hay un usuario en sesión. Lo usan los guards del router.
  const isAuthenticated = computed(() => !!user.value)

  /**
   * Inicia sesión y carga las preferencias del usuario recién logueado.
   *
   * @param {{email: string, password: string}} credentials
   * @returns {Promise<object>} El usuario logueado
   */
  async function login(credentials) {
    const session = await authService.login(credentials)
    user.value = session.user
    await useSettingsStore().load()
    return session.user
  }

  /**
   * Registra un usuario, deja la sesión iniciada y carga sus preferencias.
   *
   * @param {{name: string, email: string, password: string}} payload
   * @returns {Promise<object>} El usuario registrado
   */
  async function register(payload) {
    const session = await authService.register(payload)
    user.value = session.user
    await useSettingsStore().load()
    return session.user
  }

  /**
   * Cierra la sesión: limpia el service de auth, resetea las preferencias al
   * tema por defecto y vacía el usuario del estado.
   */
  function logout() {
    authService.logout()
    useSettingsStore().reset()
    user.value = null
  }

  /**
   * Actualiza el perfil del usuario y refleja el cambio en el estado.
   *
   * @param {object} patch - Campos a actualizar (name, email)
   * @returns {Promise<object>} El usuario actualizado
   */
  async function updateUser(patch) {
    const updated = await authService.updateUser(patch)
    if (updated) user.value = updated
    return updated
  }

  /**
   * Cambia la contraseña del usuario (no afecta al estado local).
   *
   * @param {object} payload - currentPassword, newPassword, confirmPassword
   * @returns {Promise<any>} Respuesta de la API
   */
  async function changePassword(payload) {
    return authService.changePassword(payload)
  }

  return { user, isAuthenticated, login, register, logout, updateUser, changePassword }
})
