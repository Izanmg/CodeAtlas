/**
 * auth.store.js
 *
 * Pinia store de autenticación. El store no contiene lógica de red ni de
 * persistencia — eso vive en `logica-temporal/auth-mock.js`. El store solo
 * mantiene el estado en memoria y delega.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '../logica-temporal/auth-mock'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(authApi.getCurrentUser())

  const isAuthenticated = computed(() => !!user.value)

  async function login(credentials) {
    const session = await authApi.login(credentials)
    user.value = session.user
    return session.user
  }

  async function register(payload) {
    const session = await authApi.register(payload)
    user.value = session.user
    return session.user
  }

  function logout() {
    authApi.logout()
    user.value = null
  }

  function updateUser(patch) {
    const updated = authApi.updateUser(patch)
    if (updated) user.value = updated
    return updated
  }

  return { user, isAuthenticated, login, register, logout, updateUser }
})
