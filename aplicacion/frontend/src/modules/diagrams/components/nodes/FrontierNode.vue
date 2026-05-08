<!--
  FrontierNode.vue

  Nodo "frontera" del deep-dive: representa algo que está fuera del módulo
  pero se conecta con sus archivos. Tipos:
    - frontierType: 'screen'   → pantalla que apunta a un archivo (entrada)
    - frontierType: 'backend' / 'frontend' → módulo dependido (salida)
-->
<script setup>
import { computed } from 'vue'
import NodeHandles from './NodeHandles.vue'
import { Monitor, Server, Layout } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  data: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})

const meta = computed(() => {
  switch (props.data.frontierType) {
    case 'screen':   return { icon: Monitor, color: 'var(--kind-screen)',   label: 'screen' }
    case 'backend':  return { icon: Server,  color: 'var(--kind-backend)',  label: 'backend' }
    case 'frontend': return { icon: Layout,  color: 'var(--kind-frontend)', label: 'frontend' }
    default:         return { icon: Layout,  color: 'var(--fg-muted)',      label: '' }
  }
})
</script>

<template>
  <NodeHandles />
  <div
    class="rounded-md overflow-hidden font-sans transition-all duration-100"
    :style="{
      width: data.width + 'px',
      background: 'var(--surface)',
      border: `1px dashed ${selected ? meta.color : 'var(--border)'}`,
      boxShadow: 'var(--shadow-xs)',
    }"
  >
    <div
      class="flex items-center"
      :style="{
        padding: '7px 10px',
        gap: '8px',
      }"
    >
      <div
        class="grid place-items-center flex-shrink-0 rounded-sm"
        :style="{
          width: '20px',
          height: '20px',
          background: 'var(--bg-muted)',
          color: meta.color,
        }"
      >
        <component :is="meta.icon" :size="11" />
      </div>
      <div class="flex-1 min-w-0">
        <div
          class="font-mono uppercase"
          :style="{
            fontSize: '8.5px',
            color: meta.color,
            letterSpacing: '0.07em',
            lineHeight: 1,
            marginBottom: '2px',
          }"
        >{{ meta.label }}</div>
        <div class="text-fg font-semibold truncate" style="font-size: 11.5px;">
          {{ data.name }}
        </div>
        <div
          v-if="data.sub"
          class="text-fg-faint font-mono truncate"
          style="font-size: 10px; margin-top: 1px;"
        >{{ data.sub }}</div>
      </div>
    </div>
  </div>
</template>
