<!--
  Badge.vue

  Etiqueta pequeña con color semántico o de tipo de bloque.
  Colores soportados: neutral, accent, backend, frontend, screen, database,
  flow, rules, success, warning, danger.
-->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: { type: String, default: 'neutral' },
  mono: { type: Boolean, default: false },
})

const colorClasses = computed(() => ({
  neutral:  'bg-bg-muted text-fg-muted',
  accent:   'bg-accent-soft text-accent',
  backend:  'bg-kind-backend-bg text-kind-backend',
  frontend: 'bg-kind-frontend-bg text-kind-frontend',
  screen:   'bg-kind-screen-bg text-kind-screen',
  database: 'bg-kind-database-bg text-kind-database',
  flow:     'bg-kind-flow-bg text-kind-flow',
  rules:    'bg-kind-rules-bg text-kind-rules',
  success:  'bg-success-bg text-success',
  warning:  'bg-warning-bg text-warning',
  danger:   'bg-danger-bg text-danger',
}[props.color] || 'bg-bg-muted text-fg-muted'))
</script>

<template>
  <span
    class="inline-flex items-center rounded font-medium"
    :class="[colorClasses, mono ? 'font-mono' : '']"
    style="padding: 1px 7px; font-size: 11px; line-height: 18px; gap: 4px;"
  >
    <slot />
  </span>
</template>
