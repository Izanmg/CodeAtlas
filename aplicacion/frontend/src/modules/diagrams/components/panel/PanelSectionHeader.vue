<!--
  PanelSectionHeader.vue

  Cabecera de sección dentro del side panel. Mono mayúsculas, opcional
  contador a la derecha.
-->
<script setup>
defineProps({
  count: { type: [Number, undefined], default: undefined },
})
</script>

<template>
  <div
    class="font-mono text-fg-subtle uppercase flex justify-between items-center mb-2"
    :style="{ fontSize: '10px', letterSpacing: '0.08em' }"
  >
    <span><slot /></span>
    <span v-if="count !== undefined" class="text-fg-faint">{{ count }}</span>
  </div>
</template>
