<!--
  BackendNode.vue

  Nodo de módulo backend. Muestra hasta 5 endpoints con etiqueta de
  método (GET/POST/PUT/PATCH/DELETE) coloreada y la ruta. Si hay más,
  añade una fila "+ N más".
-->
<script setup>
import { computed } from 'vue'
import NodeShell from './NodeShell.vue'
import NodeHandles from './NodeHandles.vue'
import NodeFlowChips from './NodeFlowChips.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  data: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})

function onPickFlow(payload) {
  props.data._onPickFlow?.(payload)
}

const MAX = 5
const apis = computed(() => props.data.api || [])
const shown = computed(() => apis.value.slice(0, MAX))
const rest = computed(() => apis.value.length - shown.value.length)

const METHOD_COLORS = {
  GET:    'var(--kind-frontend)',
  POST:   'var(--kind-backend)',
  PUT:    'var(--kind-flow)',
  PATCH:  'var(--kind-flow)',
  DELETE: '#dc2626',
}

function methodAndPath(endpoint) {
  const [method, ...rest] = endpoint.split(' ')
  return { method, path: rest.join(' ') }
}
</script>

<template>
  <NodeHandles />
  <NodeShell
    :selected="selected"
    kind="backend"
    :width="250"
    :title="data.name"
    :count="apis.length"
    count-label="endpoints"
  >
    <div
      v-for="(endpoint, i) in shown"
      :key="i"
      class="flex items-center font-mono"
      :style="{
        padding: '4px 11px',
        gap: '6px',
        fontSize: '10.5px',
        borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
        lineHeight: 1.35,
      }"
    >
      <span
        class="font-semibold inline-block flex-shrink-0"
        :style="{
          fontSize: '9px',
          letterSpacing: '0.04em',
          width: '38px',
          color: METHOD_COLORS[methodAndPath(endpoint).method] || 'var(--fg-subtle)',
        }"
      >{{ methodAndPath(endpoint).method }}</span>
      <span
        class="text-fg-muted whitespace-nowrap overflow-hidden text-ellipsis flex-1"
      >{{ methodAndPath(endpoint).path }}</span>
    </div>
    <div
      v-if="rest > 0"
      class="font-mono text-fg-faint bg-bg-subtle"
      :style="{
        padding: '4px 11px 6px',
        fontSize: '10px',
        letterSpacing: '0.04em',
        borderTop: '1px solid var(--border-subtle)',
      }"
    >+ {{ rest }} más</div>
    <NodeFlowChips :chips="data.flowChips || []" @pick-flow="onPickFlow" />
  </NodeShell>
</template>
