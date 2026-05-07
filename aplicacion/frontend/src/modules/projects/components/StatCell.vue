<!--
  StatCell.vue

  Celda de estadística usada en las strips del dashboard y del detalle de
  proyecto. Tiene un icono coloreado, una etiqueta en mono mayúsculas y un
  valor grande.
-->
<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  iconColor: { type: String, default: 'var(--accent)' },
})
</script>

<template>
  <div
    class="flex items-center"
    :style="{
      padding: '14px 18px',
      borderRight: '1px solid var(--border-subtle)',
      gap: '12px',
    }"
  >
    <div
      class="grid place-items-center bg-bg-muted rounded flex-shrink-0"
      :style="{ width: '32px', height: '32px', color: iconColor }"
    >
      <slot name="icon" />
    </div>
    <div class="min-w-0">
      <div
        class="font-mono text-fg-subtle uppercase"
        :style="{ fontSize: '9.5px', letterSpacing: '0.06em' }"
      >{{ label }}</div>
      <div
        class="text-fg font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
        :style="{ fontSize: '16px', letterSpacing: '-0.01em' }"
      >{{ value }}</div>
    </div>
  </div>
</template>
