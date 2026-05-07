<!--
  ScreenNode.vue

  Nodo de pantalla. Muestra ruta + indicador de auth (lock/external).
-->
<script setup>
import NodeShell from './NodeShell.vue'
import NodeHandles from './NodeHandles.vue'
import { Lock, ExternalLink } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })

defineProps({
  data: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})
</script>

<template>
  <NodeHandles />
  <NodeShell
    :selected="selected"
    kind="screen"
    :width="220"
    :title="data.name"
  >
    <div
      class="font-mono text-fg-muted whitespace-nowrap overflow-hidden text-ellipsis"
      :style="{
        padding: '5px 11px',
        fontSize: '10.5px',
        lineHeight: 1.35,
        borderTop: '1px solid var(--border-subtle)',
      }"
    >
      <span class="text-kind-screen mr-1.5">→</span>{{ data.route }}
    </div>
    <div
      v-if="data.requiresAuth !== undefined"
      class="font-mono text-fg-subtle uppercase flex items-center"
      :style="{
        padding: '4px 11px 6px',
        fontSize: '9.5px',
        letterSpacing: '0.06em',
        gap: '5px',
        borderTop: '1px solid var(--border-subtle)',
      }"
    >
      <Lock v-if="data.requiresAuth" :size="9" />
      <ExternalLink v-else :size="9" />
      {{ data.requiresAuth ? 'auth' : 'pública' }}
    </div>
  </NodeShell>
</template>
