<!--
  Card.vue

  Contenedor con borde y sombra. Si se pasa `hoverable` reacciona al hover
  con borde más oscuro y sombra mediana.
-->
<script setup>
defineProps({
  hoverable: { type: Boolean, default: false },
  padding: { type: Number, default: 16 },
})
</script>

<template>
  <div
    class="bg-surface rounded-lg transition-shadow duration-100"
    :class="[
      hoverable ? 'cursor-pointer hover:border-border-strong hover:shadow-md shadow-xs' : 'shadow-xs',
    ]"
    :style="{
      border: '1px solid var(--border)',
      padding: padding + 'px',
    }"
  >
    <slot />
  </div>
</template>
