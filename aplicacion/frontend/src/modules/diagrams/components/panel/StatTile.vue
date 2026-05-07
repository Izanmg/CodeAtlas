<!--
  StatTile.vue

  Cuadro pequeño con etiqueta mono mayúsculas y un valor grande.
  Usado en la grid de estadísticas del Resumen.
-->
<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  mono: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="rounded"
    :style="{
      padding: '8px 10px',
      background: 'var(--bg-subtle)',
      border: '1px solid var(--border-subtle)',
    }"
  >
    <div
      class="font-mono text-fg-subtle uppercase"
      :style="{ fontSize: '9.5px', letterSpacing: '0.06em', marginBottom: '3px' }"
    >{{ label }}</div>
    <div
      class="text-fg font-semibold"
      :class="mono ? 'font-mono' : 'font-sans'"
      :style="{ fontSize: '16px', lineHeight: 1.1, letterSpacing: mono ? 0 : '-0.01em' }"
    >{{ value }}</div>
  </div>
</template>
