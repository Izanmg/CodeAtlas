<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useSettingsStore } from '@/modules/settings/stores/settings.store'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

onMounted(() => {
  if (authStore.isAuthenticated) settingsStore.load()
})
</script>

<template>
  <RouterView />
</template>
