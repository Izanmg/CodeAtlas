<!--
  AppShell.vue

  Layout para todas las rutas autenticadas estándar (dashboard, proyectos,
  ajustes…). Renderiza el AppTopbar y el contenido del slot.
  Las vistas de auth y la del diagrama tienen layout propio.
-->
<script setup>
import AppTopbar from './AppTopbar.vue'

defineProps({
  breadcrumbs: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-bg">
    <AppTopbar :breadcrumbs="breadcrumbs" />
    <main class="flex-1 min-w-0 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
