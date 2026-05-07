<!--
  SectionLabel.vue

  Etiqueta de sección en mono mayúsculas con línea separadora. Compone:
    - texto principal (slot por defecto)
    - count opcional
    - acción opcional (slot `action`) a la derecha
-->
<script setup>
defineProps({
  count: { type: Number, default: undefined },
})
</script>

<template>
  <div
    class="font-mono text-fg-subtle uppercase font-medium flex items-center mb-3"
    :style="{ fontSize: '10.5px', letterSpacing: '0.06em', gap: '10px' }"
  >
    <span><slot /></span>
    <span v-if="count !== undefined" class="text-fg-faint">{{ count }}</span>
    <div class="flex-1" :style="{ height: '1px', background: 'var(--border-subtle)' }" />
    <slot name="action" />
  </div>
</template>
