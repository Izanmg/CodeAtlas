<!--
  App.vue

  Componente raíz de la aplicación. Lo único que renderiza es el <RouterView>,
  que muestra la vista correspondiente a la ruta actual.

  Su única lógica: si al arrancar ya hay sesión activa, carga las preferencias
  del usuario (tema) para aplicarlas cuanto antes.
-->
<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useSettingsStore } from '@/modules/settings/stores/settings.store'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

// Al montar la app, si hay sesión guardada, traemos las preferencias del backend.
onMounted(() => {
  if (authStore.isAuthenticated) settingsStore.load()
})
</script>

<template>
  <RouterView />
</template>
