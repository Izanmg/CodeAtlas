import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authService from '../services/auth.service'
import { useSettingsStore } from '@/modules/settings/stores/settings.store'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(authService.getCurrentUser())

  const isAuthenticated = computed(() => !!user.value)

  async function login(credentials) {
    const session = await authService.login(credentials)
    user.value = session.user
    await useSettingsStore().load()
    return session.user
  }

  async function register(payload) {
    const session = await authService.register(payload)
    user.value = session.user
    await useSettingsStore().load()
    return session.user
  }

  function logout() {
    authService.logout()
    useSettingsStore().reset()
    user.value = null
  }

  async function updateUser(patch) {
    const updated = await authService.updateUser(patch)
    if (updated) user.value = updated
    return updated
  }

  async function changePassword(payload) {
    return authService.changePassword(payload)
  }

  return { user, isAuthenticated, login, register, logout, updateUser, changePassword }
})
