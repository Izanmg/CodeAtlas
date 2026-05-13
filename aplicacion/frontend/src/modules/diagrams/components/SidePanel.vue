<!--
  SidePanel.vue

  Panel lateral derecho del canvas. Se abre cuando el usuario selecciona
  un nodo y se cierra al hacer clic en el ✕, en el lienzo o pulsando Esc.

  Tres pestañas: Resumen / Conexiones / Detalle.
-->
<script setup>
import { ref, computed, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { NODE_META } from '../core/node-meta'
import { computeConnections } from '../core/compute-connections'
import OverviewTab from './panel/OverviewTab.vue'
import ConnectionsTab from './panel/ConnectionsTab.vue'
import DetailsTab from './panel/DetailsTab.vue'

const props = defineProps({
  node: { type: Object, default: null },
  model: { type: Object, default: null },
})

defineEmits(['close', 'select'])

const tab = ref('overview')

// Cada vez que cambia el nodo seleccionado vuelve al Resumen.
watch(() => props.node?.id, () => {
  tab.value = 'overview'
})

const meta = computed(() => (props.node ? NODE_META[props.node.data.kind] : null))
const m = computed(() => props.node?.data._model ?? {})
const connections = computed(() => {
  if (!props.node) return { incoming: [], outgoing: [], total: 0 }
  return computeConnections(props.node, props.model)
})

const tabs = computed(() => [
  { id: 'overview', label: 'Resumen' },
  { id: 'connections', label: 'Conexiones', count: connections.value.total },
  { id: 'details', label: 'Detalle' },
])
</script>

<template>
  <div
    v-if="node"
    class="absolute top-0 right-0 bottom-0 z-10 bg-surface flex flex-col"
    :style="{
      width: '380px',
      maxWidth: '92vw',
      borderLeft: '1px solid var(--border)',
      boxShadow: '-12px 0 32px -16px rgba(0,0,0,0.10)',
      animation: 'ca-slide-in-r 200ms cubic-bezier(0.2,0.8,0.2,1)',
    }"
  >
    <div :style="{ padding: '14px 16px 0', borderBottom: '1px solid var(--border)' }">
      <div class="flex justify-between items-start" style="gap: 8px; margin-bottom: 10px;">
        <div class="flex items-center min-w-0" style="gap: 9px;">
          <div
            class="grid place-items-center flex-shrink-0 rounded"
            :style="{
              width: '28px',
              height: '28px',
              background: meta.bg,
              color: meta.color,
            }"
          >
            <component :is="meta.icon" :size="14" />
          </div>
          <div class="min-w-0">
            <div
              class="font-mono font-medium"
              :style="{
                fontSize: '10px',
                color: meta.color,
                letterSpacing: '0.06em',
                lineHeight: 1,
                marginBottom: '4px',
              }"
            >{{ meta.label }}</div>
            <h2
              class="text-fg font-semibold m-0 whitespace-nowrap overflow-hidden text-ellipsis"
              style="font-size: 15px; letter-spacing: -0.01em; line-height: 1.2;"
              :class="node?.data?.kind === 'file' ? 'font-mono' : ''"
            >{{ m.name || (node?.data?.kind === 'rules' ? 'Reglas del sistema' : '') }}</h2>
          </div>
        </div>
        <button
          class="text-fg-muted grid place-items-center rounded flex-shrink-0"
          style="padding: 4px;"
          @click="$emit('close')"
        >
          <X :size="14" />
        </button>
      </div>

      <p
        v-if="m.description"
        class="text-fg-muted m-0"
        style="font-size: 12.5px; margin-bottom: 12px; line-height: 1.5;"
      >{{ m.description }}</p>

      <div class="flex" style="gap: 4px; margin-top: 4px;">
        <button
          v-for="t in tabs"
          :key="t.id"
          class="inline-flex items-center"
          :style="{
            padding: '6px 8px',
            fontSize: '12.5px',
            fontWeight: tab === t.id ? 600 : 500,
            color: tab === t.id ? 'var(--fg)' : 'var(--fg-subtle)',
            borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`,
            marginBottom: '-1px',
            gap: '5px',
          }"
          @click="tab = t.id"
        >
          {{ t.label }}
          <span
            v-if="t.count !== undefined"
            class="font-mono rounded"
            :style="{
              fontSize: '10.5px',
              color: tab === t.id ? 'var(--fg-muted)' : 'var(--fg-faint)',
              background: tab === t.id ? 'var(--bg-muted)' : 'transparent',
              padding: '0 5px',
            }"
          >{{ t.count }}</span>
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto" style="padding: 16px;">
      <OverviewTab
        v-if="tab === 'overview'"
        :node="node"
        :m="m"
        :connections="connections"
        @select="(id) => $emit('select', id)"
      />
      <ConnectionsTab
        v-else-if="tab === 'connections'"
        :connections="connections"
        @select="(id) => $emit('select', id)"
      />
      <DetailsTab
        v-else-if="tab === 'details'"
        :node="node"
        :m="m"
        :model="model"
      />
    </div>
  </div>
</template>
