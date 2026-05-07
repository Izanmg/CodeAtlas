<!--
  ConnectionRow.vue

  Fila de conexión clicable usada en las pestañas Resumen y Conexiones del
  side panel. Click → emite `select(c.id)` para que el panel cambie de nodo.
-->
<script setup>
import { computed } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { NODE_META } from '../../logica-temporal/node-meta'

const props = defineProps({
  c: { type: Object, required: true },           // { id, label, type, viaLabel }
  dir: { type: String, default: 'out' },          // out | in
})

defineEmits(['select'])

const meta = computed(() => NODE_META[props.c.type])
</script>

<template>
  <button
    class="flex items-center bg-surface w-full rounded text-left transition-colors duration-100 hover:bg-bg-subtle"
    :style="{
      padding: '7px 9px',
      gap: '9px',
      border: '1px solid var(--border)',
    }"
    @click="$emit('select', c.id)"
  >
    <div
      class="grid place-items-center flex-shrink-0 rounded"
      :style="{
        width: '20px',
        height: '20px',
        background: meta.bg,
        color: meta.color,
      }"
    >
      <component :is="meta.icon" :size="11" />
    </div>
    <div class="flex-1 min-w-0">
      <div
        class="text-fg font-medium whitespace-nowrap overflow-hidden text-ellipsis"
        style="font-size: 12.5px;"
      >{{ c.label }}</div>
      <div
        class="text-fg-subtle font-mono"
        style="font-size: 10.5px; letter-spacing: 0.02em;"
      >
        {{ dir === 'out' ? '→' : '←' }} {{ c.viaLabel }}
      </div>
    </div>
    <ArrowRight :size="11" class="text-fg-faint flex-shrink-0" />
  </button>
</template>
